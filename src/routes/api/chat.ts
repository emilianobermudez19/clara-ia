import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { streamWebReply } from "@/server/ai/engine";

// Canal web. Toda la lógica clínica vive en src/server/ai (engine + master-prompt).
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, mode } = (await request.json()) as { messages: UIMessage[]; mode?: unknown };
        return streamWebReply({ request, ui: messages, mode, env: process.env });
      },
    },
  },
});
