import { describe, it, expect } from "vitest";
import { detectCrisis, HELPLINES } from "@/lib/crisis";

describe("protocolo de emergencia", () => {
  it("detecta autolesión", () => expect(detectCrisis("a veces quiero hacerme daño")).toBe(true));
  it("detecta abuso con acentos", () => expect(detectCrisis("Me obligó a hacerlo")).toBe(true));
  it("no se activa con preguntas normales", () => expect(detectCrisis("¿cómo uso un condón?")).toBe(false));
  it("incluye Línea de la Vida 800 911 2000 y 911", () => {
    expect(HELPLINES.map((h) => h.phone)).toEqual(expect.arrayContaining(["800 911 2000", "911"]));
  });
});
