import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const { lang, setLang, theme, toggleTheme, t } = useI18n();
  return (
    <div className="fixed left-4 top-4 z-50 flex items-center gap-2">
      <div className="flex rounded-full border border-border bg-card/90 text-xs font-semibold backdrop-blur">
        {(["es", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`rounded-full px-2.5 py-1.5 uppercase ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <button
        onClick={toggleTheme}
        aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground backdrop-blur"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
