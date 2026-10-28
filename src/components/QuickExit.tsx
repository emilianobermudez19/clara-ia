import { X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export function quickExit() {
  try { sessionStorage.clear(); } catch { /* noop */ }
  window.location.replace("https://www.google.com/search?q=weather+today");
}

export function QuickExit() {
  const { t } = useI18n();
  return (
    <button
      onClick={quickExit}
      aria-label={t.exit}
      className="fixed right-4 top-4 z-50 flex items-center gap-1.5 rounded-full bg-exit px-4 py-2 text-sm font-semibold text-exit-foreground shadow-lg active:scale-95"
    >
      <X className="h-4 w-4" /> {t.exit}
    </button>
  );
}

export function BottomNav({ active }: { active: "inicio" | "chat" | "aprende" }) {
  const { t } = useI18n();
  const items = [
    { to: "/", label: t.navHome, key: "inicio" },
    { to: "/chat", label: t.navChat, key: "chat" },
    { to: "/aprende", label: t.navLearn, key: "aprende" },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {items.map((i) => (
          <a key={i.key} href={i.to} className={`px-4 py-2 text-sm ${active === i.key ? "font-semibold text-primary" : "text-muted-foreground"}`}>
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function IntentCTA({ source }: { source: string }) {
  const { t } = useI18n();
  const [choice, setChoice] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-muted-foreground">{t.intentThanks}</p>
      </div>
    );
  }

  if (choice) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm">
        <p className="text-foreground">{t.intentRegionAsk}</p>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const region = new FormData(e.currentTarget).get("region");
            // Métrica de intención anónima (Fase 2). Sin datos personales.
            console.info("[intent]", { source, choice, region, at: new Date().toISOString() });
            setDone(true);
          }}
        >
          <input
            name="region"
            placeholder={t.intentRegionPlaceholder}
            className="min-w-0 flex-1 rounded-full border border-input bg-background px-3 py-1.5 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground">
            {t.intentSend}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <p className="text-foreground">{t.intentQ}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[t.intentSpecialist, t.intentClinics].map((l) => (
          <button key={l} onClick={() => setChoice(l)} className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
