import { Link } from "@tanstack/react-router";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useVault } from "@/lib/vault-context";
import { AUTH_COPY, CreateForm, UnlockForm } from "@/components/Auth";
import { Categories } from "@/components/Categories";
import { LogoMark } from "@/components/Logo";

// Entrada principal: acceso con PIN o creación de cuenta, con la Consulta Express siempre a la vista.
export function AuthGate() {
  const { t, lang } = useI18n();
  const c = AUTH_COPY[lang];
  const vault = useVault();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LogoMark className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-display text-2xl leading-tight text-foreground">{vault.exists ? c.unlockTitle : t.gateTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.gateSub}</p>
        </div>
      </div>

      <Link to="/chat" className="flex items-center gap-4 rounded-[24px] bg-primary p-5 text-primary-foreground">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15"><MessageCircle className="h-6 w-6" /></span>
        <span className="flex flex-col gap-0.5">
          <span className="text-lg font-bold">{t.expressTitle}</span>
          <span className="flex items-center gap-1.5 text-sm opacity-90"><ShieldCheck className="h-4 w-4" /> {t.expressSub}</span>
        </span>
      </Link>

      <section className="rounded-[24px] border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">{vault.exists ? t.gateEnter : t.gateCreate}</h2>
        {vault.exists ? <UnlockForm c={c} /> : <CreateForm c={c} />}
      </section>

      <Categories />
    </div>
  );
}
