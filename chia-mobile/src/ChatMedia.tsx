import { StyleSheet, Text, View } from "react-native";
import { GUIDES } from "../../src/content/guides";
import { C, R } from "./theme";

// Guía visual dentro de una respuesta: solo piezas de la biblioteca revisada (src/content de la web).
export function ChatMedia({ id }: { id: string }) {
  const g = GUIDES.find((x) => x.id === id);
  if (!g) return null;
  return (
    <View style={st.box} accessible accessibilityLabel={g.t.es}>
      <Text style={st.title}>{g.t.es}</Text>
      {g.steps.map((step, i) => (
        <View key={step.es} style={st.row}>
          <View style={st.num}><Text style={st.numText}>{i + 1}</Text></View>
          <Text style={st.step}>{step.es}</Text>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  box: { marginVertical: 6, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, padding: 12, gap: 8 },
  title: { fontSize: 15, fontWeight: "800", color: C.primaryDark },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.lavender, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 13, fontWeight: "800", color: C.primaryDark },
  step: { flex: 1, fontSize: 15, lineHeight: 20, color: C.ink },
});
