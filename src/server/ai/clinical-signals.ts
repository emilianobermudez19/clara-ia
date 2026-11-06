// Señales clínicas detectadas EN CÓDIGO (no dependen de que el modelo "se acuerde").
// Se inyectan al prompt como avisos prioritarios para el turno actual.
// Diseño conservador: es preferible un falso positivo (más precaución) que pasar por alto una urgencia.
import type { HealthContext } from "./master-prompt";

const strip = (s: string) =>
  (typeof s.normalize === "function" ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s).toLowerCase();

const has = (text: string, words: readonly string[]) => {
  const t = ` ${strip(text)} `;
  return words.some((w) => t.includes(strip(w)));
};

// ── Banderas rojas (ES/EN) ─────────────────────────────────────────
const RED_FLAGS: Record<string, readonly string[]> = {
  "chest pain": ["dolor en el pecho", "dolor de pecho", "dolor toracico", "opresion en el pecho", "chest pain", "chest pressure"],
  "breathing difficulty": ["no puedo respirar", "dificultad para respirar", "me falta el aire", "falta de aire", "me ahogo", "can't breathe", "cant breathe", "short of breath", "trouble breathing"],
  "heavy bleeding": ["sangrado abundante", "sangro mucho", "hemorragia", "mucha sangre", "empapo una toalla", "heavy bleeding", "bleeding a lot", "soaking a pad"],
  "severe abdominal or pelvic pain": ["dolor abdominal fuerte", "dolor muy fuerte en el vientre", "dolor intenso en el abdomen", "dolor pelvico fuerte", "severe abdominal pain", "severe stomach pain", "severe pelvic pain"],
  "pregnancy warning sign": ["embarazada y sangro", "sangrado en el embarazo", "embarazada con dolor", "bleeding while pregnant", "pregnant and bleeding"],
  "loss of consciousness or confusion": ["me desmaye", "se desmayo", "perdio el conocimiento", "desmayo", "confusion", "fainted", "passed out", "unconscious"],
  "seizure": ["convulsion", "convulsiones", "seizure"],
  "stroke signs": ["cara caida", "no puedo mover el brazo", "no puedo hablar bien", "face drooping", "slurred speech", "arm weakness"],
  "severe allergic reaction": ["se me cierra la garganta", "hinchazon de labios", "anafilaxia", "throat closing", "anaphylaxis", "lips swelling"],
  "stiff neck with fever": ["cuello rigido", "rigidez de nuca", "stiff neck"],
  "suicidal thoughts or self-harm": ["suicid", "matarme", "quitarme la vida", "no quiero vivir", "hacerme dano", "autolesion", "cortarme", "kill myself", "end my life", "self-harm", "self harm", "hurt myself"],
  "sexual assault": ["me violaron", "violacion", "abusaron de mi", "me forzo", "me obligo a tener", "raped", "sexual assault", "forced me"],
};

export function detectRedFlags(text: string): string[] {
  const flags = Object.entries(RED_FLAGS).filter(([, words]) => has(text, words)).map(([k]) => k);
  // "cortarme el pelo" y similares no son autolesión
  if (flags.includes("suicidal thoughts or self-harm") && has(text, ["cortarme el pelo", "cortarme el cabello", "cortarme las unas"]) && !has(text, RED_FLAGS["suicidal thoughts or self-harm"]!.filter((w) => w !== "cortarme"))) {
    return flags.filter((f) => f !== "suicidal thoughts or self-harm");
  }
  return flags;
}

// ── Ventana de 72 horas (salud sexual) ─────────────────────────────
const WINDOW_72H = [
  "se rompio el condon", "se me rompio el condon", "condon roto", "se salio el condon", "sin condon", "sin proteccion", "sin protegernos",
  "olvide la pastilla", "olvide tomar la pastilla", "se me olvido la pastilla", "fallo el anticonceptivo",
  "relaciones sin", "tuve sexo sin", "posible exposicion", "me pude contagiar", "me expuse", "pastilla del dia siguiente",
  "condom broke", "broken condom", "condom slipped", "without a condom", "unprotected", "no protection", "missed my pill", "forgot my pill",
  "morning after", "possible exposure", "might have been exposed",
];

