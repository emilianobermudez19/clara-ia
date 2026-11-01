import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ShieldCheck, Trash2, Plus } from "lucide-react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";
import {
  BLOOD_TYPES, deleteVault, emptyProfile, isValidPin, openProfile, readVault, sealProfile, writeVault,
  type BloodType, type Profile,
} from "@/lib/vault";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi espacio — Chía" },
      { name: "description", content: "Cuenta opcional con ficha médica cifrada en tu dispositivo." },
      { property: "og:title", content: "Mi espacio — Chía" },
      { property: "og:description", content: "Tu ficha médica, protegida con tu PIN." },
    ],
  }),
  component: Cuenta,
});

const C = {
  es: {
    title: "Mi espacio",
    intro: "Opcional. Guarda tu ficha médica básica para llevarla a una consulta. Se cifra con tu PIN y nunca sale de este teléfono.",
    anon: "Para dudas sensibles, la consulta anónima sigue sin cuenta.",
    anonCta: "Ir a consulta anónima",
    alias: "Nombre o apodo",
    aliasHint: "No uses tu nombre real si no quieres.",
    pin: "PIN de 6 dígitos",
    pinConfirm: "Repite el PIN",
    pinWarn: "Si olvidas el PIN no hay forma de recuperar la ficha: ni nosotros podemos abrirla.",
    create: "Crear mi espacio",
    unlock: "Desbloquear",
    unlockTitle: (a?: string) => (a ? `Hola de nuevo` : "Desbloquea tu espacio"),
    wrongPin: "PIN incorrecto.",
    locked: (s: number) => `Demasiados intentos. Espera ${s} s.`,
    pinMismatch: "Los PIN no coinciden.",
    pinInvalid: "El PIN debe tener 6 números.",
    aliasMissing: "Escribe un nombre o apodo.",
    working: "Protegiendo…",
    sheet: "Ficha médica",
    blood: "Tipo de sangre",
    unknown: "No lo sé",
    allergies: "Alergias",
    allergiesPh: "Ej. penicilina, látex",
    meds: "Medicamentos que tomas",
    medsPh: "Nombre y para qué",
    conditions: "Condiciones de salud",
    conditionsPh: "Ej. asma, diabetes",
    symptoms: "Diario de síntomas",
    symptomPh: "¿Qué sentiste hoy?",
    add: "Agregar",
    noSymptoms: "Sin registros todavía.",
    save: "Guardar ficha",
    saved: "Guardado y cifrado.",
    lock: "Bloquear",
    remove: "Borrar mi espacio",
    removeConfirm: "¿Borrar tu ficha de este teléfono? No se puede deshacer.",
    biometricNext: "Desbloqueo con huella o rostro: próximamente.",
    privacy: "Cifrado AES-256 en tu dispositivo",
  },
  en: {
    title: "My space",
    intro: "Optional. Keep a basic health record to bring to an appointment. It's encrypted with your PIN and never leaves this phone.",
    anon: "For sensitive questions, the anonymous chat still needs no account.",
    anonCta: "Go to anonymous chat",
    alias: "Name or nickname",
    aliasHint: "You don't have to use your real name.",
    pin: "6-digit PIN",
    pinConfirm: "Repeat the PIN",
    pinWarn: "If you forget the PIN, the record can't be recovered: not even we can open it.",
    create: "Create my space",
    unlock: "Unlock",
    unlockTitle: (a?: string) => (a ? "Welcome back" : "Unlock your space"),
    wrongPin: "Wrong PIN.",
    locked: (s: number) => `Too many attempts. Wait ${s} s.`,
    pinMismatch: "PINs don't match.",
    pinInvalid: "The PIN must be 6 digits.",
    aliasMissing: "Enter a name or nickname.",
    working: "Protecting…",
    sheet: "Health record",
    blood: "Blood type",
    unknown: "I don't know",
    allergies: "Allergies",
    allergiesPh: "E.g. penicillin, latex",
    meds: "Medicines you take",
    medsPh: "Name and what for",
    conditions: "Health conditions",
    conditionsPh: "E.g. asthma, diabetes",
    symptoms: "Symptom diary",
    symptomPh: "What did you feel today?",
    add: "Add",
    noSymptoms: "No entries yet.",
    save: "Save record",
    saved: "Saved and encrypted.",
    lock: "Lock",
    remove: "Delete my space",
    removeConfirm: "Delete your record from this phone? This can't be undone.",
    biometricNext: "Fingerprint or face unlock: coming soon.",
    privacy: "AES-256 encrypted on your device",
  },
};

