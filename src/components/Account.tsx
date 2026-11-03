import { useState } from "react";
import { Check, Copy, KeyRound, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { CloudFailure, MIN_PASSWORD, requestPasswordReset, type CloudError } from "@/lib/cloud";
import { isValidPin } from "@/lib/vault";
import { PinInput, field, label, primaryBtn } from "@/components/Auth";

// Cuentas en la nube: crear, entrar en otro dispositivo, clave de recuperación y olvido de contraseña.
const A = {
  es: {
    alias: "Nombre o apodo",
    aliasHint: "No uses tu nombre real si no quieres.",
    email: "Correo",
    emailHint: "Para entrar desde otro teléfono y recuperar tu cuenta. Nunca lo vinculamos a tu ficha en claro.",
    password: "Contraseña",
    passwordHint: `Mínimo ${MIN_PASSWORD} caracteres. Protege y cifra tus datos: nunca llega a nuestros servidores.`,
    pin: "PIN de 6 dígitos para este teléfono",
    pinHint: "Para entrar rápido aquí. Cada teléfono tiene su propio PIN.",
    pinConfirm: "Repite el PIN",
    create: "Crear mi cuenta",
    signIn: "Entrar",
    working: "Protegiendo tus datos…",
    localOnly: "Prefiero guardar todo solo en este teléfono",
    useCloud: "Mejor crear cuenta con correo",
    haveAccount: "Ya tengo cuenta en otro teléfono",
    newAccount: "Crear cuenta nueva",
    forgot: "Olvidé mi contraseña",
    resetSent: "Te enviamos un correo. Abre el enlace desde este teléfono y ten a mano tu clave de recuperación.",
    sendReset: "Enviar enlace",
    errors: {
      "invalid-credentials": "Correo o contraseña incorrectos.",
      "email-taken": "Ese correo ya tiene cuenta. Elige \"Ya tengo cuenta\".",
      "weak-password": "La contraseña no es válida. Usa una más larga.",
      "confirm-email": "Te enviamos un correo de confirmación. Ábrelo y luego entra con \"Ya tengo cuenta\".",
      network: "Sin conexión. Revisa tu internet e intenta de nuevo.",
      unknown: "Algo falló. Intenta de nuevo en un momento.",
    } satisfies Record<CloudError, string>,
    badEmail: "Escribe un correo válido.",
    shortPassword: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`,
    pinInvalid: "El PIN debe tener 6 números.",
    pinMismatch: "Los PIN no coinciden.",
    aliasMissing: "Escribe un nombre o apodo.",
    e2e: "Cifrado de extremo a extremo: ni Chía puede leer tu ficha.",
    rkTitle: "Guarda tu clave de recuperación",
    rkBody: "Es la única forma de recuperar tus datos si olvidas tu contraseña. Anótala en papel o guárdala en un lugar seguro. No la volveremos a mostrar.",
    rkCopy: "Copiar",
    rkCopied: "Copiada",
    rkConfirm: "Ya la guardé en un lugar seguro",
    rkContinue: "Continuar",
  },
  en: {
    alias: "Name or nickname",
    aliasHint: "You don't have to use your real name.",
    email: "Email",
    emailHint: "To sign in from another phone and recover your account. Never linked to your record in readable form.",
    password: "Password",
    passwordHint: `At least ${MIN_PASSWORD} characters. It protects and encrypts your data and never reaches our servers.`,
    pin: "6-digit PIN for this phone",
    pinHint: "For quick access here. Each phone has its own PIN.",
    pinConfirm: "Repeat the PIN",
    create: "Create my account",
    signIn: "Sign in",
    working: "Protecting your data…",
    localOnly: "I'd rather keep everything only on this phone",
    useCloud: "Create an account with email instead",
    haveAccount: "I already have an account on another phone",
    newAccount: "Create a new account",
    forgot: "I forgot my password",
    resetSent: "We sent you an email. Open the link on this phone and have your recovery key ready.",
    sendReset: "Send link",
    errors: {
      "invalid-credentials": "Wrong email or password.",
      "email-taken": "That email already has an account. Choose \"I already have an account\".",
      "weak-password": "That password isn't valid. Use a longer one.",
      "confirm-email": "We sent you a confirmation email. Open it, then sign in with \"I already have an account\".",
      network: "No connection. Check your internet and try again.",
      unknown: "Something went wrong. Try again in a moment.",
    } satisfies Record<CloudError, string>,
    badEmail: "Enter a valid email.",
    shortPassword: `The password must be at least ${MIN_PASSWORD} characters.`,
    pinInvalid: "The PIN must be 6 digits.",
    pinMismatch: "PINs don't match.",
    aliasMissing: "Enter a name or nickname.",
    e2e: "End-to-end encrypted: not even Chía can read your record.",
    rkTitle: "Save your recovery key",
    rkBody: "It's the only way to recover your data if you forget your password. Write it down or store it somewhere safe. We won't show it again.",
    rkCopy: "Copy",
    rkCopied: "Copied",
    rkConfirm: "I've saved it somewhere safe",
    rkContinue: "Continue",
  },
};
export type AccountCopy = (typeof A)["es"];
export const useAccountCopy = () => A[useI18n().lang];

const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const message = (c: AccountCopy, err: unknown) => (err instanceof CloudFailure ? c.errors[err.code] : c.errors.unknown);

function Err({ text }: { text: string }) {
  return text ? <p role="alert" className="text-sm font-semibold text-destructive">{text}</p> : null;
}

function PinPair({ c, p1, p2, setP1, setP2 }: { c: AccountCopy; p1: string; p2: string; setP1: (v: string) => void; setP2: (v: string) => void }) {
  return (
    <>
      <div>
        <label htmlFor="acc-pin1" className={label}>{c.pin}</label>
        <PinInput id="acc-pin1" value={p1} onChange={setP1} />
        <p className="mt-1 text-sm text-muted-foreground">{c.pinHint}</p>
      </div>
      <div>
        <label htmlFor="acc-pin2" className={label}>{c.pinConfirm}</label>
        <PinInput id="acc-pin2" value={p2} onChange={setP2} />
      </div>
    </>
  );
}

function checkPins(c: AccountCopy, p1: string, p2: string): string {
  if (!isValidPin(p1)) return c.pinInvalid;
  if (p1 !== p2) return c.pinMismatch;
  return "";
}

/** Crear cuenta en la nube. Llama a onRecoveryKey con la clave para mostrarla una vez. */
export function CloudSignUp() {
  const c = useAccountCopy();
  const vault = useVault();
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-3 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!alias.trim()) return setError(c.aliasMissing);
        if (!validEmail(email)) return setError(c.badEmail);
        if (password.length < MIN_PASSWORD) return setError(c.shortPassword);
        const pinErr = checkPins(c, p1, p2);
        if (pinErr) return setError(pinErr);
        setBusy(true); setError("");
        try {
          await vault.signUp({ alias: alias.trim(), email, password, pin: p1 });
        } catch (err) {
          setError(message(c, err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <label htmlFor="acc-alias" className={label}>{c.alias}</label>
        <input id="acc-alias" value={alias} onChange={(e) => setAlias(e.target.value)} autoComplete="nickname" className={field} />
        <p className="mt-1 text-sm text-muted-foreground">{c.aliasHint}</p>
      </div>
      <div>
        <label htmlFor="acc-email" className={label}>{c.email}</label>
        <input id="acc-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        <p className="mt-1 text-sm text-muted-foreground">{c.emailHint}</p>
      </div>
      <div>
        <label htmlFor="acc-pass" className={label}>{c.password}</label>
        <input id="acc-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        <p className="mt-1 text-sm text-muted-foreground">{c.passwordHint}</p>
      </div>
      <PinPair c={c} p1={p1} p2={p2} setP1={setP1} setP2={setP2} />
      <Err text={error} />
      <button type="submit" disabled={busy} className={primaryBtn}>{busy ? c.working : c.create}</button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {c.e2e}</p>
    </form>
  );
}

/** Entrar a una cuenta existente desde este dispositivo. */
export function CloudSignIn() {
  const c = useAccountCopy();
  const vault = useVault();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState<"no" | "form" | "sent">("no");

  if (forgot !== "no") {
    return (
      <form
        className="mt-3 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!validEmail(email)) return setError(c.badEmail);
          setBusy(true); setError("");
          try { await requestPasswordReset(email); setForgot("sent"); } catch (err) { setError(message(c, err)); } finally { setBusy(false); }
        }}
      >
        <div>
          <label htmlFor="acc-email-r" className={label}>{c.email}</label>
          <input id="acc-email-r" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        {forgot === "sent" ? <p role="status" className="rounded-2xl bg-secondary p-3 text-sm text-secondary-foreground">{c.resetSent}</p> : null}
        <Err text={error} />
        {forgot === "form" && <button type="submit" disabled={busy} className={primaryBtn}>{c.sendReset}</button>}
        <button type="button" onClick={() => setForgot("no")} className="min-h-11 w-full text-sm font-semibold text-primary">{c.signIn}</button>
      </form>
    );
  }

  return (
    <form
      className="mt-3 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!validEmail(email)) return setError(c.badEmail);
        if (!password) return setError(c.errors["invalid-credentials"]);
        const pinErr = checkPins(c, p1, p2);
        if (pinErr) return setError(pinErr);
        setBusy(true); setError("");
        try {
          await vault.signIn({ email, password, pin: p1 });
        } catch (err) {
          setError(message(c, err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <label htmlFor="acc-email-s" className={label}>{c.email}</label>
        <input id="acc-email-s" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="acc-pass-s" className={label}>{c.password}</label>
        <input id="acc-pass-s" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
      </div>
      <PinPair c={c} p1={p1} p2={p2} setP1={setP1} setP2={setP2} />
      <Err text={error} />
      <button type="submit" disabled={busy} className={primaryBtn}>{busy ? c.working : c.signIn}</button>
      <button type="button" onClick={() => { setForgot("form"); setError(""); }} className="min-h-11 w-full text-sm font-semibold text-primary">{c.forgot}</button>
    </form>
  );
}

/** Muestra la clave de recuperación UNA vez y exige confirmar que se guardó. */
export function RecoveryKeyNotice({ recoveryKey, onDone }: { recoveryKey: string; onDone: () => void }) {
  const c = useAccountCopy();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <KeyRound className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">{c.rkTitle}</h2>
      </div>
      <p className="text-base text-muted-foreground">{c.rkBody}</p>
      <p className="select-all break-all rounded-2xl bg-secondary p-4 text-center font-mono text-lg font-bold tracking-wider text-secondary-foreground">{recoveryKey}</p>
      <button
        type="button"
        onClick={async () => { try { await navigator.clipboard.writeText(recoveryKey); setCopied(true); } catch { /* sin portapapeles */ } }}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-secondary-foreground"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? c.rkCopied : c.rkCopy}
      </button>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-foreground">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="h-5 w-5 accent-[var(--color-primary)]" />
        {c.rkConfirm}
      </label>
      <button type="button" disabled={!saved} onClick={onDone} className={primaryBtn}>{c.rkContinue}</button>
    </div>
  );
}

/** Capa encima de toda la app mientras haya una clave de recuperación sin confirmar. */
export function RecoveryKeyOverlay() {
  const vault = useVault();
  if (!vault.pendingRecoveryKey) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-5">
      <div className="w-full max-w-md rounded-[28px] bg-card p-5 shadow-xl">
        <RecoveryKeyNotice recoveryKey={vault.pendingRecoveryKey} onDone={vault.dismissRecoveryKey} />
      </div>
    </div>
  );
}
