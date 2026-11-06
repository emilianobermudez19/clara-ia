// COPIA GENERADA desde src/lib/vault.ts (web). No editar aquí: edita la web y corre npm run sync-shared.
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

export interface SavedTurn {
  role: "user" | "assistant";
  text: string;
}

/** Consulta guardada por decisión de la persona (las anónimas nunca se guardan). */
export interface Consultation {
  id: string;
  date: string; // ISO
  title: string;
  turns: SavedTurn[];
}

export interface Reminder {
  id: string;
  name: string; // p. ej. "Pastilla", "PrEP", "Antibiótico"
  times: string[]; // "HH:MM"
  note: string; // indicación copiada de la receta, tal cual
  active: boolean;
}

/** Vacuna de la cartilla. "applied" con fecha, o "pending" (por aplicar o refuerzo). */
export interface Vaccine {
  id: string;
  name: string;
  status: "applied" | "pending";
  date: string; // AAAA-MM-DD, vacío si está pendiente
  dose: string; // p. ej. "1.ª dosis", "Refuerzo"
}

/** Datos de la ficha que se comparten con la IA cuando la persona activa "Usar mi ficha". */
export function healthContextFrom(p: Profile) {
  const vaccines = p.vaccines
    .map((v) => `${v.name}${v.dose ? ` ${v.dose}` : ""} (${v.status === "applied" ? `applied${v.date ? ` ${v.date}` : ""}` : "pending"})`)
    .join("; ");
  return { allergies: p.allergies, conditions: p.conditions, medications: p.medications, bloodType: p.bloodType, vaccines };
}

/** Vacunas frecuentes en adultos, para agregarlas con un toque. */
export const COMMON_VACCINES = ["VPH", "Hepatitis B", "Tétanos y difteria (Td)", "Influenza", "COVID-19", "Hepatitis A", "Sarampión, rubéola y paperas (SRP)"] as const;

export interface TeleRequest {
  id: string;
  date: string; // ISO
  specialty: string;
  reason: string;
  status: "pending";
}

/** Seguro médico de la persona. La foto de la credencial se guarda cifrada como todo lo demás. */
export interface Insurance {
  /** private: seguro privado · public: seguridad social (IMSS, ISSSTE…) · none: sin seguro · "": sin responder */
  kind: "private" | "public" | "none" | "";
  insurer: string;
  policyNumber: string;
  phone: string;
  validUntil: string; // AAAA-MM-DD
  /** Foto de la credencial (JPEG en base64, reducida). */
  cardPhoto?: string;
}

export const emptyInsurance = (): Insurance => ({ kind: "", insurer: "", policyNumber: "", phone: "", validUntil: "" });

export interface Profile {
  alias: string;
  bloodType: BloodType;
  allergies: string;
  medications: string;
  conditions: string;
  symptoms: SymptomEntry[];
  consultations: Consultation[];
  reminders: Reminder[];
  teleRequests: TeleRequest[];
  vaccines: Vaccine[];
  insurance: Insurance;
}

export interface SealedVault {
  v: 1;
  salt: string;
  iv: string;
  ciphertext: string;
}

export const emptyProfile = (alias: string): Profile => ({
  alias, bloodType: "unknown", allergies: "", medications: "", conditions: "", symptoms: [],
  consultations: [], reminders: [], teleRequests: [], vaccines: [], insurance: emptyInsurance(),
});

/** Completa fichas guardadas con versiones anteriores (sin consultas, recordatorios, etc.). */
export const normalizeProfile = (p: Partial<Profile> & { alias: string }): Profile => ({ ...emptyProfile(p.alias), ...p });

export const newId = () => crypto.getRandomValues(new Uint32Array(2)).join("-");

/** Agrega o actualiza una consulta guardada; conserva las 50 más recientes. */
export function upsertConsultation(list: Consultation[], c: Consultation): Consultation[] {
  return [c, ...list.filter((x) => x.id !== c.id)].slice(0, 50);
}

/** Próxima toma de los recordatorios activos, a partir de "ahora" (hora local). */
export function nextDose(reminders: Reminder[], now: Date): { reminder: Reminder; at: Date } | null {
  let best: { reminder: Reminder; at: Date } | null = null;
  for (const r of reminders) {
    if (!r.active) continue;
    for (const t of r.times) {
      const [h = Number.NaN, m = Number.NaN] = t.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) continue;
      const at = new Date(now);
      at.setHours(h, m, 0, 0);
      if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
      if (!best || at < best.at) best = { reminder: r, at };
    }
  }
  return best;
}

export const isValidPin = (pin: string) => /^\d{6}$/.test(pin);

// Se crean al usarse (no al cargar el módulo): la app móvil importa este archivo y su motor JS
// no garantiza TextDecoder. Las funciones de cifrado web solo corren en el navegador.
const enc = { encode: (s: string) => new TextEncoder().encode(s) };
const dec = { decode: (b: ArrayBuffer) => new TextDecoder().decode(b) };
// Sin "...spread": con fichas grandes (muchas consultas) el spread excede el límite de argumentos.
const toB64 = (b: Uint8Array) => {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};
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

async function sealJSON(value: unknown, pin: string): Promise<SealedVault> {
  if (!isValidPin(pin)) throw new Error("invalid pin");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(value))));
  return { v: 1, salt: toB64(salt), iv: toB64(iv), ciphertext: toB64(ct) };
}

async function openJSON(sealed: SealedVault, pin: string): Promise<unknown> {
  const key = await deriveKey(pin, fromB64(sealed.salt));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(sealed.iv) as BufferSource }, key, fromB64(sealed.ciphertext) as BufferSource);
  return JSON.parse(dec.decode(pt));
}

/** Credenciales de la cuenta en la nube, guardadas en el dispositivo bajo el PIN. */
export interface CloudCreds {
  email: string;
  /** Clave de acceso derivada (no la contraseña real): permite reconectar al desbloquear con el PIN. */
  authSecret: string;
  /** Clave de datos (base64). */
  dek: string;
  revision: number;
}

/** Lo que se guarda en el dispositivo, cifrado con el PIN. */
export interface LocalBundle {
  profile: Profile;
  cloud: CloudCreds | null;
}

export const sealBundle = (b: LocalBundle, pin: string) => sealJSON({ bundle: 1, ...b }, pin);

/** Abre el contenido local. Acepta el formato anterior (solo la ficha). Lanza error si el PIN es incorrecto. */
export async function openBundle(sealed: SealedVault, pin: string): Promise<LocalBundle> {
  const raw = (await openJSON(sealed, pin)) as { bundle?: number; profile?: Profile; cloud?: CloudCreds | null } & Profile;
  if (raw.bundle === 1 && raw.profile) return { profile: normalizeProfile(raw.profile), cloud: raw.cloud ?? null };
  return { profile: normalizeProfile(raw), cloud: null };
}

export const sealProfile = (profile: Profile, pin: string) => sealBundle({ profile, cloud: null }, pin);

export async function openProfile(sealed: SealedVault, pin: string): Promise<Profile> {
  return (await openBundle(sealed, pin)).profile;
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
