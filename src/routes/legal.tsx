import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";
import { LEGAL, LEGAL_VERSION } from "@/content/legal";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legales y privacidad — Chía" },
      { name: "description", content: "Aviso de privacidad, términos y condiciones y deslinde médico de Chía." },
    ],
  }),
  component: Legal,
});

type DocKey = "privacy" | "terms" | "disclaimer";
const KEYS: DocKey[] = ["privacy", "terms", "disclaimer"];

function Legal() {
  const { lang, t } = useI18n();
  const docs = LEGAL[lang];
  const [doc, setDoc] = useState<DocKey>("privacy");
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if ((KEYS as string[]).includes(h)) setDoc(h as DocKey);
  }, []);
  const d = docs[doc];

  return (
    <main className="safe-page mx-auto min-h-dvh max-w-md">
      <h1 className="font-display text-3xl text-foreground">{t.legalLink}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.legalVersion(LEGAL_VERSION)}</p>

      <div role="tablist" className="mt-5 flex flex-wrap gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={doc === k}
            onClick={() => { setDoc(k); window.history.replaceState(null, "", `#${k}`); }}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold ${doc === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {docs[k].title}
          </button>
        ))}
      </div>

      <article className="mt-6 space-y-5">
        <h2 className="text-2xl font-bold text-foreground">{d.title}</h2>
        {d.sections.map((s) => (
          <section key={s.h} className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">{s.h}</h3>
            {s.p.map((x) => <p key={x} className="text-base leading-relaxed text-foreground">{x}</p>)}
          </section>
        ))}
      </article>
      <BottomNav active="cuenta" />
    </main>
  );
}
