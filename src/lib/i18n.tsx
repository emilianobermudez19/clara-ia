import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";
export type Theme = "dark" | "light";

const dict = {
  es: {
    navHome: "Inicio",
    navChat: "Consulta",
    navLearn: "Aprende",
    navSpace: "Mi espacio",
    watchVideo: "Ver video",
    reviewPending: "Revisión clínica pendiente",
    reviewedBy: (who: string, date: string) => `Revisado por ${who} · ${date}`,
    sources: "Fuentes",
    greetMorning: "Buenos días",
    greetAfternoon: "Buenas tardes",
    greetEvening: "Buenas noches",
    dashGuides: "Para leer en 2 minutos",
    dashMyth: "¿Mito o realidad?",
    dashMythReveal: "Ver respuesta",
    dashSpaceNew: "Tu ficha médica, solo en tu teléfono",
    dashSpaceNewSub: "Opcional. Cifrada con tu PIN, lista para llevar a consulta.",
    dashSpaceOpen: "Tu espacio está protegido",
    dashSpaceOpenSub: "Ábrelo con tu PIN para ver o actualizar tu ficha.",
    dashAnonTitle: "Consulta anónima",
    gateTitle: "Tu espacio de salud",
    tagline: "Tu compañera de salud confidencial",
    gateOpening: "Abriendo tu espacio…",
    gateHaveAccount: "Ya tengo cuenta: entrar con PIN",
    gateSub: "Confidencial. Tus datos se cifran en este teléfono.",
    gateEnter: "Entra con tu PIN",
    gateCreate: "Crea tu cuenta",
    expressTitle: "Consulta Express",
    expressSub: "Anónima y sin registro. Se borra al salir.",
    topics: [
      { k: "meds", label: "Medicamentos y recetas", sub: "Cómo tomarlos y recordatorios" },
      { k: "sexual", label: "Salud sexual y reproductiva", sub: "Anticoncepción, emergencias, ITS" },
      { k: "symptoms", label: "Síntomas y triaje", sub: "Evaluación guiada de malestar o dolor" },
      { k: "clinics", label: "Especialistas y clínicas", sub: "Pruebas y telemedicina" },
    ] as readonly { k: "meds" | "sexual" | "symptoms" | "clinics"; label: string; sub: string }[],
    topicStart: {
      meds: "Quiero ayuda con mis medicamentos o una receta.",
      sexual: "Tengo una duda de salud sexual o reproductiva.",
      symptoms: "Tengo un malestar y quiero saber qué hacer.",
      clinics: "Busco un especialista o una clínica.",
    } as Record<"meds" | "sexual" | "symptoms" | "clinics", string>,
    disclaimer: "Chía es un asistente de triaje e información, no emite diagnósticos ni reemplaza la consulta con un médico.",
    legalLink: "Legales y privacidad",
    legalVersion: (v: string) => `Versión ${v}`,
    noRemindersHome: "Sin recordatorios activos",
    remindersHomeSub: "Recordatorios de medicamentos",
    historyCard: (n: number) => (n === 1 ? "1 consulta guardada" : `${n} consultas guardadas`),
    homeHow: "¿Cómo te sientes hoy?",
    homeHowSub: "Cuéntale a Chía qué te pasa. Te orienta y te dice si necesitas ver a un médico.",
    triageTitle: "¿Con qué te ayudamos?",
    triage: [
      { k: "symptoms", label: "Tengo síntomas", q: "Tengo síntomas y quiero saber si debo ver a un médico" },
      { k: "contraception", label: "Anticoncepción", q: "Quiero orientación sobre anticoncepción" },
      { k: "sti", label: "Pruebas de ITS", q: "¿Dónde y cómo me hago pruebas de ITS?" },
      { k: "rx", label: "Entender mi receta", q: "Quiero entender una receta que me dio mi médico" },
    ] as readonly { k: string; label: string; q: string }[],
    teleCardTitle: "Consulta con especialista",
    teleCardSub: "Solicita una consulta con médicos aliados.",
    guidesLink: "Guías visuales paso a paso",
    nextDoseHome: (name: string, time: string) => `Próxima toma: ${name} a las ${time}`,
    dashAnonSub: "Sin cuenta. Se borra al cerrar.",
    exit: "Salir rápido",
    themeToLight: "Cambiar a modo claro",
    themeToDark: "Cambiar a modo oscuro",
    homeTitle: "Pregunta lo que sea.",
    homeSub: "Sin cuenta, sin historial. Lo que escribas desaparece al cerrar.",
    homePrivacy: "Sin registro, sin nombre, sin historial guardado. Al cerrar, tu conversación desaparece.",
    homeAskPlaceholder: "Escribe tu duda…",
    homeAskSend: "Enviar pregunta",
    homePopular: "Lo que más se pregunta",
    homeChips: ["Se rompió el condón", "¿Qué método me conviene?", "Me arde al orinar", "¿Qué es la PrEP?"] as readonly string[],
    homeGuideTag: "Guía · 2 min",
    homeGuideTitle: "Cómo usar un condón externo, paso a paso",
    homeTestsTitle: "¿Dónde me hago una prueba?",
    homeTestsSub: "VIH, sífilis y más. Gratis o de bajo costo, confidencial.",
    homeCTAChat: "Consulta anónima",
    homeCTALearn: "Explorar guías",
    homeAccount: "Crear cuenta / Iniciar sesión (opcional)",
    chatTag: "IA educativa · anónima",
    chatTemp: "Conversación temporal · se borra al cerrar",
    chatSaveToggle: "Guardar en Mi espacio",
    chatUseRecord: "Usar mi ficha (alergias, condiciones, medicamentos)",
    chatSaving: "Se guarda cifrada en Mi espacio",
    openGuide: "Ver guía completa",
    modeGroup: "Tipo de lenguaje",
    modeEasy: "Fácil",
    modeTech: "Técnico",
    chatSend: "Enviar",
    chatHello: "¿Qué te gustaría saber?",
    chatIntro: "Soy una IA educativa. No guardo tu conversación ni te pido datos.",
    chatPlaceholder: "Escribe tu duda, sin miedo…",
    chatDisclaimer: "Chía es un asistente de triaje e información, no emite diagnósticos ni reemplaza la consulta con un médico. En una emergencia, llama a tu número local.",
    chatError: "No pudimos responder ahora. Intenta de nuevo en un momento.",
    chatTyping: "Chía está escribiendo…",
    chatBack: "Volver",
    chatSuggestions: [
      "¿Qué método anticonceptivo me conviene?",
      "¿Qué es la PrEP?",
      "¿Cómo hablar de consentimiento?",
      "¿Dónde puedo hacerme una prueba de VIH?",
    ] as readonly string[],
    crisisTitle: "No estás sola/o. Hay personas listas para ayudarte ahora, gratis:",
    learnTitle: "Aprende a tu ritmo",
    learnSub: "Información breve, verificada y sin juicios.",
    tabGuides: "Guías",
    tabMyths: "Mitos",
    tabScience: "Ciencia",
    searchPlaceholder: "Buscar tema…",
    minRead: (n: number) => `${n} min de lectura`,
    mythTap: "¿Mito o realidad? Toca",
    mythReality: "Realidad",
    noResults: "Sin resultados. Prueba con otra palabra.",
    intentQ: "¿Quieres hablar con un especialista o buscar clínicas cercanas?",
    intentSpecialist: "Hablar con especialista",
    intentClinics: "Clínicas cercanas",
    intentRegionAsk: "¿En qué país estás? (opcional)",
    intentRegionPlaceholder: "Elige tu país",
    intentSend: "Enviar",
    intentThanks: "Gracias. Pronto habilitaremos esta opción.",
    accountTitle: "Cuentas, muy pronto",
    accountBody: "Podrás guardar guías favoritas si lo deseas. Mientras tanto, todo funciona sin registro.",
    accountCTA: "Ir a consulta anónima",
  },
  en: {
    navHome: "Home",
    navChat: "Ask",
    navLearn: "Learn",
    navSpace: "My space",
    watchVideo: "Watch video",
    reviewPending: "Clinical review pending",
    reviewedBy: (who: string, date: string) => `Reviewed by ${who} · ${date}`,
    sources: "Sources",
    greetMorning: "Good morning",
    greetAfternoon: "Good afternoon",
    greetEvening: "Good evening",
    dashGuides: "2-minute reads",
    dashMyth: "Myth or fact?",
    dashMythReveal: "See the answer",
    dashSpaceNew: "Your health record, only on your phone",
    dashSpaceNewSub: "Optional. Encrypted with your PIN, ready for appointments.",
    dashSpaceOpen: "Your space is protected",
    dashSpaceOpenSub: "Open it with your PIN to view or update your record.",
    dashAnonTitle: "Anonymous chat",
    gateTitle: "Your health space",
    tagline: "Your confidential health companion",
    gateOpening: "Opening your space…",
    gateHaveAccount: "I have an account: enter with PIN",
    gateSub: "Confidential. Your data is encrypted on this phone.",
    gateEnter: "Enter with your PIN",
    gateCreate: "Create your account",
    expressTitle: "Express consultation",
    expressSub: "Anonymous, no sign-up. Erased when you leave.",
    topics: [
      { k: "meds", label: "Medicines & prescriptions", sub: "How to take them and reminders" },
      { k: "sexual", label: "Sexual & reproductive health", sub: "Birth control, emergencies, STIs" },
      { k: "symptoms", label: "Symptoms & triage", sub: "Guided check of pain or discomfort" },
      { k: "clinics", label: "Specialists & clinics", sub: "Testing and telehealth" },
    ] as readonly { k: "meds" | "sexual" | "symptoms" | "clinics"; label: string; sub: string }[],
    topicStart: {
      meds: "I'd like help with my medicines or a prescription.",
      sexual: "I have a sexual or reproductive health question.",
      symptoms: "I don't feel well and want to know what to do.",
      clinics: "I'm looking for a specialist or a clinic.",
    } as Record<"meds" | "sexual" | "symptoms" | "clinics", string>,
    disclaimer: "Chía is a triage and information assistant; it does not diagnose or replace a consultation with a doctor.",
    legalLink: "Legal & privacy",
    legalVersion: (v: string) => `Version ${v}`,
    noRemindersHome: "No active reminders",
    remindersHomeSub: "Medicine reminders",
    historyCard: (n: number) => (n === 1 ? "1 saved consultation" : `${n} saved consultations`),
    homeHow: "How are you feeling today?",
    homeHowSub: "Tell Chía what's going on. It guides you and tells you if you need to see a doctor.",
    triageTitle: "What can we help with?",
    triage: [
      { k: "symptoms", label: "I have symptoms", q: "I have symptoms and want to know if I should see a doctor" },
      { k: "contraception", label: "Birth control", q: "I'd like guidance on birth control" },
      { k: "sti", label: "STI testing", q: "Where and how can I get tested for STIs?" },
      { k: "rx", label: "Understand my prescription", q: "I want to understand a prescription my doctor gave me" },
    ] as readonly { k: string; label: string; q: string }[],
    teleCardTitle: "See a specialist",
    teleCardSub: "Request a consultation with partner doctors.",
    guidesLink: "Step-by-step visual guides",
    nextDoseHome: (name: string, time: string) => `Next dose: ${name} at ${time}`,
    dashAnonSub: "No account. Erased when you close.",
    exit: "Quick exit",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
    homeTitle: "Ask anything.",
    homeSub: "No account, no history. What you write disappears when you close.",
    homePrivacy: "No sign-up, no name, no saved history. When you close, your conversation disappears.",
    homeAskPlaceholder: "Type your question…",
    homeAskSend: "Send question",
    homePopular: "Most asked",
    homeChips: ["The condom broke", "Which method suits me?", "It burns when I pee", "What is PrEP?"] as readonly string[],
    homeGuideTag: "Guide · 2 min",
    homeGuideTitle: "How to use an external condom, step by step",
    homeTestsTitle: "Where can I get tested?",
    homeTestsSub: "HIV, syphilis and more. Free or low-cost, confidential.",
    homeCTAChat: "Anonymous chat",
    homeCTALearn: "Explore guides",
    homeAccount: "Create account / Sign in (optional)",
    chatTag: "Educational AI · anonymous",
    chatTemp: "Temporary conversation · erased when you close",
    chatSaveToggle: "Save to My space",
    chatUseRecord: "Use my record (allergies, conditions, medicines)",
    chatSaving: "Saved encrypted to My space",
    openGuide: "Open full guide",
    modeGroup: "Language type",
    modeEasy: "Easy",
    modeTech: "Technical",
    chatSend: "Send",
    chatHello: "What would you like to know?",
    chatIntro: "I'm an educational AI. I don't save your conversation or ask for your data.",
    chatPlaceholder: "Type your question, no fear…",
    chatDisclaimer: "Chía is a triage and information assistant; it does not diagnose or replace a consultation with a doctor. In an emergency, call your local number.",
    chatError: "We couldn't respond right now. Please try again in a moment.",
    chatTyping: "Chía is typing…",
    chatBack: "Back",
    chatSuggestions: [
      "Which birth control method suits me?",
      "What is PrEP?",
      "How do I talk about consent?",
      "Where can I get an HIV test?",
    ] as readonly string[],
    crisisTitle: "You are not alone. People are ready to help you right now, for free:",
    learnTitle: "Learn at your own pace",
    learnSub: "Brief, verified, judgment-free information.",
    tabGuides: "Guides",
    tabMyths: "Myths",
    tabScience: "Science",
    searchPlaceholder: "Search a topic…",
    minRead: (n: number) => `${n} min read`,
    mythTap: "Myth or fact? Tap",
    mythReality: "Fact",
    noResults: "No results. Try another word.",
    intentQ: "Want to talk to a specialist or find nearby clinics?",
    intentSpecialist: "Talk to a specialist",
    intentClinics: "Nearby clinics",
    intentRegionAsk: "Which country are you in? (optional)",
    intentRegionPlaceholder: "Choose your country",
    intentSend: "Send",
    intentThanks: "Thank you. We'll enable this option soon.",
    accountTitle: "Accounts, coming soon",
    accountBody: "You'll be able to save favorite guides if you want. Meanwhile, everything works without sign-up.",
    accountCTA: "Go to anonymous chat",
  },
};

export type Dict = (typeof dict)["es"];

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  theme: Theme;
  toggleTheme: () => void;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("chia-lang") as Lang | null;
      const savedTheme = localStorage.getItem("chia-theme") as Theme | null;
      if (savedLang === "es" || savedLang === "en") setLangState(savedLang);
      else if (navigator.language.toLowerCase().startsWith("en")) setLangState("en");
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("chia-theme", theme);
      localStorage.setItem("chia-lang", lang);
    } catch { /* noop */ }
  }, [theme, lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleTheme = () => setTheme((v) => (v === "dark" ? "light" : "dark"));

  return <Ctx.Provider value={{ lang, setLang, t: dict[lang], theme, toggleTheme }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
