// COPIA GENERADA desde src/lib/crisis.ts (web). No editar aquí: edita la web y corre npm run sync-shared.
// Detección local (en el navegador) de palabras de crisis, en español e inglés.
// Nunca se envía a terceros. / Local in-browser crisis keyword detection (ES + EN). Never sent anywhere.
const KEYWORDS = [
  // Español
  "suicid", "matarme", "quitarme la vida", "no quiero vivir", "autolesi", "cortarme", "hacerme daño",
  "me violaron", "violación", "violacion", "abuso", "abusaron", "me golpea", "me pega", "violencia",
  "me obligó", "me obligo", "me obligan", "me amenaza", "acoso", "me forzó", "me forzo",
  // English
  "suicide", "kill myself", "end my life", "don't want to live", "dont want to live",
  "self-harm", "self harm", "hurt myself", "cut myself", "raped", "rape", "abused", "abuse",
  "hits me", "beat me", "beats me", "forced me", "forces me", "threatens me", "assault",
];

// Frases inofensivas que contienen una palabra clave. / Harmless phrases that contain a keyword.
const EXCEPTIONS = [
  "cortarme el pelo", "cortarme el cabello", "cortarme las unas", "cortarme el fleco",
  "cut myself a slice", "cut myself some slack",
];

// normalize() puede no existir en el motor JS de la app móvil: entonces solo se pasa a minúsculas.
const strip = (s: string) => (typeof s.normalize === "function" ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : s.toLowerCase());
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Cada palabra clave debe empezar al inicio de una palabra: "rape" coincide con "raped",
// pero no con "grape" ni "drape". Las raíces ("suicid", "autolesi") siguen funcionando.
const PATTERNS = KEYWORDS.map((k) => new RegExp(`(^|[^a-z0-9])${escape(strip(k))}`));

export function detectCrisis(text: string): boolean {
  let t = strip(text);
  for (const e of EXCEPTIONS) t = t.split(e).join(" ");
  return PATTERNS.some((re) => re.test(t));
}

// Recursos internacionales: el directorio cubre líneas oficiales por país.
export interface Helpline {
  name: string;
  label: { es: string; en: string };
  desc: { es: string; en: string };
  href: string;
}

export const HELPLINES: Helpline[] = [
  {
    name: "Find a Helpline",
    label: { es: "findahelpline.com", en: "findahelpline.com" },
    desc: {
      es: "Directorio internacional de líneas de ayuda oficiales, filtrado por tu país.",
      en: "International directory of official helplines, filtered by your country.",
    },
    href: "https://findahelpline.com",
  },
  {
    name: "Befrienders Worldwide",
    label: { es: "befrienders.org", en: "befrienders.org" },
    desc: {
      es: "Apoyo emocional y prevención del suicidio en decenas de países.",
      en: "Emotional support and suicide prevention in dozens of countries.",
    },
    href: "https://befrienders.org",
  },
  {
    name: "Emergencias / Emergency",
    label: { es: "Tu número local de emergencias", en: "Your local emergency number" },
    desc: {
      es: "Si estás en peligro inmediato, llama al número de emergencias de tu país.",
      en: "If you are in immediate danger, call your country's emergency number.",
    },
    href: "https://findahelpline.com/i/iasp",
  },
];
