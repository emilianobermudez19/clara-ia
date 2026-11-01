// Ilustraciones propias de Chía: manos y objetos, sin rostros ni anatomía explícita.
// Línea de 3 px en ciruela, rellenos planos, tonos de piel diversos.
const INK = "#5A3E85";
const LAV = "#CDB8E3";

export function IlloPackage({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect x="22" y="22" width="56" height="56" rx="9" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <circle cx="50" cy="48" r="13" fill="none" stroke={LAV} strokeWidth="4" />
      <rect x="30" y="66" width="26" height="6" rx="3" fill={INK} />
      <circle cx="72" cy="28" r="10" fill="#2F6B4A" />
      <path d="M67 28 L70.5 31.5 L77 25" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IlloOpen({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M24 30 L66 30 L76 40 L76 76 L24 76 Z" fill="#FFFFFF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M66 30 L76 22 L84 30 L76 40" fill="#FFFFFF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M70 52 C74 44 82 40 90 42 L92 52 C86 52 80 56 78 62 Z" fill="#B07A5A" />
      <path d="M84 16 C90 18 94 24 92 30 L86 30 C86 26 84 22 80 20 Z" fill="#B07A5A" />
    </svg>
  );
}

export function IlloPinch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="66" rx="26" ry="9" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <path d="M34 62 C34 48 40 40 46 36 L54 36 C60 40 66 48 66 62" fill="#F5EFF9" stroke={INK} strokeWidth="3" />
      <rect x="45" y="22" width="10" height="16" rx="5" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <path d="M30 22 C36 18 42 22 44 28" fill="none" stroke="#7A4E36" strokeWidth="7" strokeLinecap="round" />
      <path d="M70 22 C64 18 58 22 56 28" fill="none" stroke="#7A4E36" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function IlloClock({ className = "", label = "72 h" }: { className?: string; label?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect x="20" y="20" width="60" height="58" rx="9" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <rect x="20" y="20" width="60" height="14" rx="7" fill={INK} />
      <text x="50" y="64" textAnchor="middle" fontFamily="Figtree, sans-serif" fontSize="18" fontWeight="700" fill="#3E2A5E">{label}</text>
    </svg>
  );
}

export function IlloTest({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect x="14" y="38" width="72" height="26" rx="13" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
      <rect x="38" y="44" width="28" height="14" rx="4" fill="#FAF8F5" stroke={LAV} strokeWidth="2" />
      <line x1="47" y1="46" x2="47" y2="56" stroke={INK} strokeWidth="3" />
      <circle cx="80" cy="30" r="10" fill="#2F6B4A" />
      <path d="M75 30 L78.5 33.5 L85 27" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type IlloName = "package" | "open" | "pinch" | "clock" | "test";
const MAP = { package: IlloPackage, open: IlloOpen, pinch: IlloPinch, clock: IlloClock, test: IlloTest };

export function Illo({ name, className }: { name: IlloName; className?: string }) {
  const C = MAP[name];
  return <C className={className} />;
}
