// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { splitMedia, mediaToLinks, MEDIA_IDS } from "@/lib/media";
import { buildSystemPrompt } from "@/server/ai/master-prompt";
import { pickProviderName } from "@/server/ai/providers";
import { parseIncoming, verifySignature } from "@/server/whatsapp";
import { mockAnswer } from "@/lib/mock-answers";

describe("multimedia en el chat", () => {
  it("separa texto y guías de la biblioteca", () => {
    const parts = splitMedia("Así se usa:\n[[media:condon-externo]]\nListo.");
    expect(parts.map((p) => p.type)).toEqual(["text", "media", "text"]);
  });
  it("descarta ids que no existen (la IA no puede inventar imágenes)", () => {
    expect(splitMedia("[[media:inventada]] hola")).toEqual([{ type: "text", text: " hola" }]);
  });
  it("en WhatsApp se convierte en enlace", () => {
    expect(mediaToLinks("Mira: [[media:condon-externo]]", "https://chia.app")).toBe("Mira: https://chia.app/aprende#condon-externo");
  });
  it("la demo de '¿cómo me pongo un condón?' incluye la guía visual", () => {
    expect(mockAnswer("¿cómo uso un condón?")).toContain("[[media:condon-externo]]");
  });
});

describe("master prompt clínico", () => {
  const p = buildSystemPrompt({ mode: "technical", channel: "web", mediaIds: MEDIA_IDS });
  it("mantiene los límites clínicos", () => {
    expect(p).toMatch(/do NOT diagnose/);
    expect(p).toMatch(/do NOT prescribe/);
    expect(p).toMatch(/Never give pediatric doses/);
  });
  it("hace triaje con señales de alarma", () => expect(p).toMatch(/TRIAGE FIRST/));
  it("solo ofrece multimedia de la biblioteca", () => expect(p).toContain("[[media:condon-externo]]"));
  it("el modo técnico no quita reglas de seguridad", () => expect(p).toMatch(/Safety rules above still apply/));
});

describe("proveedores de IA", () => {
  it("sin claves: demostración", () => expect(pickProviderName({})).toBe("mock"));
  it("OpenAI, Groq y OpenRouter por su clave", () => {
    expect(pickProviderName({ OPENAI_API_KEY: "k" })).toBe("openai");
    expect(pickProviderName({ GROQ_API_KEY: "k" })).toBe("groq");
    expect(pickProviderName({ OPENROUTER_API_KEY: "k" })).toBe("openrouter");
  });
  it("se puede forzar uno", () => expect(pickProviderName({ OPENAI_API_KEY: "a", GROQ_API_KEY: "b", CHIA_AI_PROVIDER: "groq" })).toBe("groq"));
  it("forzar uno sin clave cae a demostración", () => expect(pickProviderName({ CHIA_AI_PROVIDER: "groq" })).toBe("mock"));
});

describe("WhatsApp", () => {
  const body = JSON.stringify({ entry: [{ changes: [{ value: { messages: [{ from: "5215550000000", id: "wamid.1", type: "text", text: { body: "hola" } }, { from: "x", id: "2", type: "image" }] } }] }] });
  it("verifica la firma de Meta", () => {
    const sig = "sha256=" + createHmac("sha256", "secreto").update(body).digest("hex");
    expect(verifySignature(body, sig, "secreto")).toBe(true);
    expect(verifySignature(body, sig, "otro")).toBe(false);
    expect(verifySignature(body, null, "secreto")).toBe(false);
  });
  it("lee solo mensajes de texto", () => expect(parseIncoming(JSON.parse(body))).toEqual([{ from: "5215550000000", id: "wamid.1", text: "hola" }]));
});
