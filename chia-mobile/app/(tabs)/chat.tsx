import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { detectCrisis, HELPLINES } from "../../../src/lib/crisis";
import { splitMedia } from "../../../src/lib/media";
import { isTopic, type Topic } from "../../../src/lib/topics";
import { healthContextFrom, newId, upsertConsultation } from "../../../src/lib/vault";
import { askChia, hasServer, type Turn } from "../../src/api";
import { ChatMedia } from "../../src/ChatMedia";
import { RichText } from "../../src/RichText";
import { TopBar } from "../../src/TopBar";
import { DISCLAIMER, TOPIC_UI } from "../../src/topics";
import { useVault } from "../../src/vault";
import { C, R } from "../../src/theme";

const SUGGESTIONS = ["Se rompió el condón", "¿Qué método me conviene?", "Tengo fiebre desde ayer", "¿Qué es la PrEP?"];

export default function Chat() {
  const vault = useVault();
  const params = useLocalSearchParams<{ q?: string; topic?: string; n?: string }>();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [crisisAt, setCrisisAt] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [mode, setMode] = useState<"easy" | "technical">("easy");
  const [save, setSave] = useState(false);
  const [useRecord, setUseRecord] = useState(false);
  const consultId = useRef(newId());
  const scroll = useRef<ScrollView>(null);

  // `base` permite empezar una conversación nueva sin depender del estado anterior.
  const send = async (raw: string, forcedTopic?: Topic | null, base?: Turn[]) => {
    const text = raw.trim().slice(0, 1000);
    if (!text || busy) return;
    const activeTopic = forcedTopic === undefined ? topic : forcedTopic;
    const history: Turn[] = [...(base ?? turns), { role: "user", text }];
    setTurns(history);
    setInput("");
    if (detectCrisis(text)) setCrisisAt((c) => [...c, history.length - 1]);
    setBusy(true);
    const health = useRecord && vault.profile ? healthContextFrom(vault.profile) : null;
    const reply = await askChia({ history, mode, topic: activeTopic, health });
    const full: Turn[] = [...history, { role: "assistant", text: reply }];
    setTurns(full);
    setBusy(false);
    if (save && vault.profile) {
      const title = full.find((t) => t.role === "user")?.text.slice(0, 60) ?? "Consulta";
      await vault.update((p) => ({ ...p, consultations: upsertConsultation(p.consultations, { id: consultId.current, date: new Date().toISOString(), title, turns: full }) }));
    }
  };

  // Llegada desde Inicio (pregunta) o desde una categoría (rol de especialista): se envía sola.
  useEffect(() => {
    if (!params.n) return;
    const tp = isTopic(params.topic) ? params.topic : null;
    if (!params.q && !tp) return;
    setTurns([]);
    setCrisisAt([]);
    consultId.current = newId();
    setTopic(tp);
    const first = params.q ?? TOPIC_UI.find((x) => x.k === tp)?.start ?? "";
    router.setParams({ q: undefined, topic: undefined, n: undefined });
    void send(first, tp, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.n]);

  const topicLabel = topic ? TOPIC_UI.find((x) => x.k === topic)?.label : null;

  return (
    <SafeAreaView style={st.screen} edges={["top", "left", "right"]}>
      <TopBar />
      <View style={st.controls}>
        <View style={st.modeRow} accessibilityRole="radiogroup" accessibilityLabel="Tipo de lenguaje">
          {(["easy", "technical"] as const).map((m) => (
            <Pressable key={m} accessibilityRole="radio" accessibilityState={{ checked: mode === m }} onPress={() => setMode(m)} style={[st.mode, mode === m && st.modeOn]}>
              <Text style={[st.modeText, mode === m && { color: "#FFFFFF" }]}>{m === "easy" ? "Fácil" : "Técnico"}</Text>
            </Pressable>
          ))}
        </View>
        {topicLabel ? <Text style={st.topic} numberOfLines={1}>{topicLabel}</Text> : null}
      </View>

      {vault.profile ? (
        <View style={st.toggles}>
          <View style={st.toggle}>
            <Switch value={save} onValueChange={setSave} trackColor={{ true: C.primary, false: C.border }} accessibilityLabel="Guardar en Mi espacio" />
            <Text style={st.toggleText}>Guardar en Mi espacio</Text>
          </View>
          <View style={st.toggle}>
            <Switch value={useRecord} onValueChange={setUseRecord} trackColor={{ true: C.primary, false: C.border }} accessibilityLabel="Usar mi ficha" />
            <Text style={st.toggleText}>Usar mi ficha</Text>
          </View>
        </View>
      ) : (
        <Text style={st.temp}>Conversación temporal · se borra al salir</Text>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
        <ScrollView ref={scroll} contentContainerStyle={st.list} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
          {turns.length === 0 && (
            <View style={{ gap: 12 }}>
              <Text style={st.hello}>¿Qué te gustaría saber?</Text>
              <Text style={st.muted}>Soy un asistente de IA. No guardo tu conversación ni te pido datos personales.</Text>
              <View style={st.chips}>
                {SUGGESTIONS.map((sug) => (
                  <Pressable key={sug} onPress={() => void send(sug)} style={st.chip}><Text style={st.chipText}>{sug}</Text></Pressable>
                ))}
              </View>
            </View>
          )}

          {turns.map((t, i) => (
            <View key={i} style={{ gap: 10 }}>
              {t.role === "user" ? (
                <View style={st.userBubble}><Text style={st.userText}>{t.text}</Text></View>
              ) : (
                <View style={st.botBubble}>
                  {splitMedia(t.text).map((part, j) => (part.type === "media" ? <ChatMedia key={j} id={part.id} /> : <RichText key={j} text={part.text} />))}
                </View>
              )}
              {crisisAt.includes(i) && (
                <View style={st.crisis}>
                  <Text style={st.crisisTitle}>No estás sola/o. Hay personas listas para ayudarte ahora, gratis:</Text>
                  {HELPLINES.map((h) => (
                    <Pressable key={h.name} onPress={() => void Linking.openURL(h.href)} style={st.helpline}>
                      <Text style={st.helplineName}>{h.name}</Text>
                      <Text style={st.muted}>{h.desc.es}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
          {busy && <View style={st.typing}><ActivityIndicator color={C.primary} /><Text style={st.muted}>Chía está escribiendo…</Text></View>}
          {!hasServer && turns.length > 0 && <Text style={st.demo}>Modo demostración: configura EXPO_PUBLIC_CHIA_API_URL para usar la IA real.</Text>}
        </ScrollView>

        <View style={st.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu duda, sin miedo…"
            placeholderTextColor={C.muted}
            multiline
            style={st.input}
            accessibilityLabel="Escribe tu mensaje"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Enviar" disabled={busy || !input.trim()} onPress={() => void send(input)} style={[st.send, (busy || !input.trim()) && { opacity: 0.4 }]}>
            <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={st.disclaimer}>{DISCLAIMER}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  controls: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  modeRow: { flexDirection: "row", backgroundColor: C.lavender, borderRadius: R.pill, padding: 3 },
  mode: { minHeight: 40, paddingHorizontal: 14, borderRadius: R.pill, justifyContent: "center" },
  modeOn: { backgroundColor: C.primary },
  modeText: { fontSize: 14, fontWeight: "700", color: C.primaryDark },
  topic: { flex: 1, fontSize: 13, fontWeight: "800", color: C.primary, textAlign: "right" },
  toggles: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", backgroundColor: C.lavender, paddingVertical: 6, paddingHorizontal: 12 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44 },
  toggleText: { fontSize: 13, fontWeight: "700", color: C.primaryDark },
  temp: { backgroundColor: C.lavender, color: C.primaryDark, fontSize: 13, textAlign: "center", paddingVertical: 8 },
  list: { padding: 16, gap: 14 },
  hello: { fontSize: 24, fontWeight: "800", color: C.ink },
  muted: { fontSize: 14, lineHeight: 20, color: C.muted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: C.lavender },
  chipText: { fontSize: 15, fontWeight: "600", color: C.primaryDark },
  userBubble: { alignSelf: "flex-end", maxWidth: "85%", backgroundColor: C.primary, borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 16, paddingVertical: 12 },
  userText: { color: "#FFFFFF", fontSize: 16, lineHeight: 23 },
  botBubble: { alignSelf: "flex-start", maxWidth: "92%", backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 20, borderBottomLeftRadius: 6, padding: 14, gap: 6 },
  crisis: { borderWidth: 2, borderColor: C.exit, borderRadius: R.lg, padding: 14, gap: 8, backgroundColor: "#F3EEF0" },
  crisisTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  helpline: { backgroundColor: C.card, borderRadius: R.md, padding: 12, minHeight: 48 },
  helplineName: { fontSize: 15, fontWeight: "800", color: C.ink },
  typing: { flexDirection: "row", alignItems: "center", gap: 8 },
  demo: { fontSize: 12, color: C.muted, textAlign: "center" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderRadius: 24, borderWidth: 1.5, borderColor: C.lavenderMid, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 16, color: C.ink, backgroundColor: C.bg },
  send: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  disclaimer: { fontSize: 12, lineHeight: 16, color: C.muted, textAlign: "center", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.card },
});
