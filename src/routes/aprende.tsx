import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Clock, ShieldCheck } from "lucide-react";
import { BottomNav, IntentCTA } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";
import { Illo } from "@/components/Illustrations";
import { GuideMedia } from "@/components/GuideMedia";
import { LegalFooter } from "@/components/LegalFooter";
import { GUIDES, MYTHS, type Guide, type Myth as MythT } from "@/content/guides";

export const Route = createFileRoute("/aprende")({
  head: () => ({
    meta: [
      { title: "Aprende — Guías y mitos | Chía" },
      { name: "description", content: "Guías paso a paso y mitos de salud sexual, claros y verificados." },
      { property: "og:title", content: "Aprende — Guías y mitos | Chía" },
      { property: "og:description", content: "Información breve y confiable sobre salud sexual." },
    ],
  }),
  component: Aprende,
});

function ReadTime({ min }: { min: number }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" /> {t.minRead(min)}
    </span>
  );
}

function GuideCard({ g }: { g: Guide }) {
  const { t, lang } = useI18n();
  const stepIllos = g.illos && g.illos.length > 1 ? g.illos : undefined;
  return (
    <details id={g.id} className="scroll-mt-24 rounded-[20px] border border-border bg-card p-4">
      <summary className="flex cursor-pointer list-none items-center gap-4">
        {g.illos?.[0] && <Illo name={g.illos[0]} className="h-16 w-16 shrink-0 rounded-2xl bg-secondary" />}
        <span className="flex flex-col gap-1">
          <ReadTime min={g.min} />
          <span className="text-[17px] font-bold leading-snug text-foreground">{g.t[lang]}</span>
        </span>
      </summary>

      {g.media?.length ? <div className="mt-4 space-y-3">{g.media.map((m) => <GuideMedia key={m.src} media={m} />)}</div> : null}

      <ol className="mt-4 space-y-2.5">
        {g.steps.map((s, i) => (
          <li key={s.es} className="flex items-center gap-3 rounded-2xl bg-background p-2.5">
            {stepIllos?.[i] ? (
              <Illo name={stepIllos[i]} className="h-16 w-16 shrink-0 rounded-xl bg-secondary" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{i + 1}</span>
            )}
            <span className="text-base leading-snug text-foreground">{s[lang]}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          {g.review ? t.reviewedBy(g.review.reviewer, g.review.date) : t.reviewPending}
        </p>
        {g.sources?.length ? (
          <p>
            {t.sources}:{" "}
            {g.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && " · "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.label}</a>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </details>
  );
}

function MythCard({ m, r, min }: MythT) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full rounded-[20px] border border-border bg-card p-4 text-left">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{open ? t.mythReality : t.mythTap}</p>
        <ReadTime min={min} />
      </div>
      <p className="mt-1.5 text-base leading-snug text-foreground">{open ? r[lang] : m[lang]}</p>
    </button>
  );
}

function Aprende() {
  const { t } = useI18n();
  const [tab, setTab] = useState<0 | 1>(0);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const match = (...texts: string[]) => !needle || texts.some((x) => x.toLowerCase().includes(needle));

  const guides = GUIDES.filter((g) => match(g.t.es, g.t.en, ...g.steps.flatMap((s) => [s.es, s.en])));
  const myths = MYTHS.filter((x) => match(x.m.es, x.m.en, x.r.es, x.r.en));
  const empty = (tab === 0 && !guides.length) || (tab === 1 && !myths.length);
  const tabs = [t.tabGuides, t.tabMyths];

  // Si se llega desde el inicio con #id-de-guía, se abre esa guía.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const el = id ? document.getElementById(id) : null;
    if (el instanceof HTMLDetailsElement) {
      el.open = true;
      el.scrollIntoView({ block: "start" });
    }
  }, []);

  return (
    <main className="safe-page mx-auto min-h-dvh max-w-md">
      <h1 className="font-display text-3xl text-foreground">{t.learnTitle}</h1>
      <p className="mt-2 text-base text-muted-foreground">{t.learnSub}</p>

      <div className="mt-5 flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-input bg-card px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-4 flex gap-2">
        {tabs.map((l, i) => (
          <button
            key={l}
            onClick={() => setTab(i as 0 | 1)}
            aria-pressed={tab === i}
            className={`min-h-11 rounded-full px-5 text-[15px] font-semibold ${tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {tab === 0 && guides.map((g) => <GuideCard key={g.id} g={g} />)}
        {tab === 1 && myths.map((x) => <MythCard key={x.m.es} {...x} />)}
        {empty && <p className="text-base text-muted-foreground">{t.noResults}</p>}
        <IntentCTA source={`aprende-${tab}`} />
      </div>
      <div className="mt-8"><LegalFooter /></div>
      <BottomNav active="inicio" />
    </main>
  );
}
