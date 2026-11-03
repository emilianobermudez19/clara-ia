// COPIA GENERADA desde src/content/guides.ts (web). No editar aquí: edita la web y corre npm run sync-shared.
// Contenido educativo de Chía, separado de la interfaz para poder revisarlo clínicamente
// (y, más adelante, cargarlo desde un CMS sin tocar código).
//
// Reglas de calidad (ver CONTENT.md):
// - Cada guía lleva fuentes y, antes de publicarse como "revisada", el nombre del profesional y la fecha.
// - Multimedia solo con licencia libre verificada (CC0, CC BY, dominio público) o material propio.
// - Los videos se cargan solo cuando la persona toca "Ver video" (sin rastreo previo).
type Lang = "es" | "en";
type IlloName = "package" | "open" | "pinch" | "clock" | "test";

export type L = Record<Lang, string>;

export type MediaLicense = "CC0" | "CC BY 4.0" | "CC BY-SA 4.0" | "Dominio público" | "Propio";

export interface GuideMedia {
  kind: "image" | "video";
  /** Ruta en /public/media/… o URL de un host permitido. */
  src: string;
  /** Para video: imagen de portada mostrada antes de cargarlo. */
  poster?: string;
  alt: L;
  caption?: L;
  credit: string;
  license: MediaLicense;
  sourceUrl: string;
}

export interface ClinicalReview {
  reviewer: string; // nombre y cédula / institución
  date: string; // AAAA-MM-DD
}

export interface Guide {
  id: string;
  t: L;
  steps: L[];
  min: number;
  illos?: IlloName[];
  media?: GuideMedia[];
  sources?: { label: string; url: string }[];
  review?: ClinicalReview;
}

export interface Myth {
  m: L;
  r: L;
  min: number;
}

export const GUIDES: Guide[] = [
  {
    id: "condon-externo",
    t: { es: "Cómo usar un condón externo", en: "How to use an external condom" },
    min: 2,
    illos: ["package", "open", "pinch"],
    sources: [{ label: "OMS — Condones", url: "https://www.who.int/news-room/fact-sheets/detail/condoms" }],
    steps: [
      { es: "Revisa la caducidad y que el empaque tenga aire.", en: "Check the expiry date and that the wrapper has air inside." },
      { es: "Ábrelo con los dedos, no con los dientes.", en: "Open it with your fingers, not your teeth." },
      { es: "Aprieta la punta y desenróllalo sobre el pene erecto.", en: "Pinch the tip and roll it down over the erect penis." },
      { es: "Al terminar, sujétalo por la base al retirar.", en: "When done, hold it at the base while pulling out." },
      { es: "Tíralo a la basura, nunca al inodoro.", en: "Throw it in the trash, never in the toilet." },
    ],
  },
  {
    id: "anticoncepcion-emergencia",
    t: { es: "Anticoncepción de emergencia", en: "Emergency contraception" },
    min: 2,
    illos: ["clock"],
    sources: [{ label: "OMS — Anticoncepción de emergencia", url: "https://www.who.int/news-room/fact-sheets/detail/emergency-contraception" }],
    steps: [
      { es: "Tómala lo antes posible, hasta 72–120 h después.", en: "Take it as soon as possible, up to 72–120 hours after." },
      { es: "En muchos países se vende sin receta en farmacias.", en: "In many countries it's sold over the counter at pharmacies." },
      { es: "No es abortiva ni protege de ITS.", en: "It is not an abortion pill and does not protect against STIs." },
      { es: "No es un método regular: busca uno de largo plazo.", en: "It's not a regular method: look into a long-term one." },
    ],
  },
  {
    id: "prueba-vih",
    t: { es: "Hacerte una prueba de VIH", en: "Getting an HIV test" },
    min: 2,
    illos: ["test"],
    sources: [{ label: "OMS — VIH", url: "https://www.who.int/news-room/fact-sheets/detail/hiv-aids" }],
    steps: [
      { es: "Es gratuita o de bajo costo en muchos centros de salud.", en: "It's free or low-cost at many health centers." },
      { es: "La prueba rápida da resultado en ~20 minutos.", en: "Rapid tests give results in about 20 minutes." },
      { es: "Es confidencial; no necesitas acompañante.", en: "It's confidential; you don't need anyone with you." },
      { es: "Si hubo una exposición reciente, pregunta por PEP (antes de 72 h).", en: "If there was a recent exposure, ask about PEP (within 72 hours)." },
    ],
  },
];

export const MYTHS: Myth[] = [
  {
    m: { es: "La primera vez no te puedes embarazar.", en: "You can't get pregnant the first time." },
    r: { es: "Falso. Puede haber embarazo desde la primera relación sin protección.", en: "False. Pregnancy can happen from the very first unprotected sex." },
    min: 1,
  },
  {
    m: { es: "El VIH se transmite por besos o compartir vasos.", en: "HIV spreads through kissing or sharing glasses." },
    r: { es: "Falso. Solo por sangre, semen, fluidos vaginales y leche materna.", en: "False. Only through blood, semen, vaginal fluids and breast milk." },
    min: 1,
  },
  {
    m: { es: "Si no hay síntomas, no tengo una ITS.", en: "No symptoms means no STI." },
    r: { es: "Falso. Muchas ITS no dan síntomas; la prueba es la única forma de saber.", en: "False. Many STIs show no symptoms; testing is the only way to know." },
    min: 1,
  },
  {
    m: { es: "Indetectable = intransmisible.", en: "Undetectable = untransmittable." },
    r: { es: "Realidad. Con carga viral indetectable sostenida el VIH no se transmite por vía sexual (U=U).", en: "Fact. With a sustained undetectable viral load, HIV is not sexually transmitted (U=U)." },
    min: 1,
  },
];
