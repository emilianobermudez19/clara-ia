import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CalendarClock, ClipboardList, Lock, MessageSquareText, Plus, ShieldCheck, Stethoscope, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { BLOOD_TYPES, isValidPin, newId, nextDose, type BloodType, type Profile, type Reminder } from "@/lib/vault";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Mi espacio — Chía" },
      { name: "description", content: "Tu área privada: consultas, recordatorios, ficha médica y telemedicina." },
      { property: "og:title", content: "Mi espacio — Chía" },
      { property: "og:description", content: "Tu salud, protegida con tu PIN." },
    ],
  }),
  component: Cuenta,
});

const C = {
  es: {
    title: "Mi espacio",
    intro: "Tu área privada: consultas guardadas, recordatorios de medicamentos y ficha médica. Se cifra con tu PIN y no sale de este teléfono.",
    anon: "Para dudas sensibles, la consulta anónima sigue sin cuenta.",
    anonCta: "Ir a consulta anónima",
    alias: "Nombre o apodo",
    aliasHint: "No uses tu nombre real si no quieres.",
    pin: "PIN de 6 dígitos",
    pinConfirm: "Repite el PIN",
    pinWarn: "Si olvidas el PIN no hay forma de recuperar tus datos: ni nosotros podemos abrirlos.",
    create: "Crear mi espacio",
    unlock: "Entrar",
    unlockTitle: "Entra a tu espacio",
    hello: (a: string) => `Hola, ${a}`,
    wrongPin: "PIN incorrecto.",
    locked: (s: number) => `Demasiados intentos. Espera ${s} s.`,
    pinMismatch: "Los PIN no coinciden.",
    pinInvalid: "El PIN debe tener 6 números.",
    aliasMissing: "Escribe un nombre o apodo.",
    working: "Protegiendo…",
    lock: "Salir",
    biometricNext: "Entrar con huella o rostro: próximamente.",
    privacy: "Cifrado AES-256 en tu dispositivo · se bloquea tras 10 min sin uso",
    nextDose: "Próxima toma",
    noDose: "Sin recordatorios activos",
    tabs: { history: "Consultas", reminders: "Recordatorios", record: "Ficha", tele: "Telemedicina" },
    // Consultas
    historyEmpty: "Aún no guardas consultas. En el chat, activa \"Guardar en Mi espacio\"; las consultas anónimas nunca se guardan.",
    newConsult: "Nueva consulta",
    deleteConsult: "Borrar consulta",
    you: "Tú",
    // Recordatorios
    remEmpty: "Agrega tus medicamentos para recibir avisos. Copia la indicación tal como viene en tu receta.",
    remName: "Medicamento o método",
    remNamePh: "Ej. pastilla anticonceptiva, PrEP",
    remTimes: "Horas (separadas por coma)",
    remTimesPh: "08:00, 20:00",
    remNote: "Indicación de tu receta",
    remNotePh: "Tal como la escribió tu médico",
    remAdd: "Agregar recordatorio",
    remBadTimes: "Escribe horas como 08:00 o 20:30.",
    remNotify: "Activar avisos en este teléfono",
    remNotifyOn: "Avisos activados. Por privacidad, el aviso no dice qué medicamento es.",
    remNotifyNote: "Por ahora los avisos llegan con Chía abierta. Los avisos con la app cerrada llegan en la siguiente versión.",
    remRule: "Chía no calcula dosis ni horarios: usa los de tu receta o los del empaque.",
    remDelete: "Eliminar recordatorio",
    // Ficha
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
    remove: "Borrar mi espacio",
    removeConfirm: "¿Borrar todos tus datos de este teléfono? No se puede deshacer.",
    // Telemedicina
    teleTitle: "Habla con un especialista",
    teleBody: "Estamos sumando médicas y médicos aliados. Deja tu solicitud y te avisaremos aquí cuando la consulta esté disponible.",
    teleSpecialty: "Especialidad",
    teleSpecs: ["Medicina general", "Ginecología", "Salud sexual e ITS", "Urología", "Psicología"],
    teleReason: "Motivo (opcional)",
    teleReasonPh: "Lo que quieras contarle",
    teleShare: "Mi ficha y mis síntomas solo se compartirán con mi permiso, al momento de la consulta.",
    teleSend: "Solicitar consulta",
    teleSent: "Solicitud registrada.",
    telePending: "Pendiente",
    teleUrgent: "Si es urgente, no esperes: llama a tu número de emergencias o acude a urgencias.",
  },
  en: {
    title: "My space",
    intro: "Your private area: saved consultations, medicine reminders and health record. Encrypted with your PIN; it never leaves this phone.",
    anon: "For sensitive questions, the anonymous chat still needs no account.",
    anonCta: "Go to anonymous chat",
    alias: "Name or nickname",
    aliasHint: "You don't have to use your real name.",
    pin: "6-digit PIN",
    pinConfirm: "Repeat the PIN",
    pinWarn: "If you forget the PIN, your data can't be recovered: not even we can open it.",
    create: "Create my space",
    unlock: "Enter",
    unlockTitle: "Enter your space",
    hello: (a: string) => `Hi, ${a}`,
    wrongPin: "Wrong PIN.",
    locked: (s: number) => `Too many attempts. Wait ${s} s.`,
    pinMismatch: "PINs don't match.",
    pinInvalid: "The PIN must be 6 digits.",
    aliasMissing: "Enter a name or nickname.",
    working: "Protecting…",
    lock: "Lock",
    biometricNext: "Fingerprint or face sign-in: coming soon.",
    privacy: "AES-256 encrypted on your device · locks after 10 min idle",
    nextDose: "Next dose",
    noDose: "No active reminders",
    tabs: { history: "Consultations", reminders: "Reminders", record: "Record", tele: "Telehealth" },
    historyEmpty: "No saved consultations yet. In the chat, turn on \"Save to My space\"; anonymous chats are never saved.",
    newConsult: "New consultation",
    deleteConsult: "Delete consultation",
    you: "You",
    remEmpty: "Add your medicines to get reminders. Copy the instruction exactly as on your prescription.",
    remName: "Medicine or method",
    remNamePh: "E.g. birth control pill, PrEP",
    remTimes: "Times (comma separated)",
    remTimesPh: "08:00, 20:00",
    remNote: "Prescription instruction",
    remNotePh: "Exactly as your doctor wrote it",
    remAdd: "Add reminder",
    remBadTimes: "Write times like 08:00 or 20:30.",
    remNotify: "Turn on alerts on this phone",
    remNotifyOn: "Alerts on. For privacy, the alert doesn't name the medicine.",
    remNotifyNote: "For now, alerts arrive while Chía is open. Alerts with the app closed come in the next version.",
    remRule: "Chía doesn't calculate doses or schedules: use your prescription or the package label.",
    remDelete: "Delete reminder",
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
    remove: "Delete my space",
    removeConfirm: "Delete all your data from this phone? This can't be undone.",
    teleTitle: "Talk to a specialist",
    teleBody: "We're onboarding partner doctors. Leave a request and we'll let you know here when consultations open.",
    teleSpecialty: "Specialty",
    teleSpecs: ["General medicine", "Gynecology", "Sexual health & STIs", "Urology", "Psychology"],
    teleReason: "Reason (optional)",
    teleReasonPh: "Anything you'd like to share",
    teleShare: "My record and symptoms will only be shared with my permission, at the time of the consultation.",
    teleSend: "Request consultation",
    teleSent: "Request saved.",
    telePending: "Pending",
    teleUrgent: "If it's urgent, don't wait: call your emergency number or go to the ER.",
  },
};
type Copy = (typeof C)["es"];

