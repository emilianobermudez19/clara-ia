// @vitest-environment node
import { describe, it, expect } from "vitest";
import { mockAnswer, guessLang } from "@/lib/mock-answers";
import { pickProviderName } from "@/server/ai/providers";

describe("motor de IA", () => {
  it("sin claves usa el modo demostración", () => expect(pickProviderName({})).toBe("mock"));
  it("con clave de Lovable usa Lovable", () => expect(pickProviderName({ LOVABLE_API_KEY: "k" })).toBe("lovable"));
  it("con servidor compatible usa modelo abierto", () =>
    expect(pickProviderName({ CHIA_AI_BASE_URL: "http://localhost:11434/v1", CHIA_AI_MODEL: "llama3.1" })).toBe("openai-compatible"));
  it("forzar un proveedor sin su configuración cae a demostración", () =>
    expect(pickProviderName({ CHIA_AI_PROVIDER: "openai-compatible" })).toBe("mock"));
});

describe("respuestas de demostración", () => {
  it("responde en español", () => expect(mockAnswer("se me rompió el condón")).toMatch(/72 horas/));
  it("responde en inglés", () => {
    expect(guessLang("what is PrEP and how does it work")).toBe("en");
    expect(mockAnswer("what is PrEP and how does it work")).toMatch(/PrEP/);
  });
  it("nunca da dosis de medicamentos", () => {
    for (const q of ["prep", "me arde al orinar", "anticonceptivos", "se rompió"]) expect(mockAnswer(q)).not.toMatch(/\d+\s?mg/);
  });
  it("siempre se identifica como demostración", () => expect(mockAnswer("hola")).toMatch(/demostración/));
});
