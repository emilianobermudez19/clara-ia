import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { tr } from "./i18n";
import { C, R } from "./theme";

// Línea de orientación 24/7 para dudas que no son de urgencias pero no pueden esperar.
// - Chía (IA) responde 24/7 desde ya.
// - La línea humana se activa cuando haya un aliado médico: EXPO_PUBLIC_HOTLINE_PHONE / EXPO_PUBLIC_HOTLINE_WHATSAPP.
const PHONE = process.env.EXPO_PUBLIC_HOTLINE_PHONE?.trim();
const WHATSAPP = process.env.EXPO_PUBLIC_HOTLINE_WHATSAPP?.replace(/\D/g, "");

export function Hotline({ compact }: { compact?: boolean }) {
  return (
    <View style={st.card}>
      <View style={st.head}>
        <View style={st.icon}><Ionicons name="call" size={22} color={C.leaf} /></View>
        <View style={{ flex: 1 }}>
          <Text style={st.title}>{tr("Línea de orientación 24/7")}</Text>
          <Text style={st.sub}>{tr("Para dudas que no son de urgencias pero no pueden esperar.")}</Text>
        </View>
      </View>

      <Pressable style={[st.btn, st.primary]} onPress={() => router.push("/chat")} accessibilityRole="button">
        <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
        <Text style={[st.btnText, { color: "#FFFFFF" }]}>{tr("Preguntar a Chía ahora (24/7)")}</Text>
      </Pressable>

      {PHONE || WHATSAPP ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          {PHONE ? (
            <Pressable style={[st.btn, st.secondary, { flex: 1 }]} onPress={() => void Linking.openURL(`tel:${PHONE}`)} accessibilityRole="button">
              <Ionicons name="call" size={18} color={C.primaryDark} />
              <Text style={st.btnText}>{tr("Llamar")}</Text>
            </Pressable>
          ) : null}
          {WHATSAPP ? (
            <Pressable style={[st.btn, st.secondary, { flex: 1 }]} onPress={() => void Linking.openURL(`https://wa.me/${WHATSAPP}`)} accessibilityRole="button">
              <Ionicons name="logo-whatsapp" size={18} color={C.primaryDark} />
              <Text style={st.btnText}>WhatsApp</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Text style={st.note}>{tr("Muy pronto: orientación con personal de salud por teléfono y WhatsApp, con nuestros aliados.")}</Text>
      )}

      {!compact && (
        <>
          <Pressable style={st.row} onPress={() => void Linking.openURL("tel:8009112000")} accessibilityRole="button">
            <Text style={st.rowTitle}>{tr("Línea de la Vida (México) · 800 911 2000")}</Text>
            <Text style={st.sub}>{tr("Gratuita, 24/7: apoyo emocional, crisis y adicciones.")}</Text>
          </Pressable>
          <Text style={st.urgent}>{tr("Si es una emergencia, llama a tu número local de emergencias (911 en México).")}</Text>
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: C.leafBg, borderRadius: R.lg, padding: 16, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.card, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "800", color: "#1F4A33" },
  sub: { fontSize: 14, lineHeight: 19, color: "#2F4A3A" },
  btn: { minHeight: 48, borderRadius: R.pill, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16 },
  primary: { backgroundColor: C.primary },
  secondary: { backgroundColor: C.card },
  btnText: { fontSize: 15, fontWeight: "700", color: C.primaryDark },
  note: { fontSize: 13, lineHeight: 18, color: "#2F4A3A" },
  row: { backgroundColor: C.card, borderRadius: R.md, padding: 12, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
  urgent: { fontSize: 13, fontWeight: "700", color: C.ink },
});
