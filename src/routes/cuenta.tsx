import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CalendarClock, Check, ClipboardList, Lock, MessageSquareText, Plus, ShieldCheck, Stethoscope, Syringe, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { BLOOD_TYPES, COMMON_VACCINES, newId, nextDose, type BloodType, type Profile, type Reminder, type Vaccine } from "@/lib/vault";
import { AUTH_COPY as C, card, field, label, primaryBtn, type Copy } from "@/components/Auth";
import { AuthGate } from "@/components/AuthGate";
import { LegalFooter } from "@/components/LegalFooter";
import { enableBackgroundReminders, type PushResult } from "@/lib/push";

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

function Cuenta() {
  const { lang } = useI18n();
  const c = C[lang];
  const vault = useVault();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <main className="safe-page mx-auto min-h-dvh max-w-md">
      {!ready ? null : vault.profile ? (
        <Dashboard c={c} profile={vault.profile} />
      ) : (
        <AuthGate />
      )}
      <div className="mt-8"><LegalFooter /></div>
      <BottomNav active="cuenta" />
    </main>
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
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground">{c.hello(profile.alias)}</h1>
        <button onClick={vault.lock} className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground">
          <Lock className="h-4 w-4" /> {c.lock}
        </button>
      </div>

      <SyncBadge c={c} />

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
  const { lang } = useI18n();
  const [perm, setPerm] = useState<string>(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));
  const [push, setPush] = useState<PushResult | null>(null);

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
        <button onClick={async () => { const r = await enableBackgroundReminders(profile.reminders, lang); setPush(r); setPerm(Notification.permission); }} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary font-semibold text-secondary-foreground">
          <Bell className="h-4 w-4" /> {c.remNotify}
        </button>
      ) : null}
      <p className="text-xs text-muted-foreground">{push === "enabled" ? c.remPushOn : c.remNotifyNote}</p>
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

      <Vaccines c={c} profile={profile} />

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

      <button onClick={() => { if (window.confirm(vault.account ? c.removeConfirmCloud : c.removeConfirm)) void vault.remove(); }} className="mx-auto flex min-h-11 items-center gap-1.5 text-sm font-semibold text-destructive">
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

function Vaccines({ c, profile }: { c: Copy; profile: Profile }) {
  const { lang } = useI18n();
  const vault = useVault();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Vaccine["status"]>("applied");
  const [date, setDate] = useState("");
  const [dose, setDose] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const add = (v: Omit<Vaccine, "id">) => vault.update((p) => ({ ...p, vaccines: [...p.vaccines, { ...v, id: newId() }] }));
  const markApplied = (v: Vaccine) =>
    vault.update((p) => ({ ...p, vaccines: p.vaccines.map((x) => (x.id === v.id ? { ...x, status: "applied", date: x.date || today } : x)) }));
  const remove = (v: Vaccine) => vault.update((p) => ({ ...p, vaccines: p.vaccines.filter((x) => x.id !== v.id) }));
  const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { day: "numeric", month: "short", year: "numeric" });
  const missing = COMMON_VACCINES.filter((n) => !profile.vaccines.some((v) => v.name === n));

  return (
    <div className={`${card} space-y-3`}>
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Syringe className="h-5 w-5 text-primary" /> {c.vaccines}</h2>
      <p className="text-sm text-muted-foreground">{c.vaccinesHint}</p>

      {profile.vaccines.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.vacEmpty}</p>
      ) : (
        <ul className="space-y-2">
          {profile.vaccines.map((v) => (
            <li key={v.id} className="flex items-center gap-3 rounded-2xl bg-background p-3">
              <div className="flex-1">
                <p className="text-base font-semibold text-foreground">{v.name}{v.dose ? ` · ${v.dose}` : ""}</p>
                <p className={`text-xs font-semibold ${v.status === "applied" ? "text-accent-foreground" : "text-primary"}`}>
                  {v.status === "applied" ? `${c.vacApplied}${v.date ? ` · ${fmt(v.date)}` : ""}` : c.vacPending}
                </p>
              </div>
              {v.status === "pending" && (
                <button onClick={() => markApplied(v)} aria-label={`${c.vacMarkApplied}: ${v.name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Check className="h-5 w-5" />
                </button>
              )}
              <button onClick={() => remove(v)} aria-label={`${c.vacDelete}: ${v.name}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {missing.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">{c.vacQuick}</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((n) => (
              <button key={n} onClick={() => add({ name: n, status: "pending", date: "", dose: "" })} className="min-h-10 rounded-full bg-secondary px-3 text-sm font-medium text-secondary-foreground">
                + {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="space-y-3 border-t border-border pt-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await add({ name: name.trim(), status, date: status === "applied" ? date : "", dose: dose.trim() });
          setName(""); setDate(""); setDose("");
        }}
      >
        <div>
          <label htmlFor="vac-name" className={label}>{c.vacName}</label>
          <input id="vac-name" list="vac-list" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          <datalist id="vac-list">{COMMON_VACCINES.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={c.vacName}>
          {(["applied", "pending"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={status === s}
              onClick={() => setStatus(s)}
              className={`min-h-11 rounded-full text-sm font-semibold ${status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {s === "applied" ? c.vacApplied : c.vacPending}
            </button>
          ))}
        </div>
        {status === "applied" && (
          <div>
            <label htmlFor="vac-date" className={label}>{c.vacDate}</label>
            <input id="vac-date" type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
          </div>
        )}
        <div>
          <label htmlFor="vac-dose" className={label}>{c.vacDose}</label>
          <input id="vac-dose" value={dose} onChange={(e) => setDose(e.target.value)} placeholder={c.vacDosePh} className={field} />
        </div>
        <button type="submit" className={primaryBtn}><Plus className="h-5 w-5" /> {c.vacAdd}</button>
      </form>
    </div>
  );
}

function SyncBadge({ c }: { c: Copy }) {
  const vault = useVault();
  const text =
    vault.sync === "local" ? c.syncLocal
    : vault.sync === "syncing" ? c.syncSyncing
    : vault.sync === "offline" ? c.syncOffline
    : c.syncSynced;
  const tone = vault.sync === "offline" ? "bg-muted text-foreground" : "bg-secondary text-secondary-foreground";
  return (
    <p role="status" className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${tone}`}>
      {vault.sync === "local" ? <Lock className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
      <span>{text}{vault.account ? ` · ${vault.account}` : ""}</span>
    </p>
  );
}
