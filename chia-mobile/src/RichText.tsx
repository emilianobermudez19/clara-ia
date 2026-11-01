import { Text, View } from "react-native";
import { C } from "./theme";

// Markdown mínimo de las respuestas: párrafos, viñetas "- " y **negritas**.
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <Text style={{ fontSize: 16, lineHeight: 23, color: C.ink }}>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <Text key={i} style={{ fontWeight: "800" }}>{p.slice(2, -2)}</Text> : p.replace(/_([^_]+)_/g, "$1"),
      )}
    </Text>
  );
}

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trimEnd()).filter((l, i, a) => l || (a[i - 1] ?? "") !== "");
  return (
    <View style={{ gap: 6 }}>
      {lines.map((l, i) => {
        if (!l.trim()) return null;
        const bullet = /^\s*[-*•]\s+/.test(l);
        return bullet ? (
          <View key={i} style={{ flexDirection: "row", gap: 8, paddingLeft: 4 }}>
            <Text style={{ fontSize: 16, lineHeight: 23, color: C.primary }}>•</Text>
            <View style={{ flex: 1 }}><Inline text={l.replace(/^\s*[-*•]\s+/, "")} /></View>
          </View>
        ) : (
          <Inline key={i} text={l} />
        );
      })}
    </View>
  );
}
