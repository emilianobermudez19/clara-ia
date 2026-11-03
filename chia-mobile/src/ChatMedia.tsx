import { StyleSheet, Text, View } from "react-native";
import { GUIDES } from "./shared/content/guides";
import { Illo } from "./Illustrations";
import { C, R } from "./theme";

// Guía visual dentro de una respuesta: solo piezas de la biblioteca revisada.
export function ChatMedia({ id }: { id: string }) {
  const g = GUIDES.find((x) => x.id === id);
  if (!g) return null;
  const stepIllos = g.illos && g.illos.length > 1 ? g.illos : undefined;
  return (
    <View style={st.box} accessible accessibilityLabel={g.t.es}>
      <View style={st.head}>
        {g.illos?.[0] ? <View style={st.illo}><Illo name={g.illos[0]} size={44} /></View> : null}
        <Text style={st.title}>{g.t.es}</Text>
      </View>
      {g.steps.map((step, i) => (
        <View key={step.es} style={st.row}>
          {stepIllos?.[i] ? (
            <View style={st.illo}><Illo name={stepIllos[i]!} size={48} /></View>
          ) : (
            <View style={st.num}><Text style={st.numText}>{i + 1}</Text></View>
          )}
          <Text style={st.step}>{step.es}</Text>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  box: { marginVertical: 6, borderRadius: R.md, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg, padding: 12, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1, fontSize: 15, fontWeight: "800", color: C.primaryDark },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  illo: { backgroundColor: C.lavender, borderRadius: 12, padding: 2 },
  num: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.lavender, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 13, fontWeight: "800", color: C.primaryDark },
  step: { flex: 1, fontSize: 15, lineHeight: 20, color: C.ink },
});
