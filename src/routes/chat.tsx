import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Compass, Phone, ChevronLeft, Globe } from "lucide-react";
import { detectCrisis, HELPLINES } from "@/lib/crisis";
import { IntentCTA } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Anonymous chat — Chia" },
      { name: "description", content: "Chat anonymously with an AI sexual health guide, in Spanish or English." },
      { property: "og:title", content: "Anonymous chat — Chia" },
      { property: "og:description", content: "Ask sexual health questions with no sign-up." },
    ],
  }),
  component: Chat,
});

function CrisisCards() {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-2 rounded-2xl border-2 border-exit bg-exit/10 p-4">
      <p className="font-semibold text-foreground">{t.crisisTitle}</p>
      {HELPLINES.map((h) => (
        <a key={h.name} href={h.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-card p-3">
          {h.href.includes("findahelpline") || h.href.includes("befrienders") ? (
            <Globe className="h-5 w-5 shrink-0 text-exit" />
          ) : (
            <Phone className="h-5 w-5 shrink-0 text-exit" />
          )}
          <div>
            <p className="font-semibold text-foreground">{h.name} · {h.label[lang]}</p>
            <p className="text-xs text-muted-foreground">{h.desc[lang]}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

function Chat() {
  const { t } = useI18n();
  const { messages, sendMessage, status, error } = useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) });
  const [input, setInput] = useState("");
  const [crisisAt, setCrisisAt] = useState<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);
  useEffect(() => {
    const last = messages.filter((m) => m.role === "user").at(-1);
    if (!last || crisisAt.has(last.id)) return;
    const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ");
    if (detectCrisis(text)) setCrisisAt((s) => new Set(s).add(last.id));
  }, [messages, crisisAt]);

  const send = (txt: string) => { if (!txt.trim() || busy) return; sendMessage({ text: txt }); setInput(""); };

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="flex items-center gap-2 border-b border-border px-4 py-4 pl-4 pr-44 pt-16">
        <Link to="/" aria-label={t.chatBack}><ChevronLeft className="h-5 w-5 text-muted-foreground" /></Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Compass className="h-4 w-4" /></div>
        <div><p className="font-semibold leading-none text-foreground">Chia</p><p className="text-xs text-muted-foreground">{t.chatTag}</p></div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div>
            <p className="font-display text-2xl text-foreground">{t.chatHello}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t.chatIntro}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.chatSuggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-2 text-left text-sm text-foreground">{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-3">
            {m.role === "user" ? (
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
                {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-foreground [&_a]:text-primary">
                {m.parts.map((p, i) => (p.type === "text" ? <ReactMarkdown key={i}>{p.text}</ReactMarkdown> : null))}
              </div>
            )}
            {crisisAt.has(m.id) && <CrisisCards />}
          </div>
        ))}
        {status === "submitted" && <p className="animate-pulse text-sm text-muted-foreground">{t.chatTyping}</p>}
        {error && <p className="text-sm text-destructive">{t.chatError}</p>}
        {status === "ready" && messages.length >= 4 && <IntentCTA source="chat" />}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-3xl border border-input bg-card p-2">
          <textarea
            ref={inputRef} rows={1} value={input} autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={t.chatPlaceholder}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">{t.chatDisclaimer}</p>
      </form>
    </main>
  );
}
