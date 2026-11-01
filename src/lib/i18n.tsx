import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";
export type Theme = "dark" | "light";

const dict = {
  es: {
    navHome: "Inicio",
    navChat: "Consulta",
    navLearn: "Aprende",
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
    modeGroup: "Tipo de lenguaje",
    modeEasy: "Fácil",
    modeTech: "Técnico",
    chatSend: "Enviar",
    chatHello: "¿Qué te gustaría saber?",
    chatIntro: "Soy una IA educativa. No guardo tu conversación ni te pido datos.",
    chatPlaceholder: "Escribe tu duda, sin miedo…",
    chatDisclaimer: "Chía da información educativa, no diagnósticos. Si tienes dolor fuerte, sangrado o fiebre, acude a urgencias.",
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
    modeGroup: "Language type",
    modeEasy: "Easy",
    modeTech: "Technical",
    chatSend: "Send",
    chatHello: "What would you like to know?",
    chatIntro: "I'm an educational AI. I don't save your conversation or ask for your data.",
    chatPlaceholder: "Type your question, no fear…",
    chatDisclaimer: "Chía gives educational information, not diagnoses. If you have severe pain, bleeding or fever, go to the emergency room.",
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
