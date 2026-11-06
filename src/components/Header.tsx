import { Moon, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Logo } from "@/components/Logo";

// Barra superior: logo, idioma y tema. "Salir rápido" vive aparte (QuickExit) a la derecha.
export function Header() {
  const { lang, setLang, theme, toggleTheme, t } = useI18n();
  return (
    <div className="safe-header fixed inset-x-0 top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-md items-center gap-2 px-4 pr-40">
        <Link to="/" aria-label="Chía, inicio" className="mr-auto">
          <Logo />
        </Link>
        <div className="flex rounded-full bg-secondary p-0.5 text-xs font-semibold">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`min-h-9 min-w-9 rounded-full px-2 uppercase ${lang === l ? "bg-primary text-primary-foreground" : "text-secondary-foreground"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
