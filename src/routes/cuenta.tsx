import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cuenta")({
  head: () => ({
    meta: [
      { title: "Optional account — Chia" },
      { name: "description", content: "Accounts on Chia are optional; everything works anonymously." },
      { property: "og:title", content: "Optional account — Chia" },
      { property: "og:description", content: "Use Chia without signing up." },
    ],
  }),
  component: Cuenta,
});

function Cuenta() {
  const { t } = useI18n();
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 pt-24">
      <h1 className="font-display text-3xl text-foreground">{t.accountTitle}</h1>
      <p className="mt-3 text-muted-foreground">{t.accountBody}</p>
      <Link to="/chat" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">{t.accountCTA}</Link>
    </main>
  );
}
