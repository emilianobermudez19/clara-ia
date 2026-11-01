import { Link } from "@tanstack/react-router";
import { GUIDES } from "@/content/guides";
import { Illo } from "@/components/Illustrations";
import { GuideMedia } from "@/components/GuideMedia";
import { useI18n } from "@/lib/i18n";

// Guía visual dentro de una respuesta del chat. Solo piezas de la biblioteca revisada (src/content).
export function ChatMedia({ id }: { id: string }) {
  const { lang, t } = useI18n();
  const g = GUIDES.find((x) => x.id === id);
  if (!g) return null;
  const stepIllos = g.illos && g.illos.length > 1 ? g.illos : undefined;
  return (
    <figure className="my-2 overflow-hidden rounded-2xl border border-border bg-background">
      <figcaption className="flex items-center gap-3 bg-secondary p-3">
        {g.illos?.[0] && <Illo name={g.illos[0]} className="h-12 w-12 shrink-0 rounded-xl bg-card" />}
        <span className="text-[15px] font-bold leading-snug text-secondary-foreground">{g.t[lang]}</span>
      </figcaption>
      {g.media?.[0] && <div className="p-3 pb-0"><GuideMedia media={g.media[0]} /></div>}
      <ol className="space-y-2 p-3">
        {g.steps.map((s, i) => (
          <li key={s.es} className="flex items-center gap-3">
            {stepIllos?.[i] ? (
              <Illo name={stepIllos[i]} className="h-14 w-14 shrink-0 rounded-xl bg-secondary" />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{i + 1}</span>
            )}
            <span className="text-[15px] leading-snug text-foreground">{s[lang]}</span>
          </li>
        ))}
      </ol>
      <Link to="/aprende" hash={g.id} className="block border-t border-border px-3 py-2.5 text-sm font-semibold text-primary">{t.openGuide}</Link>
    </figure>
  );
}
