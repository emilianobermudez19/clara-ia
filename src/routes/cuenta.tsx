import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Cuenta opcional — Brújula" },
      { name: "description", content: "Las cuentas en Brújula son opcionales; puedes usar todo de forma anónima." },
      { property: "og:title", content: "Cuenta opcional — Brújula" },
      { property: "og:description", content: "Usa Brújula sin registrarte." },
    ],
  }),
  component: () => (
    <main className="mx-auto min-h-screen max-w-md px-6 pt-24">
      <h1 className="font-display text-3xl text-foreground">Cuentas, muy pronto</h1>
      <p className="mt-3 text-muted-foreground">Podrás guardar guías favoritas si lo deseas. Mientras tanto, todo funciona sin registro.</p>
      <Link to="/chat" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Ir a consulta anónima</Link>
    </main>
  ),
});
