import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { openProfile, readVault, sealProfile, writeVault, deleteVault, emptyProfile, nextDose, type Profile } from "@/lib/vault";

// Sesión de "Mi espacio": la ficha descifrada y el PIN viven SOLO en memoria.
// Se bloquea sola tras 10 minutos sin uso o al recargar la página.
const AUTO_LOCK_MS = 10 * 60 * 1000;

interface VaultCtx {
  exists: boolean;
  profile: Profile | null;
  unlock(pin: string): Promise<void>;
  create(alias: string, pin: string): Promise<void>;
  update(fn: (p: Profile) => Profile): Promise<void>;
  lock(): void;
  remove(): void;
}

const Ctx = createContext<VaultCtx | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [exists, setExists] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const pinRef = useRef("");
  const lastUse = useRef(Date.now());

  useEffect(() => setExists(!!readVault()), []);

  const lock = useCallback(() => { pinRef.current = ""; setProfile(null); }, []);

  // Bloqueo automático por inactividad.
  useEffect(() => {
    if (!profile) return;
    const touch = () => { lastUse.current = Date.now(); };
    window.addEventListener("pointerdown", touch);
    window.addEventListener("keydown", touch);
    const id = window.setInterval(() => { if (Date.now() - lastUse.current > AUTO_LOCK_MS) lock(); }, 30_000);
    return () => { window.removeEventListener("pointerdown", touch); window.removeEventListener("keydown", touch); window.clearInterval(id); };
  }, [profile, lock]);

  // Recordatorios mientras la app está abierta. El aviso es discreto: no dice el medicamento.
  // (Avisos con la app cerrada requieren notificaciones push de la PWA: siguiente paso.)
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

  const value: VaultCtx = {
    exists,
    profile,
    async unlock(pin) {
      const v = readVault();
      if (!v) throw new Error("no vault");
      const p = await openProfile(v, pin);
      pinRef.current = pin;
      lastUse.current = Date.now();
      setProfile(p);
    },
    async create(alias, pin) {
      const p = emptyProfile(alias);
      writeVault(await sealProfile(p, pin));
      pinRef.current = pin;
      lastUse.current = Date.now();
      setExists(true);
      setProfile(p);
    },
    async update(fn) {
      if (!profile || !pinRef.current) return;
      const next = fn(profile);
      setProfile(next);
      writeVault(await sealProfile(next, pinRef.current));
    },
    lock,
    remove() { deleteVault(); lock(); setExists(false); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault(): VaultCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVault must be used inside VaultProvider");
  return ctx;
}

export { nextDose };