const field = "w-full rounded-2xl border-[1.5px] border-input bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const label = "mb-1.5 block text-sm font-semibold text-foreground";
const primaryBtn = "flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-50";

function PinInput({ id, value, onChange, autoFocus }: { id: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <input
      id={id}
      type="password"
      inputMode="numeric"
      autoComplete="off"
      maxLength={6}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      className={`${field} text-center text-2xl tracking-[0.6em]`}
    />
  );
}

type Stage = "loading" | "create" | "locked" | "open";

function Cuenta() {
  const { lang } = useI18n();
  const c = C[lang];
  const [stage, setStage] = useState<Stage>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pin, setPin] = useState(""); // en memoria solo mientras está abierto, para volver a cifrar al guardar
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setStage(readVault() ? "locked" : "create"), []);

  const lock = () => { setProfile(null); setPin(""); setStage("locked"); };

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-32 pt-24">
      <h1 className="font-display text-3xl text-foreground">{c.title}</h1>

      {stage === "create" && (
        <CreateForm c={c} busy={busy} error={error} onSubmit={async (alias, p1, p2) => {
          if (!alias.trim()) return setError(c.aliasMissing);
          if (!isValidPin(p1)) return setError(c.pinInvalid);
          if (p1 !== p2) return setError(c.pinMismatch);
          setBusy(true); setError("");
          const fresh = emptyProfile(alias.trim());
          writeVault(await sealProfile(fresh, p1));
          setProfile(fresh); setPin(p1); setStage("open"); setBusy(false);
        }} />
      )}

      {stage === "locked" && (
        <UnlockForm c={c} onOpen={(p, thePin) => { setProfile(p); setPin(thePin); setStage("open"); }} />
      )}

      {stage === "open" && profile && (
        <Sheet
          c={c}
          profile={profile}
          onSave={async (p) => { writeVault(await sealProfile(p, pin)); setProfile(p); }}
          onLock={lock}
          onDelete={() => { if (window.confirm(c.removeConfirm)) { deleteVault(); setProfile(null); setPin(""); setStage("create"); } }}
        />
      )}

      <div className="mt-8 rounded-[20px] bg-secondary p-4 text-secondary-foreground">
        <p className="text-sm">{c.anon}</p>
        <Link to="/chat" className="mt-2 inline-flex min-h-11 items-center font-semibold underline">{c.anonCta}</Link>
      </div>
      <BottomNav active="cuenta" />
    </main>
  );
}

type Copy = (typeof C)["es"];

function CreateForm({ c, busy, error, onSubmit }: { c: Copy; busy: boolean; error: string; onSubmit: (alias: string, p1: string, p2: string) => void }) {
  const [alias, setAlias] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  return (
    <form className="mt-3 space-y-5" onSubmit={(e) => { e.preventDefault(); onSubmit(alias, p1, p2); }}>
      <p className="text-base text-muted-foreground">{c.intro}</p>
      <div>
        <label htmlFor="alias" className={label}>{c.alias}</label>
        <input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} autoComplete="off" className={field} />
        <p className="mt-1 text-sm text-muted-foreground">{c.aliasHint}</p>
      </div>
      <div>
        <label htmlFor="pin1" className={label}>{c.pin}</label>
        <PinInput id="pin1" value={p1} onChange={setP1} />
      </div>
      <div>
        <label htmlFor="pin2" className={label}>{c.pinConfirm}</label>
        <PinInput id="pin2" value={p2} onChange={setP2} />
      </div>
      <p className="rounded-2xl bg-muted p-3 text-sm text-foreground">{c.pinWarn}</p>
      {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
      <button type="submit" disabled={busy} className={primaryBtn}>{busy ? c.working : c.create}</button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" /> {c.privacy}</p>
    </form>
  );
}

