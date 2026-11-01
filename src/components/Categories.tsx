import { useNavigate } from "@tanstack/react-router";
import { HeartPulse, Hospital, Pill, Stethoscope } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Topic } from "@/lib/topics";

const ICONS: Record<Topic, typeof Pill> = { meds: Pill, sexual: HeartPulse, symptoms: Stethoscope, clinics: Hospital };

// "¿En qué te ayudamos?": cada tarjeta abre el chat ya enfocado en ese tema.
export function Categories() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">{t.triageTitle}</h2>
      <div className="grid grid-cols-2 gap-3">
        {t.topics.map((x) => {
          const Icon = ICONS[x.k];
          return (
            <button
              key={x.k}
              onClick={() => navigate({ to: "/chat", search: { topic: x.k } })}
              className="flex min-h-32 flex-col items-start justify-between gap-3 rounded-[20px] border border-border bg-card p-4 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="h-5 w-5" /></span>
              <span className="space-y-0.5">
                <span className="block text-base font-bold leading-snug text-foreground">{x.label}</span>
                <span className="block text-[13px] leading-snug text-muted-foreground">{x.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
