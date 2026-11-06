import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  deleteVault, emptyProfile, nextDose, openBundle, readVault, sealBundle, writeVault,
  type CloudCreds, type LocalBundle, type Profile,
} from "@/lib/vault";
import * as cloud from "@/lib/cloud";

// Sesión de "Mi espacio".
// - La ficha descifrada, el PIN y las claves viven SOLO en memoria; se bloquea a los 10 min sin uso o al recargar.
// - En el dispositivo todo se guarda cifrado con el PIN.
// - Con cuenta en la nube, cada cambio se sube cifrado de extremo a extremo (ver src/lib/e2e.ts).
const AUTO_LOCK_MS = 10 * 60 * 1000;
const PUSH_DELAY_MS = 1500;

export type SyncState = "local" | "synced" | "syncing" | "offline";

interface VaultCtx {
  exists: boolean;
  profile: Profile | null;
  /** Correo de la cuenta en la nube, si la hay. */
  account: string | null;
  sync: SyncState;
  cloudEnabled: boolean;
  /** Clave de recuperación recién creada, pendiente de que la persona confirme que la guardó. */
  pendingRecoveryKey: string | null;
  dismissRecoveryKey(): void;
  unlock(pin: string): Promise<void>;
  /** Solo en este dispositivo (sin nube). */
  create(alias: string, pin: string): Promise<void>;
  /** Cuenta nueva en la nube. Devuelve la clave de recuperación para mostrarla una vez. */
  signUp(opts: { alias: string; email: string; password: string; pin: string }): Promise<string | undefined>;
  /** Entrar a una cuenta existente desde este dispositivo y fijar su PIN local. */
  signIn(opts: { email: string; password: string; pin: string }): Promise<string | undefined>;
  /** Terminar la recuperación de una cuenta (desde el enlace del correo). */
  recover(opts: { email: string; recoveryKey: string; password: string; pin: string }): Promise<void>;
  update(fn: (p: Profile) => Profile): Promise<void>;
  lock(): void;
  remove(): Promise<void>;
}

