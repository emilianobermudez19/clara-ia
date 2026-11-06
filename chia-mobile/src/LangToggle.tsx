import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLang, type Lang } from "./i18n";
import { C, R } from "./theme";

// Selector de idioma ES / EN.
export function LangToggle({ light }: { light?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <View style={[st.box, light && st.boxLight]} accessibilityRole="radiogroup" accessibilityLabel="Idioma / Language">
      {(["es", "en"] as Lang[]).map((l) => {
        const on = lang === l;
        return (
          <Pressable
            key={l}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={l === "es" ? "Español" : "English"}
            onPress={() => setLang(l)}
            style={[st.item, on && (light ? st.onLight : st.on)]}
            hitSlop={6}
          >
            <Text style={[st.text, light && { color: "#FFFFFF" }, on && { color: light ? C.primary : "#FFFFFF" }]}>{l.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  box: { flexDirection: "row", backgroundColor: C.lavender, borderRadius: R.pill, padding: 3 },
  boxLight: { backgroundColor: "rgba(255,255,255,0.16)" },
  item: { minWidth: 40, minHeight: 36, borderRadius: R.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  on: { backgroundColor: C.primary },
  onLight: { backgroundColor: "#FFFFFF" },
  text: { fontSize: 13, fontWeight: "800", color: C.primaryDark },
});
