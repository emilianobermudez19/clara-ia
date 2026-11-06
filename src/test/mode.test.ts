import { describe, it, expect } from "vitest";
import { modeInstruction } from "@/lib/mode";

describe("modo Fácil / Técnico", () => {
  it("por defecto usa lenguaje fácil, también con valores inválidos", () => {
    expect(modeInstruction(undefined)).toMatch(/EASY/);
    expect(modeInstruction("<script>")).toMatch(/EASY/);
  });
  it("modo técnico", () => expect(modeInstruction("technical")).toMatch(/TECHNICAL/));
  it("nunca relaja las reglas de seguridad", () => {
    expect(modeInstruction("easy")).toMatch(/Safety rules above still apply/);
    expect(modeInstruction("technical")).toMatch(/Safety rules above still apply/);
  });
});
