import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CalendarClock, ChevronRight, MessageSquareText, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/QuickExit";
import { AuthGate } from "@/components/AuthGate";
import { Categories } from "@/components/Categories";
import { LegalFooter } from "@/components/LegalFooter";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { nextDose } from "@/lib/vault";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chía — Tu médico de cabecera digital, confidencial" },
      { name: "description", content: "Orientación de salud confidencial: síntomas, salud sexual, recordatorios y telemedicina." },
      { property: "og:title", content: "Chía — Tu médico de cabecera digital, confidencial" },
      { property: "og:description", content: "Cuéntale a Chía qué te pasa. Sin juicios." },
    ],
  }),
  component: Index,
});

// Sin sesión: acceso con PIN + Consulta Express. Con sesión: panel personal.
function Index() {
  const vault = useVault();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 pb-32 pt-24">
      {ready && (vault.profile ? <Home /> : <AuthGate />)}
      <LegalFooter />
      <BottomNav active="inicio" />
    </main>
  );
}

function Home() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { profile } = useVault();
  const [q, setQ] = useState("");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(id); }, []);
  if (!profile) return null;

  const h = now.getHours();
  const greet = h < 12 ? t.greetMorning : h < 19 ? t.greetAfternoon : t.greetEvening;
  const next = nextDose(profile.reminders, now);
  const ask = (text: string) => { if (text.trim()) navigate({ to: "/chat", search: { q: text.trim() } as never }); };

  return (
    <>
      <section className="space-y-4 rounded-[28px] bg-primary p-5 text-primary-foreground">
        <div className="space-y-1">
          <p className="text-sm font-semibold opacity-80">{greet}, {profile.alias}</p>
          <h1 className="font-display text-[28px] leading-tight">{t.homeHow}</h1>
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
      </section>

      <Link to="/cuenta" className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><CalendarClock className="h-5 w-5" /></span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-bold text-foreground">
            {next ? t.nextDoseHome(next.reminder.name, next.at.toLocaleTimeString(lang === "es" ? "es-MX" : "en-US", { hour: "2-digit", minute: "2-digit" })) : t.noRemindersHome}
          </span>
          <span className="text-sm text-muted-foreground">{t.remindersHomeSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      <Categories />

      <div className="grid grid-cols-2 gap-3">
        <Link to="/cuenta" className="flex min-h-24 flex-col justify-between gap-2 rounded-[20px] bg-accent p-4 text-accent-foreground">
          <Stethoscope className="h-5 w-5" />
          <span className="text-base font-bold leading-snug">{t.teleCardTitle}</span>
        </Link>
        <Link to="/cuenta" className="flex min-h-24 flex-col justify-between gap-2 rounded-[20px] bg-secondary p-4 text-secondary-foreground">
          <MessageSquareText className="h-5 w-5" />
          <span className="text-base font-bold leading-snug">{t.historyCard(profile.consultations.length)}</span>
        </Link>
      </div>

      <Link to="/aprende" className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-primary">
        <BookOpen className="h-4 w-4" /> {t.guidesLink}
      </Link>
    </>
  );
}
