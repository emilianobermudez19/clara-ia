import { describe, it, expect } from "vitest";
import { detectCrisis, HELPLINES } from "@/lib/crisis";

describe("protocolo de emergencia", () => {
  it("detecta autolesión", () => expect(detectCrisis("a veces quiero hacerme daño")).toBe(true));
  it("detecta abuso con acentos", () => expect(detectCrisis("Me obligó a hacerlo")).toBe(true));
  it("detecta crisis en inglés", () => expect(detectCrisis("I want to hurt myself")).toBe(true));
  it("detecta violación en inglés", () => expect(detectCrisis("I was raped last night")).toBe(true));
  it("no se activa con preguntas normales", () => expect(detectCrisis("¿cómo uso un condón?")).toBe(false));
  it("no confunde 'grape' con 'rape'", () => expect(detectCrisis("I ate grapes and feel weird")).toBe(false));
  it("no confunde 'drape'", () => expect(detectCrisis("how do I drape a towel")).toBe(false));
  it("no se activa con cortarme el pelo", () => expect(detectCrisis("Quiero cortarme el pelo")).toBe(false));
  it("sigue detectando 'cortarme' en crisis", () => expect(detectCrisis("tengo ganas de cortarme")).toBe(true));
  it("detecta raíces en español", () => expect(detectCrisis("pienso en suicidarme")).toBe(true));
  it("detecta al inicio del texto", () => expect(detectCrisis("rape happened to me")).toBe(true));
  it("incluye recursos internacionales de ayuda", () => {
    expect(HELPLINES.some((h) => h.href === "https://findahelpline.com")).toBe(true);
    expect(HELPLINES.every((h) => h.desc.es && h.desc.en)).toBe(true);
  });
});
