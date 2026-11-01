import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Phone, ChevronLeft, Globe } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { ChatMedia } from "@/components/ChatMedia";
import { splitMedia } from "@/lib/media";
import { useVault } from "@/lib/vault-context";
import { newId, upsertConsultation } from "@/lib/vault";
import { isTopic, type Topic } from "@/lib/topics";
import { useLanguageMode } from "@/lib/mode";
import { detectCrisis, HELPLINES } from "@/lib/crisis";
import { IntentCTA } from "@/components/QuickExit";
import { useI18n } from "@/lib/i18n";

export interface ChatSearch {
  q?: string | undefined;
  topic?: Topic | undefined;
}

export const Route = createFileRoute("/chat")({
  // Parámetros declarados: el router los entrega ya validados al montar el chat.
  validateSearch: (s: Record<string, unknown>): ChatSearch => ({
    q: typeof s["q"] === "string" && s["q"].trim() ? s["q"].trim().slice(0, 500) : undefined,
    topic: isTopic(s["topic"]) ? s["topic"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Consulta — Chía" },
      { name: "description", content: "Consulta confidencial con el asistente de salud de Chía." },
      { property: "og:title", content: "Consulta — Chía" },
      { property: "og:description", content: "Pregunta sobre tu salud sin juicios." },
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
  const { mode, setMode } = useLanguageMode();
  const modeRef = useRef(mode);
  modeRef.current = mode;
  // Categoría elegida en Inicio: viaja con cada mensaje para que la IA mantenga el enfoque.
  const topicRef = useRef<Topic | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  // Ficha compartida SOLO si la persona lo activa en esta consulta (apagado por defecto).
  const healthRef = useRef<{ allergies: string; conditions: string; medications: string } | null>(null);
  const [transport] = useState(
    () => new DefaultChatTransport({ api: "/api/chat", body: () => ({ mode: modeRef.current, topic: topicRef.current, health: healthRef.current }) }),
  );
  const { messages, sendMessage, status, error } = useChat({ transport });
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

  // Guardar en Mi espacio: solo si la persona tiene su espacio abierto Y lo activa. Por defecto, nada se guarda.
  const vault = useVault();
  const [save, setSave] = useState(false);
  const [useRecord, setUseRecord] = useState(false);
  healthRef.current =
    useRecord && vault.profile
      ? { allergies: vault.profile.allergies, conditions: vault.profile.conditions, medications: vault.profile.medications }
      : null;
  const consultId = useRef(newId());
  useEffect(() => {
    if (!save || !vault.profile || status !== "ready" || messages.length < 2) return;
    const turns = messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      text: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
    }));
    const title = turns.find((x) => x.role === "user")?.text.slice(0, 60) ?? "Consulta";
    void vault.update((p) => ({ ...p, consultations: upsertConsultation(p.consultations, { id: consultId.current, date: new Date().toISOString(), title, turns }) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save, status, messages.length]);

  const send = (txt: string) => { if (!txt.trim() || busy) return; sendMessage({ text: txt }); setInput(""); };

  // Pregunta o categoría que viene del Inicio: se envía sola como primer mensaje (una vez)
  // y se quita de la URL para no dejar la pregunta en el historial del navegador.
  const search = Route.useSearch();
  const navigate = useNavigate();
  const sentInitial = useRef(false);
  useEffect(() => {
    if (sentInitial.current || (!search.q && !search.topic)) return;
    sentInitial.current = true;
    if (search.topic) {
      topicRef.current = search.topic;
      setTopic(search.topic);
    }
    send(search.q ?? (search.topic ? t.topicStart[search.topic] : ""));
    void navigate({ to: "/chat", search: {}, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q, search.topic]);

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="safe-chat-top flex items-center gap-3 border-b border-border bg-card px-3 py-2.5">
        <Link to="/" aria-label={t.chatBack} className="flex h-11 w-11 items-center justify-center rounded-full">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <LogoMark className="h-7 w-7 text-primary" />
        <div className="mr-auto">
          <p className="font-bold leading-none text-foreground">Chía</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.chatTag}</p>
        </div>
        <div role="radiogroup" aria-label={t.modeGroup} className="flex rounded-full bg-secondary p-0.5">
          {(["easy", "technical"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-10 rounded-full px-3 text-sm ${mode === m ? "bg-primary font-bold text-primary-foreground" : "font-semibold text-secondary-foreground"}`}
            >
              {m === "easy" ? t.modeEasy : t.modeTech}
            </button>
          ))}
        </div>
      </header>
      {topic && (
        <p className="border-b border-border bg-card px-4 py-2 text-center text-[13px] font-semibold text-primary">
          {t.topics.find((x) => x.k === topic)?.label}
        </p>
      )}
      {vault.profile ? (
        <div className="flex flex-wrap justify-center gap-x-4 bg-secondary px-4 text-[13px] font-semibold text-secondary-foreground">
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
            {save ? t.chatSaving : t.chatSaveToggle}
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input type="checkbox" checked={useRecord} onChange={(e) => setUseRecord(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
            {t.chatUseRecord}
          </label>
        </div>
      ) : (
        <p className="bg-secondary px-4 py-2 text-center text-[13px] text-secondary-foreground">{t.chatTemp}</p>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div>
            <p className="font-display text-2xl text-foreground">{t.chatHello}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t.chatIntro}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.chatSuggestions.map((s) => <button key={s} onClick={() => send(s)} className="min-h-11 rounded-full bg-secondary px-4 py-2 text-left text-[15px] font-medium text-secondary-foreground">{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-3">
            {m.role === "user" ? (
              <div className="ml-auto w-fit max-w-[85%] rounded-[20px] rounded-br-md bg-primary px-4 py-3 leading-relaxed text-primary-foreground">
                {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
              </div>
            ) : (
              <div className="max-w-[92%] rounded-[20px] rounded-bl-md border border-border bg-card px-4 py-3 leading-relaxed text-foreground [&_a]:font-semibold [&_a]:text-primary [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-2 [&_strong]:font-bold [&_ul]:mt-2">
                {m.parts.map((p, i) =>
                  p.type === "text"
                    ? splitMedia(p.text).map((part, j) =>
                        part.type === "media" ? <ChatMedia key={`${i}-${j}`} id={part.id} /> : <ReactMarkdown key={`${i}-${j}`}>{part.text}</ReactMarkdown>,
                      )
                    : null,
                )}
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

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="safe-bottom border-t border-border px-3 pt-3">
        <div className="flex items-end gap-2 rounded-[28px] border-[1.5px] border-input bg-card p-1.5 pl-3">
          <textarea
            ref={inputRef} rows={1} value={input} autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={t.chatPlaceholder}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label={t.chatSend} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[13px] leading-snug text-muted-foreground">{t.chatDisclaimer}</p>
      </form>
    </main>
  );
}