const field = "w-full rounded-2xl border-[1.5px] border-input bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
const label = "mb-1.5 block text-sm font-semibold text-foreground";
const primaryBtn = "flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-50";
const card = "rounded-[20px] border border-border bg-card p-4";

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

function Cuenta() {
  const { lang } = useI18n();
  const c = C[lang];
  const vault = useVault();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-32 pt-24">
      {!ready ? null : vault.profile ? (
        <Dashboard c={c} profile={vault.profile} />
      ) : (
        <>
          <h1 className="font-display text-3xl text-foreground">{c.title}</h1>
          {vault.exists ? <UnlockForm c={c} /> : <CreateForm c={c} />}
          <div className="mt-8 rounded-[20px] bg-secondary p-4 text-secondary-foreground">
            <p className="text-sm">{c.anon}</p>
            <Link to="/chat" className="mt-2 inline-flex min-h-11 items-center font-semibold underline">{c.anonCta}</Link>
          </div>
        </>
      )}
      <BottomNav active="cuenta" />
    </main>
  );
}

function CreateForm({ c }: { c: Copy }) {
  const vault = useVault();
  const [alias, setAlias] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-3 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!alias.trim()) return setError(c.aliasMissing);
        if (!isValidPin(p1)) return setError(c.pinInvalid);
        if (p1 !== p2) return setError(c.pinMismatch);
        setBusy(true); setError("");
        await vault.create(alias.trim(), p1);
        setBusy(false);
      }}
    >
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
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {c.privacy}</p>
    </form>
  );
}

