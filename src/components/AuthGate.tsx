import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { AUTH_COPY, CreateForm } from "@/components/Auth";
import { LogoMark } from "@/components/Logo";

// Pantalla de entrada tipo app nativa: logo centrado, PIN de 6 dígitos o crear cuenta,
// y la Consulta Express siempre abajo. Cubre la barra superior e inferior; "Salir rápido" queda visible.
export function AuthGate() {
  const { t, lang } = useI18n();
  const c = AUTH_COPY[lang];
  const vault = useVault();
  const [mode, setMode] = useState<"unlock" | "create">(vault.exists ? "unlock" : "create");
  useEffect(() => setMode(vault.exists ? "unlock" : "create"), [vault.exists]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-primary text-primary-foreground"
      style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-6 pt-16 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary-foreground/12">
            <LogoMark className="h-14 w-14 text-primary-foreground" />
          </span>
          <h1 id="gate-title" className="text-4xl font-bold tracking-tight">Chía</h1>
          <p className="text-[15px] font-medium uppercase tracking-[0.12em] opacity-85">{t.tagline}</p>
        </div>

        <section className="rounded-[28px] bg-card p-5 text-foreground shadow-xl">
          {mode === "unlock" ? (
            <PinUnlock />
          ) : (
            <>
              <h2 className="text-xl font-bold">{t.gateCreate}</h2>
              <CreateForm c={c} />
            </>
          )}
          {vault.exists && mode === "create" && (
            <button onClick={() => setMode("unlock")} className="mt-3 min-h-11 w-full text-sm font-semibold text-primary">{t.gateHaveAccount}</button>
          )}
        </section>

        <Link
          to="/chat"
          className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-primary-foreground/70 px-6 text-lg font-bold"
        >
          <Zap className="h-5 w-5" fill="currentColor" /> {t.expressTitle}
        </Link>
        <p className="mt-2 text-center text-sm opacity-85">{t.expressSub}</p>
        <Link to="/legal" className="mt-3 inline-flex min-h-11 items-center justify-center self-center text-sm underline opacity-85">{t.legalLink}</Link>
      </div>
    </div>
  );
}

// PIN con 6 casillas: se envía solo al completar el sexto dígito.
function PinUnlock() {
  const { t, lang } = useI18n();
  const c = AUTH_COPY[lang];
  const vault = useVault();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fails, setFails] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (waitUntil <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [waitUntil]);
  const wait = Math.max(0, Math.ceil((waitUntil - now) / 1000));

  const tryUnlock = async (value: string) => {
    if (busy || wait > 0) return;
    setBusy(true);
    setError("");
    try {
      await vault.unlock(value); // al resolver, la puerta se cierra y aparece el panel
    } catch {
      const n = fails + 1;
      setFails(n);
      setPin("");
      if (n % 5 === 0) { setWaitUntil(Date.now() + 30_000 * (n / 5)); setNow(Date.now()); }
      setError(c.wrongPin);
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-center text-xl font-bold">{t.gateEnter}</h2>
      <label htmlFor="gate-pin" className="sr-only">{c.pin}</label>
      <div className="relative" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          id="gate-pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          disabled={busy || wait > 0}
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPin(v);
            if (v.length === 6) void tryUnlock(v);
          }}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
        <div aria-hidden="true" className="flex justify-center gap-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className={`flex h-14 w-11 items-center justify-center rounded-2xl border-2 text-2xl ${
                i === pin.length && !busy ? "border-primary" : i < pin.length ? "border-primary bg-secondary" : "border-input"
              }`}
            >
              {i < pin.length ? "•" : ""}
            </span>
          ))}
        </div>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm font-semibold">
        {busy ? <span className="text-muted-foreground">{t.gateOpening}</span> : error ? <span className="text-destructive">{wait > 0 ? c.locked(wait) : error}</span> : null}
      </p>
      <p className="text-center text-xs text-muted-foreground">{c.biometricNext}</p>
    </div>
  );
}
