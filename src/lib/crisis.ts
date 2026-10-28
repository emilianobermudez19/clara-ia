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

export function detectCrisis(text: string): boolean {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return KEYWORDS.some((k) => t.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
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