const Ctx = createContext<VaultCtx | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [exists, setExists] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncState>("local");
  const [pendingRecoveryKey, setPendingRecoveryKey] = useState<string | null>(null);

  const pinRef = useRef("");
  const profileRef = useRef<Profile | null>(null);
  const credsRef = useRef<CloudCreds | null>(null);
  const lastUse = useRef(Date.now());
  const writeChain = useRef<Promise<void>>(Promise.resolve());
  const pushTimer = useRef<number | undefined>(undefined);

  useEffect(() => setExists(!!readVault()), []);

  const lock = useCallback(() => {
    window.clearTimeout(pushTimer.current);
    pinRef.current = "";
    profileRef.current = null;
    credsRef.current = null;
    setProfile(null);
    setAccount(null);
    setSync("local");
    void cloud.signOut();
  }, []);

  // Bloqueo automático por inactividad.
  useEffect(() => {
    if (!profile) return;
    const touch = () => { lastUse.current = Date.now(); };
    window.addEventListener("pointerdown", touch);
    window.addEventListener("keydown", touch);
    const id = window.setInterval(() => { if (Date.now() - lastUse.current > AUTO_LOCK_MS) lock(); }, 30_000);
    return () => { window.removeEventListener("pointerdown", touch); window.removeEventListener("keydown", touch); window.clearInterval(id); };
  }, [profile, lock]);

  // Recordatorios mientras la app está abierta (con la app cerrada: push, ver src/lib/push.ts).
  useEffect(() => {
    if (!profile?.reminders.some((r) => r.active)) return;
    let fired = "";
    const id = window.setInterval(() => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const due = profile.reminders.some((r) => r.active && r.times.includes(hhmm));
      if (due && fired !== hhmm && typeof Notification !== "undefined" && Notification.permission === "granted") {
        fired = hhmm;
        new Notification("Chía", { body: "Tienes un recordatorio pendiente." });
      }
    }, 20_000);
    return () => window.clearInterval(id);
  }, [profile]);

  /** Guarda en el dispositivo (en orden, sin pisar escrituras anteriores). */
  const saveLocal = useCallback((bundle: LocalBundle, pin: string) => {
    writeChain.current = writeChain.current.then(async () => writeVault(await sealBundle(bundle, pin))).catch(() => {});
    return writeChain.current;
  }, []);

  /** Sube a la nube unos segundos después del último cambio (agrupa ediciones seguidas). */
  const schedulePush = useCallback(() => {
    if (!credsRef.current) return;
    window.clearTimeout(pushTimer.current);
    setSync("syncing");
    pushTimer.current = window.setTimeout(async () => {
      const creds = credsRef.current;
      const p = profileRef.current;
      if (!creds || !p) return;
      try {
        const revision = await cloud.push(creds, p);
        credsRef.current = { ...creds, revision };
        await saveLocal({ profile: p, cloud: credsRef.current }, pinRef.current);
        setSync("synced");
      } catch {
        setSync("offline"); // se reintenta en el siguiente cambio o al volver a entrar
      }
    }, PUSH_DELAY_MS);
  }, [saveLocal]);

  const open = useCallback(async (bundle: LocalBundle, pin: string) => {
    pinRef.current = pin;
    profileRef.current = bundle.profile;
    credsRef.current = bundle.cloud;
    lastUse.current = Date.now();
    setProfile(bundle.profile);
    setAccount(bundle.cloud?.email ?? null);
    setSync(bundle.cloud ? "synced" : "local");
    setExists(true);
    await saveLocal(bundle, pin);
  }, [saveLocal]);

  const value: VaultCtx = {
    exists,
    profile,
    account,
    sync,
    cloudEnabled: cloud.isCloudEnabled(),
    pendingRecoveryKey,
    dismissRecoveryKey: () => setPendingRecoveryKey(null),

    async unlock(pin) {
      const v = readVault();
      if (!v) throw new Error("no vault");
      const bundle = await openBundle(v, pin);
      await open(bundle, pin);
      // Con cuenta: reconecta y trae cambios hechos desde otro dispositivo.
      if (bundle.cloud && cloud.isCloudEnabled()) {
        setSync("syncing");
        try {
          await cloud.resume(bundle.cloud);
          const newer = await cloud.pullIfNewer(bundle.cloud);
          if (newer) {
            credsRef.current = { ...bundle.cloud, revision: newer.revision };
            profileRef.current = newer.profile;
            setProfile(newer.profile);
            await saveLocal({ profile: newer.profile, cloud: credsRef.current }, pin);
          }
          setSync("synced");
        } catch {
          setSync("offline");
        }
      }
    },

    async create(alias, pin) {
      await open({ profile: emptyProfile(alias), cloud: null }, pin);
    },

    async signUp({ alias, email, password, pin }) {
      const s = await cloud.signUp(email, password, emptyProfile(alias));
      if (s.recoveryKey) setPendingRecoveryKey(s.recoveryKey);
      await open({ profile: s.profile, cloud: s.creds }, pin);
      return s.recoveryKey;
    },

    async signIn({ email, password, pin }) {
      const alias = email.split("@")[0] ?? "Chía";
      const s = await cloud.signIn(email, password, alias);
      if (s.recoveryKey) setPendingRecoveryKey(s.recoveryKey);
      await open({ profile: s.profile, cloud: s.creds }, pin);
      return s.recoveryKey;
    },

    async recover({ email, recoveryKey, password, pin }) {
      const s = await cloud.recoverWithKey(email, recoveryKey, password, email.split("@")[0] ?? "Chía");
      await open({ profile: s.profile, cloud: s.creds }, pin);
    },

    async update(fn) {
      const cur = profileRef.current;
      if (!cur || !pinRef.current) return;
      const next = fn(cur); // siempre sobre la versión más reciente
      profileRef.current = next;
      setProfile(next);
      await saveLocal({ profile: next, cloud: credsRef.current }, pinRef.current);
      schedulePush();
    },

    lock,

    async remove() {
      if (credsRef.current && cloud.isCloudEnabled()) await cloud.deleteAccount();
      deleteVault();
      lock();
      setExists(false);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault(): VaultCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVault must be used inside VaultProvider");
  return ctx;
}

export { nextDose };
