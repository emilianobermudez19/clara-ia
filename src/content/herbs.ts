// Herbolaria mexicana: COMPLEMENTO, nunca sustituto de un tratamiento médico.
// Fuente: datos del prototipo Silvia (referencias de herbolaria UNAM), depurados para Chía:
// sin cantidades de preparación ni "equivalentes farmacológicos", y con nivel de precaución.
// Antes de publicar: revisión por un profesional (ver CONTENT.md).
export type HerbCaution = "normal" | "high" | "topical" | "avoid";

export interface Herb {
  id: string;
  name: string;
  scientific: string;
  uses: string;
  contraindications: string;
  interactions: string;
  availability: string;
  /** normal · high: precaución alta · topical: solo uso externo · avoid: no recomendada */
  caution: HerbCaution;
}

export const HERBS: Herb[] = [
  {
    "id": "herb001",
    "name": "Manzanilla",
    "scientific": "Matricaria chamomilla",
    "uses": "Cólicos intestinales, gastritis, ansiedad leve, insomnio, conjuntivitis, inflamación de mucosas, dolor menstrual",
    "contraindications": "Alergia a plantas de la familia Asteraceae (girasol, crisantemo). Embarazo en dosis altas.",
    "interactions": "Potencia anticoagulantes (warfarina, aspirina). Puede aumentar efecto de sedantes.",
    "availability": "Alta - tianguis, mercados, tiendas naturistas",
    "caution": "normal"
  },
  {
    "id": "herb002",
    "name": "Aloe vera / Sábila",
    "scientific": "Aloe barbadensis miller",
    "uses": "Quemaduras leves, heridas superficiales, irritación de piel, estreñimiento (látex), gastritis, úlceras",
    "contraindications": "Látex de aloe oral contraindicado en embarazo, menstruación, hemorroides, colitis. No ingerir látex amarillo.",
    "interactions": "Látex puede potenciar diuréticos y laxantes. Puede alterar absorción de medicamentos orales.",
    "availability": "Muy alta - se cultiva en casi todos los hogares mexicanos",
    "caution": "normal"
  },
  {
    "id": "herb003",
    "name": "Epazote",
    "scientific": "Dysphania ambrosioides",
    "uses": "Parásitos intestinales (áscaris, amibas), cólicos, gases, diarrea, menstruación irregular",
    "contraindications": "Embarazo (abortivo en dosis altas). Niños menores de 2 años. Insuficiencia hepática o renal.",
    "interactions": "No combinar con antiparasitarios farmacológicos sin indicación médica.",
    "availability": "Alta - mercados de abarrotes y tianguis",
    "caution": "high"
  },
  {
    "id": "herb004",
    "name": "Gordolobo",
    "scientific": "Verbascum thapsus / Gnaphalium spp.",
    "uses": "Tos, catarro, bronquitis, asma leve, dolor de garganta, expectorante",
    "contraindications": "Ninguna conocida en dosis normales. Precaución en embarazo.",
    "interactions": "Puede potenciar ligeramente antidiabéticos orales.",
    "availability": "Alta - mercados de hierbas medicinales",
    "caution": "normal"
  },
  {
    "id": "herb005",
    "name": "Menta / Hierbabuena",
    "scientific": "Mentha piperita / Mentha spicata",
    "uses": "Náuseas, indigestión, dolor de cabeza, cólicos, gases, síndrome de intestino irritable, resfriado",
    "contraindications": "Reflujo gastroesofágico (relaja esfínter esofágico). No aplicar aceite esencial en cara de niños pequeños.",
    "interactions": "Puede inhibir CYP3A4, afectando metabolismo de algunos medicamentos. Potencia antiácidos.",
    "availability": "Muy alta - jardines, mercados, supermercados",
    "caution": "normal"
  },
  {
    "id": "herb006",
    "name": "Nopal",
    "scientific": "Opuntia ficus-indica",
    "uses": "Control glucemia en diabetes tipo 2, colesterol, estreñimiento, gastritis, inflamación",
    "contraindications": "Diarrea activa. Puede reducir absorción de algunos medicamentos si se toma simultáneamente.",
    "interactions": "IMPORTANTE: Puede potenciar hipoglucemiantes orales e insulina. Monitorear glucosa.",
    "availability": "Muy alta - alimento cotidiano en México",
    "caution": "normal"
  },
  {
    "id": "herb007",
    "name": "Ajo",
    "scientific": "Allium sativum",
    "uses": "Hipertensión leve, colesterol, infecciones respiratorias, antimicrobiano, antifúngico",
    "contraindications": "Úlcera péptica activa. Antes de cirugía (efecto anticoagulante).",
    "interactions": "IMPORTANTE: Potencia anticoagulantes (warfarina, heparina). Puede reducir eficacia de saquinavir (VIH).",
    "availability": "Muy alta - cocina mexicana cotidiana",
    "caution": "normal"
  },
  {
    "id": "herb008",
    "name": "Tila / Tilo",
    "scientific": "Tilia mexicana",
    "uses": "Ansiedad, insomnio, nerviosismo, palpitaciones, hipertensión leve, cefalea tensional",
    "contraindications": "Hipersensibilidad. Uso prolongado puede afectar el corazón (raras).",
    "interactions": "Potencia sedantes, ansiolíticos y antihipertensivos. No combinar con alcohol.",
    "availability": "Alta - tiendas de herbolaria, mercados",
    "caution": "normal"
  },
  {
    "id": "herb009",
    "name": "Cúrcuma",
    "scientific": "Curcuma longa",
    "uses": "Inflamación articular, gastritis, úlceras, hígado graso, dolor crónico, cicatrización",
    "contraindications": "Cálculos biliares o vía biliar obstruida. Dosis altas en embarazo.",
    "interactions": "Puede potenciar anticoagulantes y antiagregantes. Puede reducir absorción de hierro.",
    "availability": "Media - supermercados, tiendas naturistas",
    "caution": "normal"
  },
  {
    "id": "herb010",
    "name": "Ruda",
    "scientific": "Ruta graveolens",
    "uses": "Dolor de cabeza, cólicos menstruales, nerviosismo, insectos (repelente)",
    "contraindications": "CONTRAINDICADA en embarazo (abortiva). Dosis altas son tóxicas. Fotosensibilizante.",
    "interactions": "Fotosensibilización. Puede potenciar anticoagulantes.",
    "availability": "Alta - se cultiva en jardines y macetas",
    "caution": "avoid"
  },
  {
    "id": "herb011",
    "name": "Jengibre",
    "scientific": "Zingiber officinale",
    "uses": "Náuseas (embarazo, quimio, mareo), indigestión, resfriado, dolor articular, circulación",
    "contraindications": "Cálculos biliares. Dosis altas antes de cirugía. Úlcera péptica activa.",
    "interactions": "Potencia anticoagulantes y antiagregantes. Puede interactuar con antidiabéticos.",
    "availability": "Muy alta - cocina y supermercados",
    "caution": "normal"
  },
  {
    "id": "herb012",
    "name": "Flor de Jamaica",
    "scientific": "Hibiscus sabdariffa",
    "uses": "Hipertensión arterial leve, colesterol, infecciones urinarias, antioxidante, diurético",
    "contraindications": "Hipotensión. Embarazo en dosis altas (efecto uterotónico). Insuficiencia renal.",
    "interactions": "IMPORTANTE: Puede potenciar antihipertensivos. Puede afectar niveles de cloroquina.",
    "availability": "Muy alta - bebida popular en México",
    "caution": "normal"
  },
  {
    "id": "herb013",
    "name": "Árnica",
    "scientific": "Arnica montana / Heterotheca inuloides (árnica mexicana)",
    "uses": "Golpes, moretones, inflamación muscular y articular, torceduras (USO TÓPICO EXCLUSIVO)",
    "contraindications": "USO ORAL TÓXICO. No aplicar en heridas abiertas. Alergia a Asteraceae.",
    "interactions": "Tópico puede potenciar anticoagulantes al absorberse. No oral.",
    "availability": "Alta - farmacias, tiendas naturistas",
    "caution": "topical"
  },
  {
    "id": "herb014",
    "name": "Prodigiosa / Hoja de aire",
    "scientific": "Brickellia cavanillesii",
    "uses": "Diabetes tipo 2, hígado, vesícula, hipertensión leve, indigestión, cólicos",
    "contraindications": "Embarazo. Uso prolongado puede afectar función hepática.",
    "interactions": "IMPORTANTE: Potencia hipoglucemiantes. Monitoreo glucémico necesario.",
    "availability": "Alta - mercados de hierbas en México",
    "caution": "high"
  },
  {
    "id": "herb015",
    "name": "Copalchi / Quina mexicana",
    "scientific": "Hintonia latiflora",
    "uses": "Diabetes tipo 2, paludismo (uso histórico), fiebre, digestión",
    "contraindications": "Embarazo. Hipoglucemia. No usar en menores.",
    "interactions": "Potencia significativamente hipoglucemiantes orales e insulina. Riesgo de hipoglucemia.",
    "availability": "Media - tiendas de herbolaria especializadas",
    "caution": "high"
  }
];

export const HERB_CAUTION_LABEL: Record<HerbCaution, string> = {
  normal: "Precaución habitual",
  high: "Precaución alta",
  topical: "Solo uso externo: tóxica por vía oral",
  avoid: "No recomendada: riesgo de toxicidad",
};

export const HERB_NOTICE =
  "La herbolaria no reemplaza la atención médica ni los medicamentos que te recetaron. Consulta a tu médico antes de combinar plantas con medicamentos, en el embarazo o la lactancia, y nunca las des a niñas o niños sin indicación médica.";
