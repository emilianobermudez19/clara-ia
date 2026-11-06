// Respuestas de demostración: permiten probar Chía sin clave de IA.
// Están escritas a mano, siguen las mismas reglas que el modelo real (sin diagnósticos ni dosis de receta)
// y sirven también como "respuestas de oro" para evaluar a futuros modelos.

export type MockLang = "es" | "en";

interface Entry {
  keys: string[];
  es: string;
  en: string;
}

const ENTRIES: Entry[] = [
  {
    keys: ["poner un condon", "ponerme un condon", "usar un condon", "uso un condon", "put on a condom", "use a condom"],
    es: "Así se usa un condón externo, paso a paso:\n\n[[media:condon-externo]]\n\nUsa uno nuevo en cada relación y nunca dos a la vez. Si se rompe, tienes 72 horas para la anticoncepción de emergencia y la PEP.",
    en: "Here's how to use an external condom, step by step:\n\n[[media:condon-externo]]\n\nUse a new one every time and never two at once. If it breaks, you have 72 hours for emergency contraception and PEP.",
  },
  {
    keys: ["rompio", "roto", "rompe", "broke", "broken", "emergencia", "emergency", "pastilla del dia siguiente", "morning after"],
    es: "Todavía puedes actuar. Hay dos cosas que importan ahora:\n\n- **Evitar un embarazo:** la anticoncepción de emergencia funciona mejor mientras antes se use, idealmente en las primeras 72 horas. En México se vende en farmacias sin receta.\n- **Cuidarte de infecciones:** si no conoces el estado de salud de tu pareja, hazte una prueba. Para VIH existe un tratamiento preventivo (PEP) que hay que empezar antes de 72 horas en un centro de salud.",
    en: "You can still act. Two things matter now:\n\n- **Preventing pregnancy:** emergency contraception works best the sooner it's used, ideally within 72 hours. In many countries it's sold over the counter.\n- **Protecting against infections:** if you don't know your partner's status, get tested. For HIV there is a preventive treatment (PEP) that must start within 72 hours at a health center.",
  },
  {
    keys: ["prep", "pep"],
    es: "La **PrEP** es un medicamento que toman personas sin VIH para no adquirirlo; tomada como se indica, reduce mucho el riesgo por vía sexual. La **PEP** es distinta: es un tratamiento de emergencia que se empieza antes de 72 horas después de una posible exposición.\n\nAmbas requieren valoración y receta en un servicio de salud. En México, muchos CAPASITS las ofrecen sin costo.",
    en: "**PrEP** is a medicine people without HIV take to avoid getting it; taken as directed, it greatly lowers sexual risk. **PEP** is different: an emergency treatment started within 72 hours of a possible exposure.\n\nBoth need an assessment and prescription at a health service, often free of charge.",
  },
  {
    keys: ["metodo", "anticoncept", "method", "birth control", "contracept"],
    es: "No hay un método perfecto para todas las personas; depende de lo que buscas:\n\n- **Más eficaces y de larga duración:** DIU e implante (duran de 3 a 10 años).\n- **De uso diario o mensual:** pastillas, parche, anillo o inyección.\n- **El único que también protege de ITS:** el condón.\n\nUn centro de salud puede ayudarte a elegir, y muchos métodos son gratuitos en el sector público.",
    en: "There's no perfect method for everyone; it depends on what you need:\n\n- **Most effective, long-lasting:** IUD and implant (3 to 10 years).\n- **Daily or monthly:** pill, patch, ring or shot.\n- **The only one that also protects against STIs:** the condom.\n\nA health center can help you choose, and many methods are free in public services.",
  },
  {
    keys: ["arde", "orinar", "secrecion", "comezon", "burn", "pee", "discharge", "itch"],
    es: "Ardor al orinar, secreción o comezón pueden tener varias causas, algunas son ITS y otras no (como una infección urinaria). No es posible saberlo sin revisión.\n\n- Acude a un centro de salud o clínica de ITS; la consulta suele ser confidencial.\n- Evita relaciones sin condón hasta que te revisen.\n- **Ve a urgencias** si tienes fiebre, dolor fuerte en el vientre o la espalda, o sangre en la orina.",
    en: "Burning when you pee, discharge or itching can have several causes; some are STIs and some aren't (like a urinary infection). It can't be known without a check-up.\n\n- Visit a health center or STI clinic; visits are usually confidential.\n- Avoid sex without a condom until you're checked.\n- **Go to the ER** if you have fever, strong belly or back pain, or blood in your urine.",
  },
  {
    keys: ["prueba", "test", "vih", "hiv", "donde", "where"],
    es: "Puedes hacerte pruebas de VIH, sífilis y hepatitis C gratis o a bajo costo:\n\n- Centros de salud y **CAPASITS** de la Secretaría de Salud.\n- Organizaciones civiles con pruebas rápidas (resultado en unos 20 minutos).\n\nEs confidencial y no necesitas ir con nadie. Si tuviste una exposición en las últimas 72 horas, pregunta también por la PEP.",
    en: "You can get HIV, syphilis and hepatitis C tests free or low-cost:\n\n- Public health centers and HIV clinics.\n- Community organizations offering rapid tests (results in about 20 minutes).\n\nIt's confidential and you don't need anyone with you. If you had an exposure in the last 72 hours, also ask about PEP.",
  },
  {
    keys: ["consentimiento", "consent"],
    es: "El consentimiento es un **sí claro, libre y que se puede retirar en cualquier momento**. Nadie consiente si está bajo presión, amenaza, dormido o muy intoxicado.\n\nPreguntar \"¿quieres seguir?\" es parte normal del sexo. Si alguien no respeta un \"no\", eso no es tu culpa.",
    en: "Consent is a **clear, free yes that can be withdrawn at any time**. Nobody can consent under pressure, threat, while asleep or very intoxicated.\n\nAsking \"do you want to keep going?\" is a normal part of sex. If someone doesn't respect a \"no\", it's not your fault.",
  },
];

const FALLBACK = {
  es: "Gracias por tu pregunta. En este modo de demostración solo tengo respuestas preparadas sobre anticoncepción de emergencia, métodos, PrEP/PEP, síntomas, pruebas y consentimiento.\n\nSi tu duda es urgente o tienes síntomas fuertes, acude a un centro de salud o a urgencias.",
  en: "Thanks for your question. In this demo mode I only have prepared answers about emergency contraception, methods, PrEP/PEP, symptoms, testing and consent.\n\nIf it's urgent or you have strong symptoms, visit a health center or the ER.",
};

const DEMO_NOTE = { es: "\n\n_Respuesta de demostración._", en: "\n\n_Demo answer._" };

// normalize() puede no existir en el motor JS de la app móvil: entonces solo se pasa a minúsculas.
const strip = (s: string) => (typeof s.normalize === "function" ? s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : s.toLowerCase());

/** Adivina el idioma por palabras frecuentes; ante la duda, español. */
export function guessLang(text: string): MockLang {
  const t = ` ${strip(text)} `;
  const en = [" the ", " what ", " how ", " is ", " my ", " i ", " can ", " where ", " it "].filter((w) => t.includes(w)).length;
  const es = [" el ", " la ", " que ", " como ", " es ", " mi ", " me ", " donde ", " se "].filter((w) => t.includes(w)).length;
  return en > es ? "en" : "es";
}

export function mockAnswer(text: string): string {
  const lang = guessLang(text);
  const t = strip(text);
  const hit = ENTRIES.find((e) => e.keys.some((k) => t.includes(k)));
  return (hit ? hit[lang] : FALLBACK[lang]) + DEMO_NOTE[lang];
}
