import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { completeCheckIn, recordCalmSession, shouldCheckIn } from "./wellbeing";
import { tr } from "./i18n";
import { C, R } from "./theme";

// "¿Todo bien?": aparece dentro de la app tras varias salidas rápidas seguidas. Lenguaje neutro,
// sin mencionar el motivo en pantalla grande, y con salida inmediata si la persona lo necesita.
export function WellbeingCheck() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"ask" | "help">("ask");
  const enteredAt = useRef(Date.now());

  useEffect(() => {
    void shouldCheckIn().then(setOpen);
    // Si la app pasa a segundo plano después de 2 min de uso normal, la racha se rompe.
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "background" && Date.now() - enteredAt.current > 120_000) void recordCalmSession();
      if (s === "active") enteredAt.current = Date.now();
    });
    return () => sub.remove();
  }, []);

  const close = () => { void completeCheckIn(); setOpen(false); setStep("ask"); };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
      <View style={st.backdrop}>
        <View style={st.card} accessibilityViewIsModal>
          {step === "ask" ? (
            <>
              <Text style={st.title}>{tr("¿Todo bien?")}</Text>
              <Text style={st.body}>{tr("Notamos que últimamente has salido rápido varias veces. Solo queremos saber cómo estás. Nadie más ve esto.")}</Text>
              <Pressable style={[st.btn, st.primary]} onPress={close} accessibilityRole="button">
                <Text style={[st.btnText, { color: "#FFFFFF" }]}>{tr("Estoy bien")}</Text>
              </Pressable>
              <Pressable style={[st.btn, st.secondary]} onPress={() => setStep("help")} accessibilityRole="button">
                <Text style={st.btnText}>{tr("Me vendría bien ayuda")}</Text>
              </Pressable>
              <Pressable style={st.link} onPress={close} accessibilityRole="button">
                <Text style={st.linkText}>{tr("Prefiero no responder")}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={st.title}>{tr("Estamos contigo")}</Text>
              <Text style={st.body}>{tr("Si estás en peligro ahora, llama a tu número local de emergencias. Si alguien te presiona, te controla o te lastima, no es tu culpa y hay ayuda gratuita y confidencial.")}</Text>
              <Pressable style={[st.btn, st.primary]} onPress={() => { close(); router.push({ pathname: "/chat", params: { q: tr("Necesito ayuda, no me siento a salvo"), n: String(Date.now()) } }); }} accessibilityRole="button">
                <Text style={[st.btnText, { color: "#FFFFFF" }]}>{tr("Hablar con Chía ahora")}</Text>
              </Pressable>
              <Pressable style={[st.btn, st.secondary]} onPress={() => void Linking.openURL("https://findahelpline.com")} accessibilityRole="link">
                <Text style={st.btnText}>{tr("Líneas de ayuda gratuitas en tu país")}</Text>
              </Pressable>
              <Pressable style={st.link} onPress={close} accessibilityRole="button">
                <Text style={st.linkText}>{tr("Cerrar")}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(43,34,51,0.55)", justifyContent: "center", padding: 20 },
  card: { backgroundColor: C.card, borderRadius: R.xl, padding: 22, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", color: C.ink },
  body: { fontSize: 16, lineHeight: 23, color: C.ink },
  btn: { minHeight: 52, borderRadius: R.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  primary: { backgroundColor: C.primary },
  secondary: { backgroundColor: C.lavender },
  btnText: { fontSize: 16, fontWeight: "700", color: C.primaryDark, textAlign: "center" },
  link: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  linkText: { fontSize: 14, fontWeight: "700", color: C.muted },
});
