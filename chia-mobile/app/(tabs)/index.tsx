import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { nextDose } from "@/lib/vault";
import { Categories } from "../../src/Categories";
import { TopBar } from "../../src/TopBar";
import { useVault } from "../../src/vault";
import { DISCLAIMER } from "../../src/topics";
import { C, R } from "../../src/theme";

export default function Home() {
  const vault = useVault();
  const [q, setQ] = useState("");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(id); }, []);

  const h = now.getHours();
  const greet = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const next = vault.profile ? nextDose(vault.profile.reminders, now) : null;

  // La pregunta viaja como parámetro y el chat la envía sola como primer mensaje.
  const ask = () => {
    const text = q.trim();
    if (!text) return;
    setQ("");
    router.push({ pathname: "/chat", params: { q: text, n: String(Date.now()) } });
  };

  return (
    <SafeAreaView style={st.screen} edges={["top", "left", "right"]}>
      <TopBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <View style={st.hero}>
            <Text style={st.greet}>{greet}{vault.profile ? `, ${vault.profile.alias}` : ""}</Text>
            <Text style={st.heroTitle}>¿Cómo te sientes hoy?</Text>
            <View style={st.askRow}>
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Escribe tu duda…"
                placeholderTextColor={C.muted}
                returnKeyType="send"
                onSubmitEditing={ask}
                style={st.askInput}
                accessibilityLabel="Escribe tu duda"
              />
              <Pressable accessibilityRole="button" accessibilityLabel="Enviar pregunta" onPress={ask} style={st.askBtn}>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={st.heroNote}>{vault.profile ? "Tu sesión está protegida con tu PIN." : "Consulta Express: anónima, se borra al salir."}</Text>
          </View>

          {vault.profile ? (
            <Pressable onPress={() => router.push("/espacio")} style={st.row}>
              <View style={st.rowIcon}><Ionicons name="alarm" size={22} color={C.primaryDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle}>
                  {next ? `Próxima toma: ${next.reminder.name} a las ${next.at.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : "Sin recordatorios activos"}
                </Text>
                <Text style={st.rowSub}>Recordatorios de medicamentos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </Pressable>
          ) : (
            <Pressable onPress={() => vault.setExpress(false)} style={st.row}>
              <View style={st.rowIcon}><Ionicons name="lock-closed" size={22} color={C.primaryDark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle}>Crea tu espacio o entra con tu PIN</Text>
                <Text style={st.rowSub}>Ficha médica, vacunas y recordatorios, cifrados en tu teléfono.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </Pressable>
          )}

          <Categories />

          <Pressable onPress={() => router.push("/espacio")} style={[st.row, { backgroundColor: C.leafBg, borderColor: C.leafBg }]}>
            <View style={[st.rowIcon, { backgroundColor: C.card }]}><Ionicons name="medical" size={22} color={C.leaf} /></View>
            <View style={{ flex: 1 }}>
              <Text style={[st.rowTitle, { color: "#1F4A33" }]}>Consulta con especialista</Text>
              <Text style={[st.rowSub, { color: "#2F4A3A" }]}>Solicita una consulta con médicos aliados.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.leaf} />
          </Pressable>

          <Text style={st.disclaimer}>{DISCLAIMER}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 22, paddingBottom: 40 },
  hero: { backgroundColor: C.primary, borderRadius: R.xl, padding: 20, gap: 12 },
  greet: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "700" },
  heroTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  askRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: R.pill, paddingLeft: 18, paddingRight: 6, minHeight: 56 },
  askInput: { flex: 1, fontSize: 17, color: C.ink, paddingVertical: 12 },
  askBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  heroNote: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16 },
  rowIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: C.lavender, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 16, fontWeight: "800", color: C.ink },
  rowSub: { fontSize: 14, color: C.muted, marginTop: 2 },
  disclaimer: { fontSize: 13, lineHeight: 18, color: C.muted, textAlign: "center" },
});
