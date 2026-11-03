// COPIA GENERADA desde src/lib/otc-guard.ts (web). No editar aquí: edita la web y corre npm run sync-shared.
// Filtro final sobre las respuestas de la IA (web, móvil y WhatsApp).
// Red de seguridad por si el modelo no sigue el master prompt:
//  1) oculta dosis y horarios de administración;
//  2) si nombra un medicamento de venta libre, garantiza la frase de deslinde.
// Las recetas que la persona ya tiene se explican en el módulo de recetas, no aquí.
import { guessLang } from "./mock-answers";

const OTC_DISCLAIMER = {
  es: "Consulta a tu médico o farmacéutico para la dosis exacta.",
  en: "Ask your doctor or pharmacist for the exact dose.",
};

const OTC_NAMES = [
  "paracetamol", "acetaminofen", "acetaminophen", "ibuprofeno", "ibuprofen", "naproxeno", "naproxen", "aspirina", "aspirin",
  "acido acetilsalicilico", "diclofenaco", "loratadina", "loratadine", "cetirizina", "cetirizine", "omeprazol", "omeprazole",
  "antiacido", "antacid", "suero oral", "sales de rehidratacion", "oral rehydration", "loperamida", "loperamide",
  "clotrimazol", "clotrimazole", "dextrometorfano", "dextromethorphan", "pseudoefedrina", "pseudoephedrine",
];

const strip = (s: string) =>
  (typeof s.normalize === "function" ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s).toLowerCase();

// Dosis ("500 mg", "1 g", "2 tabletas") y horarios ("cada 8 horas", "3 veces al día", "every 6 hours").
const DOSE = /\b\d+(?:[.,]\d+)?\s?(?:mg|mcg|µg|g|ml|gotas|drops|tabletas?|tablets?|pastillas?|pills?|capsulas?|cápsulas?|capsules?|comprimidos?|sobres?)\b/gi;
const SCHEDULE = /\b(?:cada|every)\s+\d+\s?(?:-\s?\d+\s?)?(?:horas?|hours?|h)\b|\b\d+\s?(?:veces|times)\s+(?:al|por|a|per|a)\s+(?:d[ií]a|day)\b/gi;

export function mentionsOtc(text: string): boolean {
  const t = strip(text);
  return OTC_NAMES.some((n) => t.includes(n));
}

export function enforceOtcRules(text: string): string {
  if (!mentionsOtc(text)) return text;
  const lang = guessLang(text);
  const hidden = lang === "en" ? "[dose: ask your pharmacist]" : "[dosis: consulta a tu farmacéutico]";
  let out = text.replace(DOSE, hidden).replace(SCHEDULE, hidden);
  const disclaimer = OTC_DISCLAIMER[lang];
  if (!strip(out).includes(strip(disclaimer).slice(0, 30))) out = `${out.trimEnd()}\n\n${disclaimer}`;
  return out;
}
