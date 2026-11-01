import { X, Home, MessageCircle, BookOpen, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { COUNTRIES, type IntentChoice } from "@/lib/countries";

export function quickExit() {
  try { sessionStorage.clear(); } catch { /* noop */ }
  // Borra también las preferencias guardadas (idioma, tema, modo) para no dejar rastro de la visita.
  // La ficha cifrada ("chia-vault") se conserva: sin el PIN es ilegible, y borrarla haría perder datos médicos.
  try {
    Object.keys(localStorage).filter((k) => k.startsWith("chia-") && k !== "chia-vault").forEach((k) => localStorage.removeItem(k));
  } catch { /* noop */ }
  window.location.replace("https://www.google.com/search?q=weather+today");
}

export function QuickExit() {
  const { t } = useI18n();
  return (
    <button
      onClick={quickExit}
      aria-label={t.exit}
      className="fixed right-4 top-3 z-50 flex min-h-11 items-center gap-1.5 rounded-full bg-exit px-4 text-sm font-bold text-exit-foreground active:scale-95"
    >
      <X className="h-4 w-4" /> {t.exit}
    </button>
  );
}

export function BottomNav({ active }: { active: "inicio" | "chat" | "aprende" | "cuenta" }) {
  const { t } = useI18n();
  const items = [
    { to: "/", label: t.navHome, key: "inicio", Icon: Home },
    { to: "/chat", label: t.navChat, key: "chat", Icon: MessageCircle },
    { to: "/aprende", label: t.navLearn, key: "aprende", Icon: BookOpen },
    { to: "/cuenta", label: t.navSpace, key: "cuenta", Icon: UserRound },
  ] as const;
  return (
    <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ to, label, key, Icon }) => {
          const on = active === key;
          return (
            <Link
              key={key}
              to={to}
              aria-current={on ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${on ? "font-bold text-primary" : "font-medium text-muted-foreground"}`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${on ? "bg-secondary" : ""}`}>
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function IntentCTA({ source }: { source: string }) {
  const { t, lang } = useI18n();
  const [choice, setChoice] = useState<IntentChoice | null>(null);
  const [country, setCountry] = useState("");
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
        <label htmlFor="intent-country" className="text-foreground">{t.intentRegionAsk}</label>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!country) return;
            // Métrica de intención anónima (Fase 2): solo clave fija + código ISO. Pendiente: guardar en /api/intent.
            console.info("[intent]", { source, choice, country });
            setDone(true);
          }}
        >
          <select
            id="intent-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="min-h-11 min-w-0 flex-1 rounded-full border border-input bg-background px-3 text-foreground"
          >
            <option value="" disabled>{t.intentRegionPlaceholder}</option>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c[lang]}</option>)}
          </select>
          <button type="submit" disabled={!country} className="min-h-11 rounded-full bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50">
            {t.intentSend}
          </button>
        </form>
      </div>
    );
  }

  const options: { key: IntentChoice; label: string }[] = [
    { key: "specialist", label: t.intentSpecialist },
    { key: "clinics", label: t.intentClinics },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <p className="text-foreground">{t.intentQ}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.key} onClick={() => setChoice(o.key)} className="min-h-11 rounded-full bg-secondary px-4 font-medium text-secondary-foreground">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
