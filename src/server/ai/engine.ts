// Motor de conversación de Chía, independiente de la interfaz.
// La web (/api/chat) y WhatsApp (/api/whatsapp) llaman a estas mismas funciones:
// mismo prompt clínico, mismas reglas, mismo proveedor.
import { convertToModelMessages, type ModelMessage, type UIMessage } from "ai";
import { pickProvider, lastUserText } from "./providers";
import { buildSystemPrompt, type Channel } from "./master-prompt";
import { MEDIA_IDS, mediaToLinks } from "@/lib/media";

type Env = Record<string, string | undefined>;
const MAX_TURNS = 30;

/** Web: respuesta en streaming. Si el modelo falla, responde el modo demostración. */
export async function streamWebReply(opts: { request: Request; ui: UIMessage[]; mode: unknown; env: Env }): Promise<Response> {
  const ui = opts.ui.slice(-MAX_TURNS);
  const provider = pickProvider(opts.env);
  const system = buildSystemPrompt({ mode: opts.mode, channel: "web", mediaIds: MEDIA_IDS });
  try {
    return await provider.respond({ request: opts.request, ui, model: await convertToModelMessages(ui), system });
  } catch (err) {
    console.error("[chia] provider failed, using demo", provider.name, err);
    return pickProvider({ CHIA_AI_PROVIDER: "mock" }).respond({ request: opts.request, ui, model: [], system });
  }
}

export interface TextTurn {
  role: "user" | "assistant";
  text: string;
}

/** Canales de solo texto (WhatsApp, SMS…): respuesta completa, con la multimedia convertida en enlaces. */
export async function textReply(opts: { history: TextTurn[]; mode?: unknown; channel: Channel; env: Env; publicUrl: string }): Promise<string> {
  const history = opts.history.slice(-MAX_TURNS);
  const lastUser = [...history].reverse().find((t) => t.role === "user")?.text ?? "";
  const model: ModelMessage[] = history.map((t) => ({ role: t.role, content: t.text }));
  const system = buildSystemPrompt({ mode: opts.mode, channel: opts.channel, mediaIds: MEDIA_IDS });
  const provider = pickProvider(opts.env);
  let text: string;
  try {
    text = await provider.text({ model, system, lastUser });
  } catch (err) {
    console.error("[chia] provider failed, using demo", provider.name, err);
    text = await pickProvider({ CHIA_AI_PROVIDER: "mock" }).text({ model, system, lastUser });
  }
  return mediaToLinks(text, opts.publicUrl);
}

export { lastUserText };
