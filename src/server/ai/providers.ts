// Motor de IA de Chía: un solo punto donde se elige el modelo.
//
//   CHIA_AI_PROVIDER = lovable | openai-compatible | mock   (si se omite, se elige solo)
//
// - lovable: gateway de Lovable (LOVABLE_API_KEY).
// - openai-compatible: cualquier servidor con API tipo OpenAI, incluidos modelos abiertos
//   (Ollama, vLLM, LM Studio, Together, etc.): CHIA_AI_BASE_URL, CHIA_AI_MODEL, CHIA_AI_API_KEY.
// - mock: respuestas de demostración escritas a mano, sin red. Es el modo por defecto si no hay claves.
//
// Para añadir otro proveedor: implementa ChatProvider y regístralo en pickProvider().
import { createOpenAI } from "@ai-sdk/openai";
import { createUIMessageStream, createUIMessageStreamResponse, streamText, type ModelMessage, type UIMessage } from "ai";
import { createResponsesCall } from "./responses";
import { mockAnswer } from "@/lib/mock-answers";

export interface ChatProvider {
  name: "lovable" | "openai-compatible" | "mock";
  respond(args: { request: Request; ui: UIMessage[]; model: ModelMessage[]; system: string }): Response | Promise<Response>;
}

type Env = Record<string, string | undefined>;

const lovable = (apiKey: string, model: string): ChatProvider => ({
  name: "lovable",
  respond: ({ request, model: messages, system }) =>
    createResponsesCall(request, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model }, messages, system).response(),
});

const openaiCompatible = (baseURL: string, model: string, apiKey: string): ChatProvider => ({
  name: "openai-compatible",
  respond: ({ request, model: messages, system }) => {
    const provider = createOpenAI({ baseURL, apiKey });
    const result = streamText({ model: provider.chat(model), system, messages, abortSignal: request.signal });
    return result.toUIMessageStreamResponse();
  },
});

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
};

/** Elige el proveedor según las variables de entorno. Puro: fácil de probar. */
export function pickProviderName(env: Env): ChatProvider["name"] {
  const forced = env.CHIA_AI_PROVIDER;
  if (forced === "mock") return "mock";
  if (forced === "lovable" && env.LOVABLE_API_KEY) return "lovable";
  if (forced === "openai-compatible" && env.CHIA_AI_BASE_URL && env.CHIA_AI_MODEL) return "openai-compatible";
  if (!forced) {
    if (env.LOVABLE_API_KEY) return "lovable";
    if (env.CHIA_AI_BASE_URL && env.CHIA_AI_MODEL) return "openai-compatible";
  }
  return "mock"; // nunca dejar a la persona sin respuesta
}

export function pickProvider(env: Env): ChatProvider {
  switch (pickProviderName(env)) {
    case "lovable":
      return lovable(env.LOVABLE_API_KEY!, env.CHIA_AI_MODEL ?? "openai/gpt-6-astra");
    case "openai-compatible":
      return openaiCompatible(env.CHIA_AI_BASE_URL!, env.CHIA_AI_MODEL!, env.CHIA_AI_API_KEY ?? "not-needed");
    default:
      return mock;
  }
}
