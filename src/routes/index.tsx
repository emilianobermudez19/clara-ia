import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MessageCircle, BookOpen, Compass } from "lucide-react";
import { BottomNav } from "@/components/QuickExit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chia — Salud sexual anónima y sin juicios" },
      { name: "description", content: "Orientación de salud sexual con IA, anónima y gratuita, pensada para México." },
      { property: "og:title", content: "Chia — Salud sexual anónima y sin juicios" },
      { property: "og:description", content: "Pregunta lo que quieras sobre salud sexual, sin registro y sin juicios." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 pb-28 pt-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-4xl leading-tight text-foreground">Pregunta lo que necesites. Aquí nadie te juzga.</h1>
      <p className="mt-4 text-muted-foreground">Orientación sobre salud sexual con inteligencia artificial, basada en evidencia y pensada para México.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p>Sin registro, sin nombre, sin historial guardado. Al cerrar, tu conversación desaparece.</p>
      </div>

      <Link to="/chat" className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground">
        <MessageCircle className="h-5 w-5" /> Consulta anónima
      </Link>
      <Link to="/aprende" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-4 font-medium text-foreground">
        <BookOpen className="h-5 w-5" /> Explorar guías
      </Link>
      <Link to="/cuenta" className="mt-6 block text-center text-sm text-muted-foreground underline">Crear cuenta / Iniciar sesión (opcional)</Link>
      <BottomNav active="inicio" />
    </main>
  );
}
