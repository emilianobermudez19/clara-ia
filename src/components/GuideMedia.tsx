import { useState } from "react";
import { Play } from "lucide-react";
import type { GuideMedia as Media } from "@/content/guides";
import { useI18n } from "@/lib/i18n";

// Imagen o video con crédito y licencia visibles.
// El video no se descarga hasta que la persona lo pide: menos datos móviles y nada de rastreo previo.
export function GuideMedia({ media }: { media: Media }) {
  const { lang, t } = useI18n();
  const [play, setPlay] = useState(false);
  const credit = (
    <figcaption className="mt-1.5 text-xs text-muted-foreground">
      {media.caption?.[lang] && <span className="mr-1 text-foreground">{media.caption[lang]}</span>}
      <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{media.credit}</a> · {media.license}
    </figcaption>
  );

  if (media.kind === "image") {
    return (
      <figure>
        <img src={media.src} alt={media.alt[lang]} loading="lazy" className="w-full rounded-2xl bg-secondary object-cover" />
        {credit}
      </figure>
    );
  }

  return (
    <figure>
      {play ? (
        <video src={media.src} poster={media.poster} controls autoPlay playsInline preload="none" className="w-full rounded-2xl bg-black" aria-label={media.alt[lang]} />
      ) : (
        <button
          type="button"
          onClick={() => setPlay(true)}
          className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-secondary"
        >
          {media.poster && <img src={media.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />}
          <span className="relative flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground">
            <Play className="h-4 w-4" /> {t.watchVideo}
          </span>
        </button>
      )}
      {credit}
    </figure>
  );
}
