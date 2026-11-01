// Lista cerrada de países para métricas anónimas: solo código ISO, nunca texto libre.
export interface Country { code: string; es: string; en: string }

export const COUNTRIES: Country[] = [
  { code: "MX", es: "México", en: "Mexico" },
  { code: "US", es: "Estados Unidos", en: "United States" },
  { code: "CO", es: "Colombia", en: "Colombia" },
  { code: "AR", es: "Argentina", en: "Argentina" },
  { code: "CL", es: "Chile", en: "Chile" },
  { code: "PE", es: "Perú", en: "Peru" },
  { code: "EC", es: "Ecuador", en: "Ecuador" },
  { code: "GT", es: "Guatemala", en: "Guatemala" },
  { code: "ES", es: "España", en: "Spain" },
  { code: "DE", es: "Alemania", en: "Germany" },
  { code: "OTHER", es: "Otro país", en: "Another country" },
  { code: "NONE", es: "Prefiero no decir", en: "Prefer not to say" },
];

export const isCountryCode = (c: unknown): c is string =>
  typeof c === "string" && COUNTRIES.some((x) => x.code === c);

export type IntentChoice = "specialist" | "clinics";

/** Evento anónimo para `intent_events`: sin IP, sin hora exacta, sin texto libre. */
export function buildIntentEvent(source: string, choice: IntentChoice, country: string, now = new Date()) {
  if (!isCountryCode(country)) throw new Error("invalid country");
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // lunes de esa semana
  return { source, choice, country_code: country, created_week: d.toISOString().slice(0, 10) };
}