function UnlockForm({ c }: { c: Copy }) {
  const vault = useVault();
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
        if (wait > 0 || !isValidPin(pin)) return;
        setBusy(true); setError("");
        try {
          await vault.unlock(pin);
        } catch {
          const n = fails + 1;
          setFails(n);
          setPin("");
          // Cada 5 intentos fallidos, espera creciente (30 s, 60 s, …).
          if (n % 5 === 0) { setWaitUntil(Date.now() + 30_000 * (n / 5)); setNow(Date.now()); }
          setError(c.wrongPin);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex flex-col items-center gap-3 rounded-[20px] bg-secondary p-6 text-secondary-foreground">
        <Lock className="h-8 w-8" />
        <p className="text-lg font-bold">{c.unlockTitle}</p>
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

type Tab = "history" | "reminders" | "record" | "tele";

function Dashboard({ c, profile }: { c: Copy; profile: Profile }) {
  const { lang } = useI18n();
  const vault = useVault();
  const [tab, setTab] = useState<Tab>("history");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(id); }, []);
  const next = nextDose(profile.reminders, now);
  const fmtTime = (d: Date) => d.toLocaleTimeString(lang === "es" ? "es-MX" : "en-US", { hour: "2-digit", minute: "2-digit" });

  const tabs: { key: Tab; label: string; Icon: typeof Bell }[] = [
    { key: "history", label: c.tabs.history, Icon: MessageSquareText },
    { key: "reminders", label: c.tabs.reminders, Icon: Bell },
    { key: "record", label: c.tabs.record, Icon: ClipboardList },
    { key: "tele", label: c.tabs.tele, Icon: Stethoscope },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground">{c.hello(profile.alias)}</h1>
        <button onClick={vault.lock} className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground">
          <Lock className="h-4 w-4" /> {c.lock}
        </button>
      </div>

      <button onClick={() => setTab("reminders")} className="flex w-full items-center gap-4 rounded-[20px] bg-primary p-4 text-left text-primary-foreground">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15"><CalendarClock className="h-6 w-6" /></span>
        <span className="flex flex-col">
          <span className="text-sm opacity-85">{c.nextDose}</span>
          <span className="text-lg font-bold">{next ? `${next.reminder.name} · ${fmtTime(next.at)}` : c.noDose}</span>
        </span>
      </button>

      <div role="tablist" className="grid grid-cols-4 gap-1 rounded-[20px] bg-secondary p-1">
        {tabs.map(({ key, label: l, Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold ${tab === key ? "bg-card text-primary shadow-sm" : "text-secondary-foreground"}`}
          >
            <Icon className="h-5 w-5" />
            {l}
          </button>
        ))}
      </div>

      {tab === "history" && <History c={c} profile={profile} />}
      {tab === "reminders" && <Reminders c={c} profile={profile} />}
      {tab === "record" && <Record c={c} profile={profile} />}
      {tab === "tele" && <Tele c={c} profile={profile} />}

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> {c.privacy}</p>
    </div>
  );
}

function History({ c, profile }: { c: Copy; profile: Profile }) {
  const { lang } = useI18n();
  const vault = useVault();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="space-y-3">
      <Link to="/chat" className={primaryBtn}><Plus className="h-5 w-5" /> {c.newConsult}</Link>
      {profile.consultations.length === 0 && <p className={`${card} text-base text-muted-foreground`}>{c.historyEmpty}</p>}
      {profile.consultations.map((k) => (
        <article key={k.id} className={card}>
          <button onClick={() => setOpen(open === k.id ? null : k.id)} aria-expanded={open === k.id} className="w-full text-left">
            <p className="text-xs font-semibold text-primary">{new Date(k.date).toLocaleString(lang === "es" ? "es-MX" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
            <p className="mt-0.5 text-base font-bold text-foreground">{k.title}</p>
          </button>
          {open === k.id && (
            <div className="mt-3 space-y-2">
              {k.turns.map((t, i) => (
                <p key={i} className={`rounded-2xl p-3 text-sm leading-relaxed ${t.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-background text-foreground"}`}>
                  <strong>{t.role === "user" ? c.you : "Chía"}:</strong> {t.text.replace(/\[\[media:[a-z0-9-]+\]\]/g, "")}
                </p>
              ))}
              <button
                onClick={() => vault.update((p) => ({ ...p, consultations: p.consultations.filter((x) => x.id !== k.id) }))}
                className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-destructive"
              >
                <Trash2 className="h-4 w-4" /> {c.deleteConsult}
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

function Reminders({ c, profile }: { c: Copy; profile: Profile }) {
  const vault = useVault();
  const [name, setName] = useState("");
  const [times, setTimes] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [perm, setPerm] = useState<string>(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));

  const toggle = (r: Reminder) => vault.update((p) => ({ ...p, reminders: p.reminders.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)) }));
  const remove = (r: Reminder) => vault.update((p) => ({ ...p, reminders: p.reminders.filter((x) => x.id !== r.id) }));

  return (
    <section className="space-y-3">
      <p className="rounded-2xl bg-muted p-3 text-sm text-foreground">{c.remRule}</p>
      {profile.reminders.length === 0 && <p className="text-base text-muted-foreground">{c.remEmpty}</p>}
      {profile.reminders.map((r) => (
        <article key={r.id} className={`${card} flex items-start gap-3`}>
          <div className="flex-1">
            <p className="text-base font-bold text-foreground">{r.name}</p>
            <p className="mt-1 flex flex-wrap gap-1.5">{r.times.map((t) => <span key={t} className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">{t}</span>)}</p>
            {r.note && <p className="mt-1.5 text-sm text-muted-foreground">{r.note}</p>}
          </div>
          <button onClick={() => toggle(r)} role="switch" aria-checked={r.active} aria-label={r.name} className={`flex h-11 w-11 items-center justify-center rounded-full ${r.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Bell className="h-5 w-5" />
          </button>
          <button onClick={() => remove(r)} aria-label={`${c.remDelete}: ${r.name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Trash2 className="h-5 w-5" />
          </button>
        </article>
      ))}

      <form
        className={`${card} space-y-3`}
        onSubmit={async (e) => {
          e.preventDefault();
          const list = times.split(",").map((t) => t.trim()).filter(Boolean);
          if (!name.trim() || !list.length || !list.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) return setError(c.remBadTimes);
          setError("");
          await vault.update((p) => ({ ...p, reminders: [...p.reminders, { id: newId(), name: name.trim(), times: list, note: note.trim(), active: true }] }));
          setName(""); setTimes(""); setNote("");
        }}
      >
        <div>
          <label htmlFor="rem-name" className={label}>{c.remName}</label>
          <input id="rem-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={c.remNamePh} className={field} />
        </div>
        <div>
          <label htmlFor="rem-times" className={label}>{c.remTimes}</label>
          <input id="rem-times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder={c.remTimesPh} inputMode="numeric" className={field} />
        </div>
        <div>
          <label htmlFor="rem-note" className={label}>{c.remNote}</label>
          <input id="rem-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={c.remNotePh} className={field} />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
        <button type="submit" className={primaryBtn}><Plus className="h-5 w-5" /> {c.remAdd}</button>
      </form>

      {perm === "granted" ? (
        <p className="text-sm font-semibold text-accent-foreground">{c.remNotifyOn}</p>
      ) : perm !== "unsupported" && perm !== "denied" ? (
        <button onClick={async () => setPerm(await Notification.requestPermission())} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-secondary-foreground">
          <Bell className="h-4 w-4" /> {c.remNotify}
        </button>
      ) : null}
      <p className="text-xs text-muted-foreground">{c.remNotifyNote}</p>
    </section>
  );
}

function Record({ c, profile }: { c: Copy; profile: Profile }) {
  const { lang } = useI18n();
  const vault = useVault();
  const [p, setP] = useState(profile);
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setP((x) => ({ ...x, [k]: v })); setStatus("idle"); };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="space-y-4">
      <div className={`${card} space-y-4`}>
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
      </div>

      <div className={`${card} space-y-3`}>
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
      </div>

      <button
        disabled={status === "saving"}
        onClick={async () => {
          setStatus("saving");
          // Solo se guardan los campos de la ficha; consultas y recordatorios se conservan tal como están.
          await vault.update((cur) => ({ ...cur, bloodType: p.bloodType, allergies: p.allergies, medications: p.medications, conditions: p.conditions, symptoms: p.symptoms }));
          setStatus("saved");
        }}
        className={primaryBtn}
      >
        {status === "saving" ? c.working : c.save}
      </button>
      {status === "saved" && <p role="status" className="text-center text-sm font-semibold text-accent-foreground">{c.saved}</p>}

      <button onClick={() => { if (window.confirm(c.removeConfirm)) vault.remove(); }} className="mx-auto flex min-h-11 items-center gap-1.5 text-sm font-semibold text-destructive">
        <Trash2 className="h-4 w-4" /> {c.remove}
      </button>
    </section>
  );
}

function Tele({ c, profile }: { c: Copy; profile: Profile }) {
  const { lang } = useI18n();
  const vault = useVault();
  const [specialty, setSpecialty] = useState(c.teleSpecs[0]);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <section className="space-y-3">
      <div className="rounded-[20px] bg-accent p-4 text-accent-foreground">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Stethoscope className="h-5 w-5" /> {c.teleTitle}</h2>
        <p className="mt-1.5 text-sm">{c.teleBody}</p>
      </div>

      <form
        className={`${card} space-y-3`}
        onSubmit={async (e) => {
          e.preventDefault();
          await vault.update((p) => ({ ...p, teleRequests: [{ id: newId(), date: new Date().toISOString(), specialty, reason: reason.trim(), status: "pending" }, ...p.teleRequests] }));
          // Métrica anónima de demanda (sin datos de la ficha): se conectará a intent_events.
          console.info("[intent]", { source: "telemedicina", choice: "specialist", specialty });
          setReason(""); setSent(true);
        }}
      >
        <div>
          <label htmlFor="tele-spec" className={label}>{c.teleSpecialty}</label>
          <select id="tele-spec" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={field}>
            {c.teleSpecs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tele-reason" className={label}>{c.teleReason}</label>
          <textarea id="tele-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={c.teleReasonPh} className={field} />
        </div>
        <p className="text-sm text-muted-foreground">{c.teleShare}</p>
        <button type="submit" className={primaryBtn}>{c.teleSend}</button>
        {sent && <p role="status" className="text-center text-sm font-semibold text-accent-foreground">{c.teleSent}</p>}
      </form>

      {profile.teleRequests.map((r) => (
        <article key={r.id} className={`${card} flex items-center justify-between gap-3`}>
          <div>
            <p className="text-base font-bold text-foreground">{r.specialty}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { day: "numeric", month: "short" })}</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{c.telePending}</span>
        </article>
      ))}
      <p className="text-sm font-semibold text-foreground">{c.teleUrgent}</p>
    </section>
  );
}
