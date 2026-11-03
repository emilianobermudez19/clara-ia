// Cuentas en la nube (Supabase) con cifrado de extremo a extremo. Ver src/lib/e2e.ts.
// Si no hay Supabase configurado, la app funciona como antes: todo queda solo en el dispositivo.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createVaultRow, decryptJSON, deriveMasterKeys, encryptJSON, fromB64, normalizeEmail, recoveryKek, toB64, unwrapKey, wrapKey,
  type Sealed, type VaultRow,
} from "@/lib/e2e";
import { emptyProfile, normalizeProfile, type CloudCreds, type Profile } from "@/lib/vault";

const URL_ = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const KEY_ = (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_ANON_KEY"]) as string | undefined;

export const isCloudEnabled = () => !!(URL_ && KEY_);

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!isCloudEnabled()) throw new Error("cloud not configured");
  // Sin sesión persistente: nada de tokens en el navegador sin cifrar. Se reconecta con el PIN.
  client ??= createClient(URL_!, KEY_!, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}

export const MIN_PASSWORD = 10;

export type CloudError = "invalid-credentials" | "email-taken" | "weak-password" | "confirm-email" | "network" | "unknown";

function classify(err: unknown): CloudError {
  const msg = (err as { message?: string })?.message?.toLowerCase() ?? "";
  if (msg.includes("invalid login")) return "invalid-credentials";
  if (msg.includes("already registered") || msg.includes("already exists")) return "email-taken";
  if (msg.includes("email not confirmed")) return "confirm-email";
  if (msg.includes("password")) return "weak-password";
  if (msg.includes("fetch") || msg.includes("network")) return "network";
  return "unknown";
}

export class CloudFailure extends Error {
  constructor(public code: CloudError) { super(code); }
}

async function fetchRow(): Promise<(VaultRow & { revision: number }) | null> {
  const { data, error } = await sb().from("vaults").select("wrapped_key, recovery_wrapped_key, data, kdf_iterations, revision, updated_at").maybeSingle();
  if (error) throw new CloudFailure(classify(error));
  return (data as (VaultRow & { revision: number }) | null) ?? null;
}

async function userId(): Promise<string> {
  const { data } = await sb().auth.getUser();
  if (!data.user) throw new CloudFailure("invalid-credentials");
  return data.user.id;
}

export interface CloudSession {
  creds: CloudCreds;
  profile: Profile;
  /** Solo cuando la bóveda se acaba de crear: se muestra UNA vez. */
  recoveryKey?: string;
}

async function createRemote(email: string, authSecret: string, kek: CryptoKey, profile: Profile): Promise<CloudSession> {
  const { row, dek, recoveryKey } = await createVaultRow(kek, profile);
  const { data, error } = await sb().from("vaults").insert({ user_id: await userId(), ...row }).select("revision").single();
  if (error) throw new CloudFailure(classify(error));
  return { creds: { email, authSecret, dek: toB64(dek), revision: (data as { revision: number }).revision }, profile, recoveryKey };
}

/** Registro. Si Supabase pide confirmar el correo, lanza CloudFailure("confirm-email"). */
export async function signUp(email: string, password: string, profile: Profile): Promise<CloudSession> {
  const e = normalizeEmail(email);
  const { authSecret, kek } = await deriveMasterKeys(e, password);
  const redirect = typeof window !== "undefined" ? `${window.location.origin}/cuenta` : undefined;
  const { data, error } = await sb().auth.signUp({ email: e, password: authSecret, options: redirect ? { emailRedirectTo: redirect } : {} });
  if (error) throw new CloudFailure(classify(error));
  if (!data.session) throw new CloudFailure("confirm-email");
  return createRemote(e, authSecret, kek, profile);
}

