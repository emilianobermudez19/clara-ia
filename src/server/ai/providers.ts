// Motor de IA de Chía: un solo punto donde se elige el modelo.
//
//   CHIA_AI_PROVIDER = openai | groq | openrouter | lovable | openai-compatible | mock
//   (si se omite, se elige el primero que tenga clave, en ese orden)
//
// - openai:      OPENAI_API_KEY      (modelo por defecto gpt-4o-mini)
// - groq:        GROQ_API_KEY        (modelos abiertos muy rápidos; por defecto llama-3.3-70b-versatile)
// - openrouter:  OPENROUTER_API_KEY  (cientos de modelos, abiertos y cerrados)
// - lovable:     LOVABLE_API_KEY
// - openai-compatible: cualquier servidor tipo OpenAI (Ollama, vLLM…): CHIA_AI_BASE_URL + CHIA_AI_MODEL
// - mock: respuestas de demostración, solo cuando no hay ninguna clave (para no dejar la app muda).
// CHIA_AI_MODEL cambia el modelo en cualquier proveedor.
//
// Para añadir otro proveedor: implementa ChatProvider y regístralo en pickProvider().
import { createOpenAI } from "@ai-sdk/openai";
import { createUIMessageStream, createUIMessageStreamResponse, generateText, streamText, type ModelMessage, type UIMessage } from "ai";
import { createResponsesCall } from "./responses";
import { mockAnswer } from "@/lib/mock-answers";

export type ProviderName = "openai" | "groq" | "openrouter" | "lovable" | "openai-compatible" | "mock";

export interface ChatProvider {
  name: ProviderName;
  /** Respuesta en streaming para la web (formato de mensajes de AI SDK). */
  respond(args: { request: Request; ui: UIMessage[]; model: ModelMessage[]; system: string }): Response | Promise<Response>;
  /** Respuesta completa en texto, para canales como WhatsApp. */
  text(args: { model: ModelMessage[]; system: string; lastUser: string }): Promise<string>;
}

/** Proveedores con API tipo OpenAI: base URL y modelo por defecto. */
export const PRESETS = {
  openai: { baseURL: "https://api.openai.com/v1", keyVar: "OPENAI_API_KEY", model: "gpt-4o-mini" },
  groq: { baseURL: "https://api.groq.com/openai/v1", keyVar: "GROQ_API_KEY", model: "llama-3.3-70b-versatile" },
  openrouter: { baseURL: "https://openrouter.ai/api/v1", keyVar: "OPENROUTER_API_KEY", model: "meta-llama/llama-3.3-70b-instruct" },
} as const;

type Env = Record<string, string | undefined>;

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1";

const lovable = (apiKey: string, model: string): ChatProvider => ({
  name: "lovable",
  respond: ({ request, model: messages, system }) =>
    createResponsesCall(request, { baseURL: LOVABLE_URL, apiKey, model }, messages, system).response(),
  text: async ({ model: messages, system }) => {
    const p = createOpenAI({ baseURL: LOVABLE_URL, apiKey, headers: { "Lovable-API-Key": apiKey } });
    return (await generateText({ model: p.chat(model), system, messages })).text;
  },
});

const openaiCompatible = (name: ProviderName, baseURL: string, model: string, apiKey: string): ChatProvider => {
  const p = createOpenAI({ baseURL, apiKey });
  return {
    name,
    respond: ({ request, model: messages, system }) =>
      streamText({ model: p.chat(model), system, messages, abortSignal: request.signal }).toUIMessageStreamResponse(),
    text: async ({ model: messages, system }) => (await generateText({ model: p.chat(model), system, messages })).text,
  };
};

export const lastUserText = (ui: UIMessage[]): string => {
  const last = [...ui].reverse().find((m) => m.role === "user");
  return last ? last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim() : "";
};

const mock: ChatProvider = {
  name: "mock",
  respond: ({ ui }) => {
    const text = mockAnswer(lastUserText(ui));
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const id = "mock-text";
        writer.write({ type: "text-start", id });
        writer.write({ type: "text-delta", id, delta: text });
        writer.write({ type: "text-end", id });
      },
    });
    return createUIMessageStreamResponse({ stream, headers: { "x-chia-provider": "mock" } });
  },
  text: async ({ lastUser }) => mockAnswer(lastUser),
};

/** Elige el proveedor según las variables de entorno. Puro: fácil de probar. */
export function pickProviderName(env: Env): ProviderName {
  const has: Record<ProviderName, boolean> = {
    openai: !!env["OPENAI_API_KEY"],
    groq: !!env["GROQ_API_KEY"],
    openrouter: !!env["OPENROUTER_API_KEY"],
    lovable: !!env["LOVABLE_API_KEY"],
    "openai-compatible": !!(env["CHIA_AI_BASE_URL"] && env["CHIA_AI_MODEL"]),
    mock: true,
  };
  const forced = env["CHIA_AI_PROVIDER"] as ProviderName | undefined;
  if (forced && forced in has) return has[forced] ? forced : "mock";
  const order: ProviderName[] = ["openai", "groq", "openrouter", "lovable", "openai-compatible"];
  return order.find((n) => has[n]) ?? "mock"; // nunca dejar a la persona sin respuesta
}

export function pickProvider(env: Env): ChatProvider {
  const name = pickProviderName(env);
  switch (name) {
    case "openai":
    case "groq":
    case "openrouter": {
      const preset = PRESETS[name];
      return openaiCompatible(name, preset.baseURL, env["CHIA_AI_MODEL"] ?? preset.model, env[preset.keyVar]!);
    }
    case "lovable":
      return lovable(env["LOVABLE_API_KEY"]!, env["CHIA_AI_MODEL"] ?? "openai/gpt-6-astra");
    case "openai-compatible":
      return openaiCompatible(name, env["CHIA_AI_BASE_URL"]!, env["CHIA_AI_MODEL"]!, env["CHIA_AI_API_KEY"] ?? "not-needed");
    default:
      return mock;
  }
}
