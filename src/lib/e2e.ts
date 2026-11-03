// Cifrado de extremo a extremo para "Mi espacio" en la nube (Supabase).
//
//  contraseña + correo ──PBKDF2 (600 000)──▶ clave maestra ──HKDF──┬─▶ authSecret  (se usa como contraseña en Supabase)
//                                                                 └─▶ KEK          (nunca sale del dispositivo)
//  clave de datos (DEK, AES-256 aleatoria) ── cifra la ficha
//  DEK envuelta con la KEK            → columna wrapped_key
//  DEK envuelta con la clave de recuperación → columna recovery_wrapped_key
//
// El servidor solo ve: authSecret (que Supabase vuelve a hashear), datos cifrados y claves envueltas.
// Ni Chía ni un atacante con acceso a la base pueden leer las fichas.

export const KDF_ITERATIONS = 600_000;

const te = () => new TextEncoder();
const td = () => new TextDecoder();
const subtle = () => globalThis.crypto.subtle;
const random = (n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n));

export const toB64 = (b: Uint8Array): string => {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
};
export const fromB64 = (s: string): Uint8Array => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export interface Sealed {
  iv: string;
  ct: string;
}

export interface MasterKeys {
  /** Se envía a Supabase como contraseña. No permite descifrar nada. */
  authSecret: string;
  /** Envuelve la clave de datos. Nunca sale del dispositivo. */
  kek: CryptoKey;
}

async function hkdfBytes(ikm: CryptoKey, info: string, length: number): Promise<Uint8Array> {
  const bits = await subtle().deriveBits({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: te().encode(info) }, ikm, length * 8);
  return new Uint8Array(bits);
}

async function aesKey(raw: Uint8Array, extractable = false): Promise<CryptoKey> {
  return subtle().importKey("raw", raw as BufferSource, { name: "AES-GCM" }, extractable, ["encrypt", "decrypt"]);
}

/** Deriva las claves de acceso y de cifrado a partir del correo y la contraseña. */
export async function deriveMasterKeys(email: string, password: string, iterations = KDF_ITERATIONS): Promise<MasterKeys> {
  const base = await subtle().importKey("raw", te().encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = te().encode(`chia:v1:${normalizeEmail(email)}`);
  const master = new Uint8Array(await subtle().deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base, 256));
  const ikm = await subtle().importKey("raw", master, "HKDF", false, ["deriveBits"]);
  const authSecret = toHex(await hkdfBytes(ikm, "chia-auth-v1", 32));
  const kek = await aesKey(await hkdfBytes(ikm, "chia-enc-v1", 32));
  return { authSecret, kek };
}

export const generateDataKey = (): Uint8Array => random(32);

async function seal(key: CryptoKey, data: Uint8Array, aad: string): Promise<Sealed> {
  const iv = random(12);
  const ct = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv, additionalData: te().encode(aad) }, key, data as BufferSource));
  return { iv: toB64(iv), ct: toB64(ct) };
}

async function open(key: CryptoKey, s: Sealed, aad: string): Promise<Uint8Array> {
  const pt = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(s.iv) as BufferSource, additionalData: te().encode(aad) }, key, fromB64(s.ct) as BufferSource);
  return new Uint8Array(pt);
}

/** Envuelve la clave de datos. `aad` liga el resultado a su uso para que no se pueda intercambiar. */
export const wrapKey = (dek: Uint8Array, kek: CryptoKey, aad = "chia-dek-v1") => seal(kek, dek, aad);
export const unwrapKey = (s: Sealed, kek: CryptoKey, aad = "chia-dek-v1") => open(kek, s, aad);

export async function encryptJSON(value: unknown, dek: Uint8Array): Promise<Sealed> {
  return seal(await aesKey(dek), te().encode(JSON.stringify(value)), "chia-vault-v1");
}

export async function decryptJSON<T>(s: Sealed, dek: Uint8Array): Promise<T> {
  return JSON.parse(td().decode(await open(await aesKey(dek), s, "chia-vault-v1"))) as T;
}

// ── Clave de recuperación ───────────────────────────────────────────
// 160 bits aleatorios en base32 legible: "ABCD-EFGH-…" (8 grupos de 4). Se muestra una sola vez.
const B32 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin I, O, 0, 1 para evitar confusiones

export function generateRecoveryKey(): string {
  const bytes = random(20);
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  return out.match(/.{4}/g)!.join("-");
}

export const normalizeRecoveryKey = (k: string) => k.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const isRecoveryKeyFormat = (k: string) => {
  const n = normalizeRecoveryKey(k);
  return n.length === 32 && [...n].every((c) => B32.includes(c));
};

/** Clave AES derivada de la clave de recuperación (ya tiene 160 bits de entropía: basta HKDF). */
export async function recoveryKek(recoveryKey: string): Promise<CryptoKey> {
  const ikm = await subtle().importKey("raw", te().encode(normalizeRecoveryKey(recoveryKey)), "HKDF", false, ["deriveBits"]);
  return aesKey(await hkdfBytes(ikm, "chia-recovery-v1", 32));
}

/** Lo que se guarda en la tabla `vaults` (todo opaco para el servidor). */
export interface VaultRow {
  wrapped_key: Sealed;
  recovery_wrapped_key: Sealed;
  data: Sealed;
  kdf_iterations: number;
  updated_at?: string;
}

/** Crea una bóveda nueva: clave de datos, sus dos envolturas y la clave de recuperación para mostrar. */
export async function createVaultRow(kek: CryptoKey, profile: unknown): Promise<{ row: VaultRow; dek: Uint8Array; recoveryKey: string }> {
  const dek = generateDataKey();
  const recoveryKey = generateRecoveryKey();
  const row: VaultRow = {
    wrapped_key: await wrapKey(dek, kek),
    recovery_wrapped_key: await wrapKey(dek, await recoveryKek(recoveryKey), "chia-dek-recovery-v1"),
    data: await encryptJSON(profile, dek),
    kdf_iterations: KDF_ITERATIONS,
  };
  return { row, dek, recoveryKey };
}
