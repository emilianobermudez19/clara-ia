import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BottomNav, IntentCTA } from "@/components/QuickExit";

export const Route = createFileRoute("/aprende")({
  head: () => ({
    meta: [
      { title: "Aprende — Guías, mitos y ciencia | Chia" },
      { name: "description", content: "Guías paso a paso, mitos y realidades y divulgación científica sobre salud sexual." },
      { property: "og:title", content: "Aprende — Guías, mitos y ciencia | Chia" },
      { property: "og:description", content: "Información confiable y breve sobre salud sexual en México." },
    ],
  }),
  component: Aprende,
});

const GUIDES = [
  { t: "Cómo usar un condón externo", steps: ["Revisa caducidad y que el empaque tenga aire.", "Ábrelo con los dedos, no con dientes.", "Aprieta la punta y desenróllalo sobre el pene erecto.", "Al terminar, sujétalo por la base al retirar.", "Tíralo a la basura, nunca al inodoro."] },
  { t: "Anticoncepción de emergencia", steps: ["Tómala lo antes posible, hasta 72–120 h después.", "Se vende sin receta en farmacias de México.", "No es abortiva ni protege de ITS.", "No es un método regular: busca uno de largo plazo."] },
  { t: "Hacerte una prueba de VIH", steps: ["Es gratuita en centros de salud y CAPASITS.", "La prueba rápida da resultado en ~20 minutos.", "Es confidencial; no necesitas acompañante.", "Si fue reciente una exposición, pregunta por PEP (antes de 72 h)."] },
];
const MYTHS = [
  { m: "La primera vez no te puedes embarazar.", r: "Falso. Puede haber embarazo desde la primera relación sin protección." },
  { m: "El VIH se transmite por besos o compartir vasos.", r: "Falso. Solo por sangre, semen, fluidos vaginales y leche materna." },
  { m: "Si no hay síntomas, no tengo una ITS.", r: "Falso. Muchas ITS no dan síntomas; la prueba es la única forma de saber." },
  { m: "Indetectable = intransmisible.", r: "Realidad. Con carga viral indetectable sostenida el VIH no se transmite por vía sexual (I=I)." },
];
const SCIENCE = [
  { t: "I=I: estudios PARTNER y HPTN 052", n: "Cero transmisiones en miles de parejas serodiscordantes con supresión viral.", src: "The Lancet, 2019" },
  { t: "PrEP reduce ~99% el riesgo sexual de VIH", n: "Tomada correctamente; disponible gratis en México en servicios especializados.", src: "CDC / CENSIDA" },
  { t: "Educación sexual integral retrasa el inicio sexual", n: "No aumenta la actividad sexual y mejora el uso de protección.", src: "UNESCO, 2018" },
];

function Tabs({ tab, set }: { tab: number; set: (n: number) => void }) {
  return (
    <div className="mt-6 flex gap-2">
      {["Guías", "Mitos", "Ciencia"].map((l, i) => (
        <button key={l} onClick={() => set(i)} className={`rounded-full px-4 py-2 text-sm ${tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{l}</button>
      ))}
    </div>
  );
}

function Myth({ m, r }: { m: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen(!open)} className="w-full rounded-2xl border border-border bg-card p-4 text-left">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{open ? "Realidad" : "¿Mito o realidad? Toca"}</p>
      <p className="mt-1 text-foreground">{open ? r : m}</p>
    </button>
  );
}

function Aprende() {
  const [tab, setTab] = useState(0);
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-20">
      <h1 className="font-display text-3xl text-foreground">Aprende a tu ritmo</h1>
      <p className="mt-2 text-sm text-muted-foreground">Información breve, verificada y sin juicios.</p>
      <Tabs tab={tab} set={setTab} />
      <div className="mt-5 space-y-3">
        {tab === 0 && GUIDES.map((g) => (
          <details key={g.t} className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer font-semibold text-foreground">{g.t}</summary>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </details>
        ))}
        {tab === 1 && MYTHS.map((x) => <Myth key={x.m} {...x} />)}
        {tab === 2 && SCIENCE.map((s) => (
          <article key={s.t} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-semibold text-foreground">{s.t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.n}</p>
            <p className="mt-2 text-xs text-primary">{s.src}</p>
          </article>
        ))}
        <IntentCTA source={`aprende-${tab}`} />
      </div>
      <BottomNav active="aprende" />
    </main>
  );
}
