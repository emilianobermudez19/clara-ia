import type { Topic } from "@/lib/topics";

// Las 4 categorías con su ícono (Ionicons) y la primera pregunta que se envía al abrir el chat.
export const TOPIC_UI: { k: Topic; label: string; sub: string; icon: "medkit" | "heart" | "pulse" | "business"; start: string }[] = [
  { k: "meds", label: "Medicamentos y recetas", sub: "Cómo tomarlos y recordatorios", icon: "medkit", start: "Quiero ayuda con mis medicamentos o una receta." },
  { k: "sexual", label: "Salud sexual y reproductiva", sub: "Anticoncepción, emergencias, ITS", icon: "heart", start: "Tengo una duda de salud sexual o reproductiva." },
  { k: "symptoms", label: "Síntomas y triaje", sub: "Evaluación guiada de malestar o dolor", icon: "pulse", start: "Tengo un malestar y quiero saber qué hacer." },
  { k: "clinics", label: "Especialistas y clínicas", sub: "Pruebas y telemedicina", icon: "business", start: "Busco un especialista o una clínica." },
];

export const DISCLAIMER = "Chía es un asistente de triaje e información, no emite diagnósticos ni reemplaza la consulta con un médico.";
