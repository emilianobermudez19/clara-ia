// Idioma de la app (ES/EN). Los textos se escriben en español y se traducen con tr("…").
// Al cambiar de idioma se vuelve a dibujar la interfaz (la sesión de Mi espacio se conserva).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { EN } from "./i18n-en";

export type Lang = "es" | "en";
let current: Lang = "es";

/** Traduce un texto escrito en español. Sin traducción disponible, deja el español. */
export function tr(es: string): string {
  return current === "en" ? EN[es] ?? es : es;
}
export const getLang = (): Lang => current;

const KEY = "chia-lang";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "es", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        let device: Lang = "es";
        try { device = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith("en") ? "en" : "es"; } catch { /* sin Intl */ }
        const l: Lang = v === "en" || v === "es" ? v : device;
        current = l;
        setLangState(l);
      })
      .catch(() => {});
  }, []);
  const setLang = (l: Lang) => {
    current = l;
    setLangState(l);
    void AsyncStorage.setItem(KEY, l).catch(() => {});
  };
  current = lang;
  // key={lang}: vuelve a montar la interfaz para que todos los tr() usen el idioma nuevo.
  return <Ctx.Provider value={{ lang, setLang }}><LangKey lang={lang}>{children}</LangKey></Ctx.Provider>;
}

function LangKey({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <ReactFragmentWithKey key={lang}>{children}</ReactFragmentWithKey>;
}
function ReactFragmentWithKey({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const useLang = () => useContext(Ctx);
