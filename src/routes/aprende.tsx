import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { BottomNav, IntentCTA } from "@/components/QuickExit";
import { useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/aprende")({
  head: () => ({
    meta: [
      { title: "Learn — Guides, myths and science | Chia" },
      { name: "description", content: "Step-by-step guides, myth-busting and science made simple about sexual health." },
      { property: "og:title", content: "Learn — Guides, myths and science | Chia" },
      { property: "og:description", content: "Reliable, bite-size sexual health information." },
    ],
  }),
  component: Aprende,
});

type L = Record<Lang, string>;

const GUIDES: { t: L; steps: L[]; min: number }[] = [
  {
    t: { es: "Cómo usar un condón externo", en: "How to use an external condom" },
    min: 2,
    steps: [
      { es: "Revisa la caducidad y que el empaque tenga aire.", en: "Check the expiry date and that the wrapper has air inside." },
      { es: "Ábrelo con los dedos, no con los dientes.", en: "Open it with your fingers, not your teeth." },
      { es: "Aprieta la punta y desenróllalo sobre el pene erecto.", en: "Pinch the tip and roll it down over the erect penis." },
      { es: "Al terminar, sujétalo por la base al retirar.", en: "When done, hold it at the base while pulling out." },
      { es: "Tíralo a la basura, nunca al inodoro.", en: "Throw it in the trash, never in the toilet." },
    ],
  },
  {
    t: { es: "Anticoncepción de emergencia", en: "Emergency contraception" },
    min: 2,
    steps: [
      { es: "Tómala lo antes posible, hasta 72–120 h después.", en: "Take it as soon as possible, up to 72–120 hours after." },
      { es: "En muchos países se vende sin receta en farmacias.", en: "In many countries it's sold over the counter at pharmacies." },
      { es: "No es abortiva ni protege de ITS.", en: "It is not an abortion pill and does not protect against STIs." },
      { es: "No es un método regular: busca uno de largo plazo.", en: "It's not a regular method: look into a long-term one." },
    ],
  },
  {
    t: { es: "Hacerte una prueba de VIH", en: "Getting an HIV test" },
    min: 2,
    steps: [
      { es: "Es gratuita o de bajo costo en muchos centros de salud.", en: "It's free or low-cost at many health centers." },
      { es: "La prueba rápida da resultado en ~20 minutos.", en: "Rapid tests give results in about 20 minutes." },
      { es: "Es confidencial; no necesitas acompañante.", en: "It's confidential; you don't need anyone with you." },
      { es: "Si hubo una exposición reciente, pregunta por PEP (antes de 72 h).", en: "If there was a recent exposure, ask about PEP (within 72 hours)." },
    ],
  },
];

const MYTHS: { m: L; r: L; min: number }[] = [
  {
    m: { es: "La primera vez no te puedes embarazar.", en: "You can't get pregnant the first time." },
    r: { es: "Falso. Puede haber embarazo desde la primera relación sin protección.", en: "False. Pregnancy can happen from the very first unprotected sex." },
    min: 1,
  },
  {
    m: { es: "El VIH se transmite por besos o compartir vasos.", en: "HIV spreads through kissing or sharing glasses." },
    r: { es: "Falso. Solo por sangre, semen, fluidos vaginales y leche materna.", en: "False. Only through blood, semen, vaginal fluids and breast milk." },
    min: 1,
  },
  {
    m: { es: "Si no hay síntomas, no tengo una ITS.", en: "No symptoms means no STI." },
    r: { es: "Falso. Muchas ITS no dan síntomas; la prueba es la única forma de saber.", en: "False. Many STIs show no symptoms; testing is the only way to know." },
    min: 1,
  },
  {
    m: { es: "Indetectable = intransmisible.", en: "Undetectable = untransmittable." },
    r: { es: "Realidad. Con carga viral indetectable sostenida el VIH no se transmite por vía sexual (U=U).", en: "Fact. With a sustained undetectable viral load, HIV is not sexually transmitted (U=U)." },
    min: 1,
  },
];

