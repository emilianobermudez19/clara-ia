import { describe, it, expect } from "vitest";
import { detectCrisis, HELPLINES } from "@/lib/crisis";

describe("protocolo de emergencia", () => {
  it("detecta autolesión", () => expect(detectCrisis("a veces quiero hacerme daño")).toBe(true));
  it("detecta abuso con acentos", () => expect(detectCrisis("Me obligó a hacerlo")).toBe(true));
  it("detecta crisis en inglés", () => expect(detectCrisis("I want to hurt myself")).toBe(true));
  it("detecta violación en inglés", () => expect(detectCrisis("I was raped last night")).toBe(true));
  it("no se activa con preguntas normales", () => expect(detectCrisis("¿cómo uso un condón?")).toBe(false));
  it("incluye recursos internacionales de ayuda", () => {
    expect(HELPLINES.some((h) => h.href === "https://findahelpline.com")).toBe(true);
    expect(HELPLINES.every((h) => h.desc.es && h.desc.en)).toBe(true);
  });
});
