import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { PinInput, field, label, primaryBtn } from "@/components/Auth";
import { useAccountCopy } from "@/components/Account";
import { CloudFailure, MIN_PASSWORD, hasRecoverySession } from "@/lib/cloud";
import { isRecoveryKeyFormat } from "@/lib/e2e";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { isValidPin } from "@/lib/vault";

// Destino del enlace "Olvidé mi contraseña". Con la clave de recuperación se fija una contraseña nueva
// y se conservan todos los datos (la clave de datos se reenvuelve; nada se descifra en el servidor).
export const Route = createFileRoute("/recuperar")({
  head: () => ({ meta: [{ title: "Recuperar cuenta — Chía" }, { name: "robots", content: "noindex" }] }),
  component: Recuperar,
});

const R = {
  es: {
    title: "Recupera tu cuenta",
    intro: "Escribe tu clave de recuperación y elige una contraseña nueva. Tus datos se conservan.",
    noLink: "Abre esta página desde el enlace que te enviamos por correo. Si ya pasó un rato, pide uno nuevo desde \"Olvidé mi contraseña\".",
    email: "Correo de la cuenta",
    key: "Clave de recuperación",
    keyPh: "XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX",
    badKey: "La clave de recuperación tiene 32 letras y números.",
    password: "Contraseña nueva",
    pin: "PIN de 6 dígitos para este teléfono",
    pinConfirm: "Repite el PIN",
    submit: "Recuperar mi cuenta",
    wrong: "Esa clave de recuperación no corresponde a esta cuenta.",
  },
  en: {
    title: "Recover your account",
    intro: "Enter your recovery key and choose a new password. Your data is kept.",
    noLink: "Open this page from the link we emailed you. If it's been a while, request a new one from \"I forgot my password\".",
    email: "Account email",
    key: "Recovery key",
    keyPh: "XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX",
    badKey: "The recovery key has 32 letters and numbers.",
    password: "New password",
    pin: "6-digit PIN for this phone",
    pinConfirm: "Repeat the PIN",
    submit: "Recover my account",
    wrong: "That recovery key doesn't match this account.",
  },
};

function Recuperar() {
  const { lang } = useI18n();
  const r = R[lang];
  const a = useAccountCopy();
  const vault = useVault();
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Supabase lee la sesión de recuperación del enlace; puede tardar un instante.
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(async () => { const ok = await hasRecoverySession().catch(() => false); if (alive) setReady(ok); }, 400);
    return () => { alive = false; window.clearTimeout(t); };
  }, []);

  return (
    <main className="safe-page mx-auto min-h-dvh max-w-md space-y-5">
      <div className="flex items-center gap-2"><KeyRound className="h-7 w-7 text-primary" /><h1 className="font-display text-3xl text-foreground">{r.title}</h1></div>
      {ready === false && <p className="rounded-2xl bg-secondary p-4 text-base text-secondary-foreground">{r.noLink}</p>}
      {ready && (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isRecoveryKeyFormat(key)) return setError(r.badKey);
            if (password.length < MIN_PASSWORD) return setError(a.shortPassword);
            if (!isValidPin(p1)) return setError(a.pinInvalid);
            if (p1 !== p2) return setError(a.pinMismatch);
            setBusy(true); setError("");
            try {
              await vault.recover({ email, recoveryKey: key, password, pin: p1 });
              void navigate({ to: "/cuenta", replace: true });
            } catch (err) {
              setError(err instanceof CloudFailure && err.code === "invalid-credentials" ? r.wrong : a.errors.unknown);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="text-base text-muted-foreground">{r.intro}</p>
          <div><label htmlFor="r-email" className={label}>{r.email}</label><input id="r-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></div>
          <div><label htmlFor="r-key" className={label}>{r.key}</label><input id="r-key" value={key} onChange={(e) => setKey(e.target.value)} placeholder={r.keyPh} autoCapitalize="characters" autoComplete="off" spellCheck={false} className={`${field} font-mono`} /></div>
          <div><label htmlFor="r-pass" className={label}>{r.password}</label><input id="r-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} /></div>
          <div><label htmlFor="r-pin1" className={label}>{r.pin}</label><PinInput id="r-pin1" value={p1} onChange={setP1} /></div>
          <div><label htmlFor="r-pin2" className={label}>{r.pinConfirm}</label><PinInput id="r-pin2" value={p2} onChange={setP2} /></div>
          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
          <button type="submit" disabled={busy} className={primaryBtn}>{busy ? a.working : r.submit}</button>
        </form>
      )}
    </main>
  );
}
