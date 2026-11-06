import type { Topic } from "./shared/lib/topics";
import { tr } from "./i18n";

// Las 4 categorías con su ícono (Ionicons) y la primera pregunta que se envía al abrir el chat.
export type TopicUI = { k: Topic; label: string; sub: string; icon: "medkit" | "heart" | "pulse" | "business"; start: string };

// Función (no constante) para que se traduzca con el idioma actual.
export const topicUI = (): TopicUI[] => [
  { k: "meds", label: tr("Medicamentos y recetas"), sub: tr("Cómo tomarlos y recordatorios"), icon: "medkit", start: tr("Quiero ayuda con mis medicamentos o una receta.") },
  { k: "sexual", label: tr("Salud sexual y reproductiva"), sub: tr("Anticoncepción, emergencias, ITS"), icon: "heart", start: tr("Tengo una duda de salud sexual o reproductiva.") },
  { k: "symptoms", label: tr("Síntomas y triaje"), sub: tr("Evaluación guiada de malestar o dolor"), icon: "pulse", start: tr("Tengo un malestar y quiero saber qué hacer.") },
  { k: "clinics", label: tr("Especialistas y clínicas"), sub: tr("Pruebas y telemedicina"), icon: "business", start: tr("Busco un especialista o una clínica.") },
];

export const disclaimer = () => tr("Chía es un asistente de triaje e información, no emite diagnósticos ni reemplaza la consulta con un médico.");
