import { Pressable, StyleSheet, Text, View } from "react-native";
import { LogoMark } from "./Logo";
import { useVault } from "./vault";
import { LangToggle } from "./LangToggle";
import { recordQuickExit } from "./wellbeing";
import { C, R } from "./theme";
import { tr } from "./i18n";

// Barra superior con "Salir rápido": bloquea Mi espacio, borra la conversación en pantalla y vuelve al acceso.
export function TopBar() {
  const vault = useVault();
  return (
    <View style={st.bar}>
      <View style={st.brand}>
        <LogoMark size={28} />
        <Text style={st.name}>{tr("Chía")}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <LangToggle />
      <Pressable accessibilityRole="button" accessibilityLabel={tr("Salir rápido")} onPress={() => { void recordQuickExit(); vault.lock(); }} style={st.exit}>
        <Text style={st.exitText}>{tr("Salir rápido")}</Text>
      </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 8 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 21, fontWeight: "800", color: C.ink },
  exit: { minHeight: 44, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: C.exit, alignItems: "center", justifyContent: "center" },
  exitText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
});