const SCIENCE: { t: L; n: L; src: string; min: number }[] = [
  {
    t: { es: "U=U: estudios PARTNER y HPTN 052", en: "U=U: the PARTNER and HPTN 052 studies" },
    n: { es: "Cero transmisiones en miles de parejas serodiscordantes con supresión viral.", en: "Zero transmissions across thousands of serodifferent couples with viral suppression." },
    src: "The Lancet, 2019",
    min: 3,
  },
  {
    t: { es: "La PrEP reduce ~99% el riesgo sexual de VIH", en: "PrEP cuts sexual HIV risk by ~99%" },
    n: { es: "Tomada correctamente; cada vez más disponible en servicios de salud.", en: "When taken correctly; increasingly available through health services." },
    src: "CDC / WHO",
    min: 3,
  },
  {
    t: { es: "La educación sexual integral retrasa el inicio sexual", en: "Comprehensive sex ed delays sexual debut" },
    n: { es: "No aumenta la actividad sexual y mejora el uso de protección.", en: "It does not increase sexual activity and improves protection use." },
    src: "UNESCO, 2018",
    min: 3,
  },
];

function ReadTime({ min }: { min: number }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      <Clock className="h-3 w-3" /> {t.minRead(min)}
    </span>
  );
}

function Tabs({ tab, set }: { tab: number; set: (n: number) => void }) {
  const { t } = useI18n();
  const labels = [t.tabGuides, t.tabMyths, t.tabScience];
  return (
    <div className="mt-4 flex gap-2">
      {labels.map((l, i) => (
        <button key={l} onClick={() => set(i)} className={`rounded-full px-4 py-2 text-sm ${tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{l}</button>
      ))}
    </div>
  );
}

function Myth({ m, r, min }: { m: L; r: L; min: number }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full rounded-2xl border border-border bg-card p-4 text-left">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{open ? t.mythReality : t.mythTap}</p>
        <ReadTime min={min} />
      </div>
      <p className="mt-1 text-foreground">{open ? r[lang] : m[lang]}</p>
    </button>
  );
}

function Aprende() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const match = (...texts: string[]) => !needle || texts.some((x) => x.toLowerCase().includes(needle));

  const guides = GUIDES.filter((g) => match(g.t.es, g.t.en, ...g.steps.flatMap((s) => [s.es, s.en])));
  const myths = MYTHS.filter((x) => match(x.m.es, x.m.en, x.r.es, x.r.en));
  const science = SCIENCE.filter((s) => match(s.t.es, s.t.en, s.n.es, s.n.en, s.src));
  const empty = (tab === 0 && !guides.length) || (tab === 1 && !myths.length) || (tab === 2 && !science.length);

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-20">
      <h1 className="font-display text-3xl text-foreground">{t.learnTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t.learnSub}</p>

      <div className="mt-5 flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <Tabs tab={tab} set={setTab} />

      <div className="mt-5 space-y-3">
        {tab === 0 && guides.map((g) => (
          <details key={g.t.es} className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer font-semibold text-foreground">{g.t[lang]}</summary>
            <div className="mt-2"><ReadTime min={g.min} /></div>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              {g.steps.map((s) => <li key={s.es}>{s[lang]}</li>)}
            </ol>
          </details>
        ))}
        {tab === 1 && myths.map((x) => <Myth key={x.m.es} {...x} />)}
        {tab === 2 && science.map((s) => (
          <article key={s.t.es} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-foreground">{s.t[lang]}</p>
              <ReadTime min={s.min} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{s.n[lang]}</p>
            <p className="mt-2 text-xs text-primary">{s.src}</p>
          </article>
        ))}
        {empty && <p className="text-sm text-muted-foreground">{t.noResults}</p>}
        <IntentCTA source={`aprende-${tab}`} />
      </div>
      <BottomNav active="aprende" />
    </main>
  );
}