/** Inicio de sesión en un dispositivo nuevo. Si la cuenta aún no tiene bóveda, la crea. */
export async function signIn(email: string, password: string, aliasIfNew: string): Promise<CloudSession> {
  const e = normalizeEmail(email);
  const { authSecret, kek } = await deriveMasterKeys(e, password);
  const { error } = await sb().auth.signInWithPassword({ email: e, password: authSecret });
  if (error) throw new CloudFailure(classify(error));
  const row = await fetchRow();
  if (!row) return createRemote(e, authSecret, kek, emptyProfile(aliasIfNew));
  const dek = await unwrapKey(row.wrapped_key, kek).catch(() => { throw new CloudFailure("invalid-credentials"); });
  const profile = normalizeProfile(await decryptJSON<Profile>(row.data, dek));
  return { creds: { email: e, authSecret, dek: toB64(dek), revision: row.revision }, profile };
}

/** Reconexión silenciosa tras desbloquear con el PIN. */
export async function resume(creds: CloudCreds): Promise<void> {
  const { error } = await sb().auth.signInWithPassword({ email: creds.email, password: creds.authSecret });
  if (error) throw new CloudFailure(classify(error));
}

/** Trae la versión de la nube si es más nueva que la local (cambios desde otro dispositivo). */
export async function pullIfNewer(creds: CloudCreds): Promise<{ profile: Profile; revision: number } | null> {
  const row = await fetchRow();
  if (!row || row.revision <= creds.revision) return null;
  return { profile: normalizeProfile(await decryptJSON<Profile>(row.data, fromB64(creds.dek))), revision: row.revision };
}

/** Sube la ficha cifrada. Devuelve la nueva revisión. */
export async function push(creds: CloudCreds, profile: Profile): Promise<number> {
  const data: Sealed = await encryptJSON(profile, fromB64(creds.dek));
  const { data: out, error } = await sb().from("vaults").update({ data }).eq("user_id", await userId()).select("revision").single();
  if (error) throw new CloudFailure(classify(error));
  return (out as { revision: number }).revision;
}

/** Correo para restablecer la contraseña. Los datos se recuperan después con la clave de recuperación. */
export async function requestPasswordReset(email: string): Promise<void> {
  const redirect = `${window.location.origin}/recuperar`;
  const { error } = await sb().auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: redirect });
  if (error) throw new CloudFailure(classify(error));
}

/** Tras abrir el enlace del correo: con la clave de recuperación, fija una contraseña nueva y conserva los datos. */
export async function recoverWithKey(email: string, recoveryKey: string, newPassword: string, aliasIfNew: string): Promise<CloudSession> {
  const e = normalizeEmail(email);
  const row = await fetchRow();
  if (!row) throw new CloudFailure("invalid-credentials");
  const dek = await unwrapKey(row.recovery_wrapped_key, await recoveryKek(recoveryKey), "chia-dek-recovery-v1").catch(() => {
    throw new CloudFailure("invalid-credentials");
  });
  const { authSecret, kek } = await deriveMasterKeys(e, newPassword);
  const { error } = await sb().auth.updateUser({ password: authSecret });
  if (error) throw new CloudFailure(classify(error));
  const { data, error: e2 } = await sb()
    .from("vaults")
    .update({ wrapped_key: await wrapKey(dek, kek) })
    .eq("user_id", await userId())
    .select("revision")
    .single();
  if (e2) throw new CloudFailure(classify(e2));
  const profile = normalizeProfile(await decryptJSON<Profile>(row.data, dek).catch(() => emptyProfile(aliasIfNew)));
  return { creds: { email: e, authSecret, dek: toB64(dek), revision: (data as { revision: number }).revision }, profile };
}

/** ¿Hay una sesión de recuperación activa (se llegó desde el enlace del correo)? */
export async function hasRecoverySession(): Promise<boolean> {
  if (!isCloudEnabled()) return false;
  const { data } = await sb().auth.getSession();
  return !!data.session;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await sb().rpc("delete_my_account");
  if (error) throw new CloudFailure(classify(error));
  await sb().auth.signOut();
}

export async function signOut(): Promise<void> {
  if (isCloudEnabled()) await sb().auth.signOut().catch(() => {});
}
