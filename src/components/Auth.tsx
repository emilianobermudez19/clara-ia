import { useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { useVault } from "@/lib/vault-context";
import { isValidPin } from "@/lib/vault";

// Acceso a "Mi espacio": crear cuenta y entrar con PIN. Se usa en Inicio y en Mi espacio.
export const AUTH_COPY = {
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
    remPushOn: "Avisos activados también con la app cerrada.",
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
    remPushOn: "Alerts are also on with the app closed.",
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
export type Copy = (typeof AUTH_COPY)["es"];

export const field = "w-full rounded-2xl border-[1.5px] border-input bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";
export const label = "mb-1.5 block text-sm font-semibold text-foreground";
export const primaryBtn = "flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-50";
export const card = "rounded-[20px] border border-border bg-card p-4";

export function PinInput({ id, value, onChange, autoFocus }: { id: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
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


export function CreateForm({ c }: { c: Copy }) {
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

export function UnlockForm({ c }: { c: Copy }) {
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

