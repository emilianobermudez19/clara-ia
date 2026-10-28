import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MessageCircle, BookOpen, Compass } from "lucide-react";
import { BottomNav } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chia — Anonymous, judgment-free sexual health" },
      { name: "description", content: "Anonymous, free AI sexual health guidance, in Spanish and English." },
      { property: "og:title", content: "Chia — Anonymous, judgment-free sexual health" },
      { property: "og:description", content: "Ask anything about sexual health, no sign-up and no judgment." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <main className="mx-auto min-h-screen max-w-md px-6 pb-28 pt-20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Compass className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-4xl leading-tight text-foreground">{t.homeTitle}</h1>
      <p className="mt-4 text-muted-foreground">{t.homeSub}</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{t.homePrivacy}</p>
      </div>

      <Link to="/chat" className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground">
        <MessageCircle className="h-5 w-5" /> {t.homeCTAChat}
      </Link>
      <Link to="/aprende" className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-4 font-medium text-foreground">
        <BookOpen className="h-5 w-5" /> {t.homeCTALearn}
      </Link>
      <Link to="/cuenta" className="mt-6 block text-center text-sm text-muted-foreground underline">{t.homeAccount}</Link>
      <BottomNav active="inicio" />
    </main>
  );
}
