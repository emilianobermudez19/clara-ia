import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/QuickExit";
import { Illo } from "@/components/Illustrations";
import { GUIDES, MYTHS } from "@/content/guides";
import { useI18n } from "@/lib/i18n";
import { readVault } from "@/lib/vault";

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

// Panel de bienvenida: una acción principal (preguntar), contenido del día y tu espacio.
// La navegación entre secciones vive solo en la barra inferior.
function Index() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  // Valores que dependen del reloj o del dispositivo: se calculan en el navegador para no desincronizar el SSR.
  const [greet, setGreet] = useState("");
  const [mythIdx, setMythIdx] = useState(0);
  const [hasVault, setHasVault] = useState(false);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreet(h < 12 ? t.greetMorning : h < 19 ? t.greetAfternoon : t.greetEvening);
    setMythIdx(Math.floor(Date.now() / 86_400_000) % MYTHS.length);
    setHasVault(!!readVault());
  }, [t]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    navigate({ to: "/chat", search: { q: text.trim() } as never });
  };
  const myth = MYTHS[mythIdx];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-7 px-5 pb-32 pt-24">
      <section className="space-y-4 rounded-[28px] bg-primary p-5 text-primary-foreground">
        <div className="space-y-1">
          <p className="min-h-5 text-sm font-semibold opacity-80">{greet}</p>
          <h1 className="font-display text-[28px] leading-tight">{t.homeTitle}</h1>
          <p className="flex items-center gap-1.5 text-sm opacity-90"><ShieldCheck className="h-4 w-4" /> {t.dashAnonSub}</p>
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
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {t.homeChips.map((c) => (
            <button key={c} onClick={() => ask(c)} className="min-h-10 shrink-0 rounded-full bg-primary-foreground/15 px-4 text-sm font-semibold">
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">{t.dashGuides}</h2>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {GUIDES.map((g) => (
            <Link
              key={g.id}
              to="/aprende"
              hash={g.id}
              className="flex w-44 shrink-0 snap-start flex-col gap-3 rounded-[20px] border border-border bg-card p-3"
            >
              {g.illos?.[0] && <Illo name={g.illos[0]} className="h-24 w-full rounded-2xl bg-secondary" />}
              <span className="text-xs font-semibold text-primary">{t.minRead(g.min)}</span>
              <span className="text-base font-bold leading-snug text-foreground">{g.t[lang]}</span>
            </Link>
          ))}
        </div>
      </section>

      {myth && (
        <section className="rounded-[20px] border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">{t.dashMyth}</p>
          <p className="mt-1.5 text-[17px] font-semibold leading-snug text-foreground">{myth.m[lang]}</p>
          {reveal ? (
            <p className="mt-3 rounded-2xl bg-secondary p-3 text-base text-secondary-foreground">{myth.r[lang]}</p>
          ) : (
            <button onClick={() => setReveal(true)} className="mt-3 min-h-11 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground">
              {t.dashMythReveal}
            </button>
          )}
        </section>
      )}

      <Link to="/cuenta" className="flex items-center gap-4 rounded-[20px] border border-border bg-card p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Lock className="h-5 w-5" />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-bold text-foreground">{hasVault ? t.dashSpaceOpen : t.dashSpaceNew}</span>
          <span className="text-sm text-muted-foreground">{hasVault ? t.dashSpaceOpenSub : t.dashSpaceNewSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>

      <button onClick={() => ask(t.homeTestsTitle)} className="flex items-center justify-between rounded-[20px] bg-accent px-5 py-4 text-left">
        <span className="flex flex-col gap-1">
          <span className="text-[17px] font-bold text-accent-foreground">{t.homeTestsTitle}</span>
          <span className="text-sm text-accent-foreground/90">{t.homeTestsSub}</span>
        </span>
        <ChevronRight className="h-5 w-5 text-accent-foreground" />
      </button>

      <BottomNav active="inicio" />
    </main>
  );
}
