import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chía — Información de salud confidencial" },
      { name: "description", content: "Pregunta sobre salud sexual sin registro y sin juicios. Ask about sexual health, no sign-up, no judgment." },
      { property: "og:title", content: "Chía — Información de salud confidencial" },
      { property: "og:description", content: "Pregunta lo que sea. Sin cuenta, sin historial." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const ask = (text: string) => {
    if (!text.trim()) return;
    navigate({ to: "/chat", search: { q: text.trim() } as never });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 pb-32 pt-24">
      <div className="space-y-2">
        <h1 className="font-display text-[30px] leading-tight text-foreground">{t.homeTitle}</h1>
        <p className="text-base text-muted-foreground">{t.homeSub}</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(q); }}
        className="flex min-h-14 items-center gap-2 rounded-full border-[1.5px] border-input bg-card pl-5 pr-2"
      >
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

      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-muted-foreground">{t.homePopular}</h2>
        <div className="flex flex-wrap gap-2">
          {t.homeChips.map((c) => (
            <button key={c} onClick={() => ask(c)} className="min-h-11 rounded-full bg-secondary px-4 text-[15px] font-medium text-secondary-foreground">
              {c}
            </button>
          ))}
        </div>
      </section>

      <Link to="/aprende" className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4">
        <svg viewBox="0 0 150 110" aria-hidden="true" className="h-[76px] w-[76px] shrink-0 rounded-2xl bg-secondary">
          <rect x="45" y="22" width="60" height="60" rx="10" fill="#FFFFFF" stroke="#5A3E85" strokeWidth="3" />
          <circle cx="75" cy="52" r="16" fill="none" stroke="#CDB8E3" strokeWidth="4" />
          <path d="M20 96 C24 70 34 60 50 56 L56 74 C46 80 40 88 38 100 Z" fill="#C99A7A" />
          <path d="M130 96 C126 70 116 60 100 56 L94 74 C104 80 110 88 112 100 Z" fill="#8A5C44" />
        </svg>
        <span className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-primary">{t.homeGuideTag}</span>
          <span className="text-[17px] font-bold leading-snug text-foreground">{t.homeGuideTitle}</span>
        </span>
      </Link>

      <button onClick={() => ask(t.homeTestsTitle)} className="flex items-center justify-between rounded-[20px] bg-accent px-5 py-4 text-left">
        <span className="flex flex-col gap-1">
          <span className="text-[17px] font-bold text-accent-foreground">{t.homeTestsTitle}</span>
          <span className="text-sm text-accent-foreground/90">{t.homeTestsSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-accent-foreground" />
      </button>

      <Link to="/cuenta" className="text-center text-sm text-muted-foreground underline">{t.homeAccount}</Link>
      <BottomNav active="inicio" />
    </main>
  );
}
