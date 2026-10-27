import { X } from "lucide-react";

export function quickExit() {
  try { sessionStorage.clear(); } catch { /* noop */ }
  window.location.replace("https://www.google.com/search?q=clima+hoy");
}

export function QuickExit() {
  return (
    <button
      onClick={quickExit}
      aria-label="Salir de inmediato"
      className="fixed right-4 top-4 z-50 flex items-center gap-1.5 rounded-full bg-exit px-4 py-2 text-sm font-semibold text-exit-foreground shadow-lg active:scale-95"
    >
      <X className="h-4 w-4" /> Salir de inmediato
    </button>
  );
}

export function BottomNav({ active }: { active: "inicio" | "chat" | "aprende" }) {
  const items = [
    { to: "/", label: "Inicio", key: "inicio" },
    { to: "/chat", label: "Consulta", key: "chat" },
    { to: "/aprende", label: "Aprende", key: "aprende" },
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
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <p className="text-foreground">¿Quieres hablar con un especialista o buscar clínicas cercanas?</p>
      <div className="mt-3 flex gap-2">
        {["Hablar con especialista", "Clínicas cercanas"].map((l) => (
          <button
            key={l}
            onClick={(e) => {
              // Métrica de intención anónima (Fase 2). Sin datos personales.
              console.info("[intent]", { source, choice: l, at: new Date().toISOString() });
              (e.currentTarget.parentElement as HTMLElement).innerHTML = '<p class="text-muted-foreground">Gracias. Pronto habilitaremos esta opción. 💚</p>';
            }}
            className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground"
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