export const detectExposureWindow = (text: string) => has(text, WINDOW_72H);

// ── Cruce con la ficha ─────────────────────────────────────────────
const FICHA_RULES: { test: (c: string) => boolean; note: string }[] = [
  {
    test: (c) => /\b(aine|aines|nsaid|ibuprofen|naproxen|naproxeno|diclofenac|diclofenaco|aspirin|aspirina|acido acetilsalicilico|ketorolac)/.test(c) && /alerg/.test(c),
    note: "NSAID allergy: do NOT mention ibuprofen, naproxen, aspirin, diclofenac or any NSAID.",
  },
  {
    test: (c) => /\b(penicilin|amoxicilin|ampicilin|betalactam|beta-lactam|cefalospor)/.test(c) && /alerg/.test(c),
    note: "Penicillin/beta-lactam allergy: say clearly that any antibiotic must be chosen by a doctor who knows about this allergy (this matters for syphilis, gonorrhea and other STI treatment).",
  },
  { test: (c) => /\b(anticoagula|warfarin|acenocumarol|rivaroxaban|apixaban|dabigatran|heparin|clopidogrel)/.test(c), note: "Anticoagulant/antiplatelet use: do NOT suggest NSAIDs or aspirin; bleeding symptoms need prompt medical care." },
  { test: (c) => /\b(renal|rinon|rinones|kidney|insuficiencia renal|dialisis|dialysis)/.test(c), note: "Kidney disease: do NOT suggest NSAIDs." },
  { test: (c) => /\b(ulcera|gastritis|ulcer|sangrado digestivo|gi bleed)/.test(c), note: "Stomach ulcer/gastritis: do NOT suggest NSAIDs or aspirin." },
  { test: (c) => /\b(hepat|cirrosis|cirrhosis|higado|liver)/.test(c), note: "Liver disease: do NOT suggest paracetamol/acetaminophen without a doctor; prefer referral." },
  { test: (c) => /\b(embaraz|pregnan|lactan|breastfeed|amamant)/.test(c), note: "Pregnancy or breastfeeding: every medicine, including OTC, must be confirmed by a doctor or pharmacist; avoid NSAIDs in pregnancy." },
  { test: (c) => /\b(asma|asthma)/.test(c), note: "Asthma: NSAIDs can trigger bronchospasm in some people; prefer pharmacist advice." },
  { test: (c) => /\b(hipertension|hypertension|presion alta|high blood pressure|insuficiencia cardiaca|heart failure)/.test(c), note: "High blood pressure or heart disease: avoid decongestants (pseudoephedrine) and NSAIDs without medical advice." },
  { test: (c) => /\b(vih|hiv|antirretrovir|antiretrovir|prep\b)/.test(c), note: "HIV medication or PrEP: many interactions; suggest confirming any new medicine with their HIV clinic or pharmacist." },
];

const SEXUAL_HEALTH_VACCINES = /\b(vph|hpv|hepatitis b|hepatitis a)/;

export interface RecordSignals {
  safetyNotes: string[];
  pendingVaccines: string[];
}

/** Cruza alergias, condiciones y medicamentos con reglas de seguridad, y lista vacunas pendientes. */
export function analyzeRecord(ctx: HealthContext | null | undefined): RecordSignals {
  if (!ctx) return { safetyNotes: [], pendingVaccines: [] };
  const all = strip([ctx.allergies, ctx.conditions, ctx.medications].filter(Boolean).join(" | "));
  const safetyNotes = FICHA_RULES.filter((r) => r.test(all)).map((r) => r.note);
  const pendingVaccines = (ctx.vaccines ?? "")
    .split(";")
    .map((v) => v.trim())
    .filter((v) => /\(pending\)/.test(v))
    .map((v) => v.replace(/\s*\(pending\)/, ""));
  return { safetyNotes, pendingVaccines };
}

export const isSexualHealthVaccine = (name: string) => SEXUAL_HEALTH_VACCINES.test(strip(name));
