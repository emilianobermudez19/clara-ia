// Categorías de consulta. Cada una abre el chat con un contexto inicial para la IA.
export const TOPICS = ["meds", "sexual", "symptoms", "clinics"] as const;
export type Topic = (typeof TOPICS)[number];

export const isTopic = (x: unknown): x is Topic => typeof x === "string" && (TOPICS as readonly string[]).includes(x);

/** Instrucción para el modelo según la categoría elegida. Se añade después de las reglas clínicas. */
export function topicInstruction(topic: unknown): string {
  if (!isTopic(topic)) return "";
  const map: Record<Topic, string> = {
    meds: "Consultation topic: MEDICINES & PRESCRIPTIONS. Help the person understand medicines their doctor already prescribed, how to take them as prescribed, side effects, generics of the same active ingredient, and setting reminders in My space. Never give or change doses of prescription medicines.",
    sexual: "Consultation topic: SEXUAL & REPRODUCTIVE HEALTH. Contraception, emergency contraception, condoms, STIs, PrEP/PEP, consent and testing. Be especially non-judgmental. Check first whether there is any time-sensitive situation (last 72 hours).",
    symptoms: "Consultation topic: SYMPTOMS & TRIAGE. Run a guided triage: ask one short question at a time (what, where, since when, how intense 1–10, fever, other symptoms, age range, pregnancy if relevant). Check red flags first. End with one clear level of care.",
    clinics: "Consultation topic: SPECIALISTS & CLINICS. Help the person decide which kind of service or specialist fits their need and how to find free or low-cost options (public health centers, STI clinics, community organizations). Mention they can request a telehealth consultation in My space.",
  };
  return map[topic];
}
