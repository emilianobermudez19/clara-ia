// "Mi espacio": cuenta opcional con ficha médica, cifrada en el dispositivo con el PIN de la persona.
// AES-GCM 256 + PBKDF2-SHA256. Nada sale del teléfono: ni Chía ni nadie puede leer la ficha.
// Fase siguiente: sincronización cifrada con Supabase (mismo formato) y desbloqueo con passkey/biometría.

export const VAULT_KEY = "chia-vault";
const ITERATIONS = 600_000;

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] as const;
export type BloodType = (typeof BLOOD_TYPES)[number];

export interface SymptomEntry {
  date: string; // AAAA-MM-DD
  text: string;
}

export interface Profile {
  alias: string;
  bloodType: BloodType;
  allergies: string;
  medications: string;
  conditions: string;
  symptoms: SymptomEntry[];
}

export interface SealedVault {
  v: 1;
  salt: string;
  iv: string;
  ciphertext: string;
}

export const emptyProfile = (alias: string): Profile => ({
  alias, bloodType: "unknown", allergies: "", medications: "", conditions: "", symptoms: [],
});

export const isValidPin = (pin: string) => /^\d{6}$/.test(pin);

const enc = new TextEncoder();
const dec = new TextDecoder();
const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function sealProfile(profile: Profile, pin: string): Promise<SealedVault> {
  if (!isValidPin(pin)) throw new Error("invalid pin");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(profile))));
  return { v: 1, salt: toB64(salt), iv: toB64(iv), ciphertext: toB64(ct) };
}

/** Lanza error si el PIN es incorrecto o los datos fueron alterados. */
export async function openProfile(sealed: SealedVault, pin: string): Promise<Profile> {
  const key = await deriveKey(pin, fromB64(sealed.salt));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(sealed.iv) }, key, fromB64(sealed.ciphertext));
  return JSON.parse(dec.decode(pt)) as Profile;
}

export function readVault(): SealedVault | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    const v = raw ? (JSON.parse(raw) as SealedVault) : null;
    return v && v.v === 1 ? v : null;
  } catch {
    return null;
  }
}

export function writeVault(v: SealedVault) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(v));
}

export function deleteVault() {
  try { localStorage.removeItem(VAULT_KEY); } catch { /* noop */ }
}
