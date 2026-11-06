import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

// Deslinde médico obligatorio + acceso a legales. Va al pie de Inicio, Mi espacio y Aprende.
export function LegalFooter() {
  const { t } = useI18n();
  return (
    <footer className="space-y-2 border-t border-border pt-4 text-center">
      <p className="text-[13px] leading-snug text-muted-foreground">{t.disclaimer}</p>
      <Link to="/legal" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">{t.legalLink}</Link>
    </footer>
  );
}
