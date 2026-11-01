// Logotipo de Chía: un corazón que se abre en globo de mensaje (conversación confidencial).
export function LogoMark({ className = "h-8 w-8", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 60" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path
        d="M32 54 L8.5 30.5 C2.5 24.5 2.5 14.8 8.5 8.8 C14.4 2.9 23.9 2.9 29.8 8.8 L32 11 L34.2 8.8 C40.1 2.9 49.6 2.9 55.5 8.8 C61.5 14.8 61.5 24.5 55.5 30.5 L50 36 L56 44 L44 41.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-primary ${className}`}>
      <LogoMark className="h-7 w-7" />
      <span className="text-xl font-bold tracking-tight text-foreground">Chía</span>
    </span>
  );
}
