import { useEffect, useState } from "react";

// Toggle Fácil / Técnico: cambia el lenguaje de la IA, nunca sus reglas de seguridad.
export type LanguageMode = "easy" | "technical";
export const MODE_KEY = "chia-mode"; // prefijo chia- para que la salida rápida lo borre

export function useLanguageMode() {
  const [mode, setModeState] = useState<LanguageMode>("easy");
  useEffect(() => {
    try { if (localStorage.getItem(MODE_KEY) === "technical") setModeState("technical"); } catch { /* noop */ }
  }, []);
  const setMode = (m: LanguageMode) => {
    setModeState(m);
    try { localStorage.setItem(MODE_KEY, m); } catch { /* noop */ }
  };
  return { mode, setMode };
}

/** Instrucción extra para el modelo. Se añade DESPUÉS de las reglas clínicas. */
export function modeInstruction(mode: unknown): string {
  return mode === "technical"
    ? "Language mode: TECHNICAL. Use precise medical terminology (generic drug names, mechanisms, clinical terms) and stay concise. Safety rules above still apply."
    : "Language mode: EASY. Use everyday words and short sentences, as for someone with little formal education. If you must use a medical term, explain it in parentheses. Safety rules above still apply.";
}