function UnlockForm({ c, onOpen }: { c: Copy; onOpen: (p: Profile, pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fails, setFails] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (waitUntil <= Date.now()) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [waitUntil]);
  const wait = Math.max(0, Math.ceil((waitUntil - now) / 1000));

  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const vault = readVault();
        if (!vault || wait > 0 || !isValidPin(pin)) return;
        setBusy(true); setError("");
        try {
          onOpen(await openProfile(vault, pin), pin);
        } catch {
          const n = fails + 1;
          setFails(n);
          setPin("");
          // Cada 5 intentos fallidos, espera creciente (30 s, 60 s, …).
          if (n % 5 === 0) { const until = Date.now() + 30_000 * (n / 5); setWaitUntil(until); setNow(Date.now()); }
          setError(c.wrongPin);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex flex-col items-center gap-3 rounded-[20px] bg-secondary p-6 text-secondary-foreground">
        <Lock className="h-8 w-8" />
        <p className="text-lg font-bold">{c.unlockTitle()}</p>
      </div>
      <div>
        <label htmlFor="pin" className={label}>{c.pin}</label>
        <PinInput id="pin" value={pin} onChange={setPin} autoFocus />
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-destructive">{wait > 0 ? c.locked(wait) : error}</p>}
      <button type="submit" disabled={busy || wait > 0 || pin.length !== 6} className={primaryBtn}>{busy ? c.working : c.unlock}</button>
      <p className="text-center text-xs text-muted-foreground">{c.biometricNext}</p>
    </form>
  );
}

function Sheet({ c, profile, onSave, onLock, onDelete }: {
  c: Copy;
  profile: Profile;
  onSave: (p: Profile) => Promise<void>;
  onLock: () => void;
  onDelete: () => void;
}) {
  const { lang } = useI18n();
  const [p, setP] = useState(profile);
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setP((x) => ({ ...x, [k]: v })); setStatus("idle"); };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mt-3 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-base text-muted-foreground">{c.unlockTitle(p.alias)}, <strong className="text-foreground">{p.alias}</strong></p>
        <button onClick={onLock} className="flex min-h-11 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground">
          <Lock className="h-4 w-4" /> {c.lock}
        </button>
      </div>

      <section className="space-y-4 rounded-[20px] border border-border bg-card p-4">
        <h2 className="text-lg font-bold text-foreground">{c.sheet}</h2>
        <div>
          <label htmlFor="blood" className={label}>{c.blood}</label>
          <select id="blood" value={p.bloodType} onChange={(e) => set("bloodType", e.target.value as BloodType)} className={field}>
            {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b === "unknown" ? c.unknown : b}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="allergies" className={label}>{c.allergies}</label>
          <input id="allergies" value={p.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder={c.allergiesPh} className={field} />
        </div>
        <div>
          <label htmlFor="meds" className={label}>{c.meds}</label>
          <textarea id="meds" rows={2} value={p.medications} onChange={(e) => set("medications", e.target.value)} placeholder={c.medsPh} className={field} />
        </div>
        <div>
          <label htmlFor="conditions" className={label}>{c.conditions}</label>
          <input id="conditions" value={p.conditions} onChange={(e) => set("conditions", e.target.value)} placeholder={c.conditionsPh} className={field} />
        </div>
      </section>

      <section className="space-y-3 rounded-[20px] border border-border bg-card p-4">
        <h2 className="text-lg font-bold text-foreground">{c.symptoms}</h2>
        <form className="flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          if (!entry.trim()) return;
          set("symptoms", [{ date: today, text: entry.trim() }, ...p.symptoms]);
          setEntry("");
        }}>
          <label htmlFor="symptom" className="sr-only">{c.symptomPh}</label>
          <input id="symptom" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder={c.symptomPh} className={`${field} rounded-full`} />
          <button type="submit" aria-label={c.add} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-5 w-5" />
          </button>
        </form>
        {p.symptoms.length === 0 ? (
          <p className="text-sm text-muted-foreground">{c.noSymptoms}</p>
        ) : (
          <ul className="space-y-2">
            {p.symptoms.map((s, i) => (
              <li key={`${s.date}-${i}`} className="rounded-2xl bg-background p-3">
                <p className="text-xs font-semibold text-primary">{new Date(`${s.date}T12:00:00`).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="mt-0.5 text-base text-foreground">{s.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        disabled={status === "saving"}
        onClick={async () => { setStatus("saving"); await onSave(p); setStatus("saved"); }}
        className={primaryBtn}
      >
        {status === "saving" ? c.working : c.save}
      </button>
      {status === "saved" && <p role="status" className="text-center text-sm font-semibold text-accent-foreground">{c.saved}</p>}

      <button onClick={onDelete} className="mx-auto flex min-h-11 items-center gap-1.5 text-sm font-semibold text-destructive">
        <Trash2 className="h-4 w-4" /> {c.remove}
      </button>
    </div>
  );
}
