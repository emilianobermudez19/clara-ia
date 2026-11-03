// COPIA GENERADA desde src/content/medicines.ts (web). No editar aquí: edita la web y corre npm run sync-shared.
// Catálogo de medicamentos genéricos (México). Fuente: datos del prototipo Silvia, depurados para Chía:
// SIN dosis ni posología (regla del producto) y con tipo de acceso. Precios aproximados en MXN, solo orientativos.
// Antes de publicar: revisión por un profesional de farmacia (ver CONTENT.md).
export type MedAccess = "otc" | "rx" | "controlled";

export interface Medicine {
  id: string;
  name: string;
  brands: string[];
  category: string;
  uses: string;
  contraindications: string;
  priceMxn?: number | null;
  /** otc: venta libre · rx: requiere receta · controlled: receta especial */
  access: MedAccess;
}

export const MEDICINES: Medicine[] = [
  {
    "id": "med001",
    "name": "Paracetamol",
    "brands": [
      "Tylenol",
      "Tempra",
      "Feverall",
      "Panadol"
    ],
    "category": "Analgésico / Antipirético",
    "uses": "Fiebre, dolor leve a moderado, cefalea, dolor muscular, dolor dental",
    "contraindications": "Insuficiencia hepática grave, alergia al paracetamol",
    "priceMxn": 25,
    "access": "otc"
  },
  {
    "id": "med002",
    "name": "Ibuprofeno",
    "brands": [
      "Advil",
      "Motrin",
      "Brufen",
      "Ibupirac"
    ],
    "category": "AINE - Antiinflamatorio No Esteroideo",
    "uses": "Dolor, fiebre, inflamación, artritis, dismenorrea, dolor de espalda",
    "contraindications": "Úlcera péptica activa, insuficiencia renal grave, embarazo tercer trimestre",
    "priceMxn": 30,
    "access": "otc"
  },
  {
    "id": "med003",
    "name": "Amoxicilina",
    "brands": [
      "Amoxil",
      "Trimox",
      "Biomox"
    ],
    "category": "Antibiótico Betalactámico",
    "uses": "Infecciones bacterianas del tracto respiratorio, urinario, otitis, sinusitis, faringitis estreptocócica",
    "contraindications": "Alergia a penicilinas, mononucleosis infecciosa",
    "priceMxn": 80,
    "access": "rx"
  },
  {
    "id": "med004",
    "name": "Metformina",
    "brands": [
      "Glucophage",
      "Fortamet",
      "Glumetza"
    ],
    "category": "Antidiabético - Biguanida",
    "uses": "Diabetes mellitus tipo 2, síndrome de ovario poliquístico",
    "contraindications": "Insuficiencia renal, insuficiencia hepática, alcoholismo, ICC",
    "priceMxn": 45,
    "access": "rx"
  },
  {
    "id": "med005",
    "name": "Omeprazol",
    "brands": [
      "Prilosec",
      "Losec",
      "Zegerid"
    ],
    "category": "Inhibidor de Bomba de Protones",
    "uses": "ERGE, úlcera péptica, síndrome de Zollinger-Ellison, gastritis, protección gástrica con AINEs",
    "contraindications": "Hipersensibilidad al fármaco, uso con rilpivirina",
    "priceMxn": 50,
    "access": "otc"
  },
  {
    "id": "med006",
    "name": "Losartán",
    "brands": [
      "Cozaar",
      "Hyzaar"
    ],
    "category": "Antihipertensivo - ARA II",
    "uses": "Hipertensión arterial, nefropatía diabética, insuficiencia cardíaca",
    "contraindications": "Embarazo, hipercalemia, estenosis bilateral de arterias renales",
    "priceMxn": 55,
    "access": "rx"
  },
  {
    "id": "med007",
    "name": "Atorvastatina",
    "brands": [
      "Lipitor",
      "Torvast",
      "Sortis"
    ],
    "category": "Hipolipemiante - Estatina",
    "uses": "Hipercolesterolemia, dislipidemia mixta, prevención cardiovascular",
    "contraindications": "Enfermedad hepática activa, embarazo, lactancia",
    "priceMxn": 60,
    "access": "rx"
  },
  {
    "id": "med008",
    "name": "Ciprofloxacino",
    "brands": [
      "Cipro",
      "Ciproxin",
      "Proquin"
    ],
    "category": "Antibiótico - Fluoroquinolona",
    "uses": "ITU, infecciones gastrointestinales, infecciones respiratorias, ántrax",
    "contraindications": "Menores de 18 años (uso general), embarazo, lactancia, epilepsia",
    "priceMxn": 70,
    "access": "rx"
  },
  {
    "id": "med009",
    "name": "Salbutamol",
    "brands": [
      "Ventolin",
      "ProAir",
      "Proventil"
    ],
    "category": "Broncodilatador - Beta2 Agonista",
    "uses": "Asma bronquial, EPOC, broncoespasmo",
    "contraindications": "Hipertiroidismo no controlado, taquiarritmias",
    "priceMxn": 90,
    "access": "rx"
  },
  {
    "id": "med010",
    "name": "Loratadina",
    "brands": [
      "Claritin",
      "Alavert",
      "Clarityne"
    ],
    "category": "Antihistamínico - No Sedante",
    "uses": "Rinitis alérgica, urticaria, reacciones alérgicas leves",
    "contraindications": "Hipersensibilidad al fármaco",
    "priceMxn": 35,
    "access": "otc"
  },
  {
    "id": "med011",
    "name": "Diclofenaco",
    "brands": [
      "Voltaren",
      "Cataflam",
      "Zipsor"
    ],
    "category": "AINE - Antiinflamatorio",
    "uses": "Artritis, dolor musculoesquelético, dismenorrea, migraña",
    "contraindications": "Úlcera péptica, insuficiencia renal o hepática grave, embarazo tercer trimestre",
    "priceMxn": 40,
    "access": "rx"
  },
  {
    "id": "med012",
    "name": "Metronidazol",
    "brands": [
      "Flagyl",
      "Metrogel",
      "Noritate"
    ],
    "category": "Antibiótico / Antiprotozoario",
    "uses": "Infecciones por anaerobios, vaginosis bacteriana, tricomoniasis, amebiasis, giardiasis",
    "contraindications": "Primer trimestre del embarazo, hipersensibilidad",
    "priceMxn": 35,
    "access": "rx"
  },
  {
    "id": "med013",
    "name": "Azitromicina",
    "brands": [
      "Zithromax",
      "Zmax",
      "AzaSite"
    ],
    "category": "Antibiótico Macrólido",
    "uses": "Neumonía comunitaria, faringitis, sinusitis, infecciones cutáneas, ITS",
    "contraindications": "Arritmias cardíacas, prolongación QT, hipersensibilidad a macrólidos",
    "priceMxn": 95,
    "access": "rx"
  },
  {
    "id": "med014",
    "name": "Clonazepam",
    "brands": [
      "Klonopin",
      "Rivotril"
    ],
    "category": "Benzodiazepina / Antiepiléptico",
    "uses": "Epilepsia, trastorno de pánico, ansiedad (uso controlado)",
    "contraindications": "Glaucoma de ángulo cerrado, insuficiencia hepática grave, miastenia gravis",
    "priceMxn": 65,
    "access": "controlled"
  },
  {
    "id": "med015",
    "name": "Hidroclorotiazida",
    "brands": [
      "Microzide",
      "HydroDIURIL"
    ],
    "category": "Diurético Tiazídico",
    "uses": "Hipertensión arterial, edema, insuficiencia cardíaca congestiva",
    "contraindications": "Anuria, hipersensibilidad a sulfamidas, hipocalemia",
    "priceMxn": 30,
    "access": "rx"
  }
];

export const MED_ACCESS_LABEL: Record<MedAccess, string> = {
  otc: "Venta libre",
  rx: "Requiere receta",
  controlled: "Receta especial (controlado)",
};
