import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CalendarClock, ChevronRight, HeartPulse, Lock, Pill, ShieldCheck, Stethoscope, TestTube2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { nextDose } from "@/lib/vault";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chía — Tu médico de cabecera digital, confidencial" },
      { name: "description", content: "Orientación de salud confidencial: síntomas, salud sexual, recordatorios y telemedicina." },
      { property: "og:title", content: "Chía — Tu médico de cabecera digital, confidencial" },
      { property: "og:description", content: "Cuéntale a Chía qué te pasa. Sin cuenta, sin juicios." },
    ],
  }),
  component: Index,
});

const TRIAGE_ICONS: Record<string, typeof Pill> = { symptoms: HeartPulse, contraception: Shield, sti: TestTube2, rx: Pill };

// Inicio enfocado en consulta y seguimiento: preguntar, elegir un motivo, ver tu próxima toma, pedir especialista.
function Index() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const vault = useVault();
  const [q, setQ] = useState("");
  const [greet, setGreet] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const d = new Date();
    const h = d.getHours();
    setGreet(h < 12 ? t.greetMorning : h < 19 ? t.greetAfternoon : t.greetEvening);
    setNow(d);
  }, [t]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    navigate({ to: "/chat", search: { q: text.trim() } as never });
  };
  const next = vault.profile && now ? nextDose(vault.profile.reminders, now) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 pb-32 pt-24">
      <section className="space-y-4 rounded-[28px] bg-primary p-5 text-primary-foreground">
        <div className="space-y-1">
          <p className="min-h-5 text-sm font-semibold opacity-80">{greet}{vault.profile ? `, ${vault.profile.alias}` : ""}</p>
          <h1 className="font-display text-[28px] leading-tight">{t.homeHow}</h1>
          <p className="text-[15px] leading-snug opacity-90">{t.homeHowSub}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex min-h-14 items-center gap-2 rounded-full bg-card pl-5 pr-1.5">
          <label htmlFor="home-ask" className="sr-only">{t.homeAskPlaceholder}</label>
          <input
            id="home-ask"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.homeAskPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[17px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" aria-label={t.homeAskSend} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>
        <p className="flex items-center gap-1.5 text-sm opacity-90"><ShieldCheck className="h-4 w-4" /> {t.dashAnonSub}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t.triageTitle}</h2>
        <div className="grid grid-cols-2 gap-3">
          {t.triage.map((x) => {
            const Icon = TRIAGE_ICONS[x.k] ?? HeartPulse;
            return (
              <button key={x.k} onClick={() => ask(x.q)} className="flex min-h-24 flex-col items-start justify-between gap-3 rounded-[20px] border border-border bg-card p-4 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
                <span className="text-base font-bold leading-snug text-foreground">{x.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Link to="/cuenta" className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          {next ? <CalendarClock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-bold text-foreground">
            {next
              ? t.nextDoseHome(next.reminder.name, next.at.toLocaleTimeString(lang === "es" ? "es-MX" : "en-US", { hour: "2-digit", minute: "2-digit" }))
              : vault.exists ? t.dashSpaceOpen : t.dashSpaceNew}
          </span>
          <span className="text-sm text-muted-foreground">{vault.exists ? t.dashSpaceOpenSub : t.dashSpaceNewSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      <Link to="/cuenta" className="flex items-center gap-4 rounded-[20px] bg-accent p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card text-accent-foreground"><Stethoscope className="h-5 w-5" /></span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-bold text-accent-foreground">{t.teleCardTitle}</span>
          <span className="text-sm text-accent-foreground/90">{t.teleCardSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-accent-foreground" />
      </Link>

      <Link to="/aprende" className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-primary">
        <BookOpen className="h-4 w-4" /> {t.guidesLink}
      </Link>

      <BottomNav active="inicio" />
    </main>
  );
}
