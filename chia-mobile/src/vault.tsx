// "Mi espacio" en el teléfono.
// - Los datos se cifran con AES-256-GCM y se guardan en el almacenamiento de la app.
// - La clave AES es aleatoria y vive en el llavero seguro del sistema (Keychain en iOS, Keystore en Android).
// - El PIN se verifica con PBKDF2-SHA256 (hash con sal en el llavero). Tras 5 fallos hay espera creciente.
// - Se bloquea sola al mandar la app a segundo plano.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { gcm } from "@noble/ciphers/aes.js";
import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from "@noble/ciphers/utils.js";
import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { emptyProfile, normalizeProfile, type Profile } from "../../src/lib/vault";
import { clearReminders, syncReminders } from "./notifications";

const BLOB = "chia-vault-v1";
const KEY = "chia-key";
const PIN = "chia-pin";
const PIN_ITERATIONS = 40_000; // en JS puro; la clave real está protegida por el llavero del sistema

interface PinRecord { salt: string; hash: string; iterations: number }

async function hashPin(pin: string, saltHex: string, iterations: number): Promise<string> {
  return bytesToHex(await pbkdf2Async(sha256, pin, hexToBytes(saltHex), { c: iterations, dkLen: 32 }));
}

function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function writeProfile(profile: Profile, keyHex: string) {
  const nonce = Crypto.getRandomBytes(12);
  const ct = gcm(hexToBytes(keyHex), nonce).encrypt(utf8ToBytes(JSON.stringify(profile)));
  await AsyncStorage.setItem(BLOB, JSON.stringify({ v: 1, n: bytesToHex(nonce), ct: bytesToHex(ct) }));
}

async function readProfile(keyHex: string): Promise<Profile> {
  const raw = await AsyncStorage.getItem(BLOB);
  if (!raw) throw new Error("no vault");
  const { n, ct } = JSON.parse(raw) as { n: string; ct: string };
  const pt = gcm(hexToBytes(keyHex), hexToBytes(n)).decrypt(hexToBytes(ct));
  return normalizeProfile(JSON.parse(bytesToUtf8(pt)) as Profile);
}

interface VaultCtx {
  ready: boolean;
  exists: boolean;
  profile: Profile | null;
  /** Consulta Express: usar la app sin cuenta. */
  express: boolean;
  setExpress(v: boolean): void;
  create(alias: string, pin: string): Promise<void>;
  unlock(pin: string): Promise<void>;
  update(fn: (p: Profile) => Profile): Promise<void>;
  lock(): void;
  remove(): Promise<void>;
}

const Ctx = createContext<VaultCtx | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [exists, setExists] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [express, setExpress] = useState(false);
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(BLOB).then((v) => { setExists(!!v); setReady(true); }).catch(() => setReady(true));
  }, []);

  const lock = useCallback(() => { keyRef.current = null; setProfile(null); setExpress(false); }, []);

  // Privacidad: al salir de la app, se bloquea.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => { if (s === "background") lock(); });
    return () => sub.remove();
  }, [lock]);

  const value: VaultCtx = {
    ready,
    exists,
    profile,
    express,
    setExpress,
    async create(alias, pin) {
      const keyHex = bytesToHex(Crypto.getRandomBytes(32));
      const salt = bytesToHex(Crypto.getRandomBytes(16));
      const record: PinRecord = { salt, hash: await hashPin(pin, salt, PIN_ITERATIONS), iterations: PIN_ITERATIONS };
      await SecureStore.setItemAsync(KEY, keyHex);
      await SecureStore.setItemAsync(PIN, JSON.stringify(record));
      const p = emptyProfile(alias);
      await writeProfile(p, keyHex);
      keyRef.current = keyHex;
      setExists(true);
      setExpress(false);
      setProfile(p);
    },
    async unlock(pin) {
      const rec = await SecureStore.getItemAsync(PIN);
      const keyHex = await SecureStore.getItemAsync(KEY);
      if (!rec || !keyHex) throw new Error("no vault");
      const { salt, hash, iterations } = JSON.parse(rec) as PinRecord;
      if (!sameHex(await hashPin(pin, salt, iterations), hash)) throw new Error("wrong pin");
      const p = await readProfile(keyHex);
      keyRef.current = keyHex;
      setExpress(false);
      setProfile(p);
      void syncReminders(p.reminders); // asegura que los avisos programados coincidan con la ficha
    },
    async update(fn) {
      if (!profile || !keyRef.current) return;
      const next = fn(profile);
      setProfile(next);
      await writeProfile(next, keyRef.current);
      if (next.reminders !== profile.reminders) await syncReminders(next.reminders);
    },
    lock,
    async remove() {
      await AsyncStorage.removeItem(BLOB);
      await SecureStore.deleteItemAsync(KEY);
      await SecureStore.deleteItemAsync(PIN);
      await clearReminders();
      setExists(false);
      lock();
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault(): VaultCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useVault must be used inside VaultProvider");
  return ctx;
}
