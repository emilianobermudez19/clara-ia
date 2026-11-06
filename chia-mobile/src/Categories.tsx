import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, R } from "./theme";
import { topicUI } from "./topics";
import { H2 } from "./ui";
import { tr } from "./i18n";

// "¿En qué te ayudamos?": cada tarjeta abre el chat con el rol de especialista correspondiente.
export function Categories() {
  return (
    <View style={{ gap: 12 }}>
      <H2>{tr("¿En qué te ayudamos?")}</H2>
      <View style={st.grid}>
        {topicUI().map((x) => (
          <Pressable
            key={x.k}
            accessibilityRole="button"
            accessibilityLabel={x.label}
            onPress={() => router.push({ pathname: "/chat", params: { topic: x.k, n: String(Date.now()) } })}
            style={({ pressed }) => [st.tile, pressed && { opacity: 0.85 }]}
          >
            <View style={st.icon}><Ionicons name={x.icon} size={22} color={C.primary} /></View>
            <View style={{ gap: 2 }}>
              <Text style={st.label}>{x.label}</Text>
              <Text style={st.sub}>{x.sub}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47.5%", minHeight: 132, backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16, justifyContent: "space-between", gap: 10 },
  icon: { width: 44, height: 44, borderRadius: 16, backgroundColor: C.lavender, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 16, fontWeight: "800", color: C.ink, lineHeight: 20 },
  sub: { fontSize: 13, color: C.muted, lineHeight: 17 },
});
