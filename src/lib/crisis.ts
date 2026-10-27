// Detección local (en el navegador) de palabras de crisis. Nunca se envía a terceros.
const KEYWORDS = [
  "suicid", "matarme", "quitarme la vida", "no quiero vivir", "autolesi", "cortarme", "hacerme daño",
  "me violaron", "violación", "violacion", "abuso", "abusaron", "me golpea", "me pega", "violencia",
  "me obligó", "me obligo", "me obligan", "me amenaza", "acoso", "me forzó", "me forzo",
];

export function detectCrisis(text: string): boolean {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return KEYWORDS.some((k) => t.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
}

export const HELPLINES = [
  { name: "Línea de la Vida", phone: "800 911 2000", tel: "8009112000", desc: "Apoyo emocional y en crisis, 24/7, gratuito y confidencial." },
  { name: "Emergencias", phone: "911", tel: "911", desc: "Si estás en peligro inmediato." },
  { name: "CENSIDA / TelSIDA", phone: "800 712 0886", tel: "8007120886", desc: "Orientación gratuita sobre VIH e ITS." },
];
