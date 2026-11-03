import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GUIDES, type Guide } from "../../src/shared/content/guides";
import { MEDICINES, MED_ACCESS_LABEL, type Medicine } from "../../src/shared/content/medicines";
import { HERBS, HERB_CAUTION_LABEL, HERB_NOTICE, type Herb } from "../../src/shared/content/herbs";
import { Illo } from "../../src/Illustrations";
import { TopBar } from "../../src/TopBar";
import { Segmented } from "../../src/ui";
import { C, R } from "../../src/theme";

type Section = "sexual" | "meds" | "herbs";

const strip = (s: string) => (typeof s.normalize === "function" ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s).toLowerCase();

export default function Guias() {
  const [section, setSection] = useState<Section>("sexual");
  const [q, setQ] = useState("");
  const needle = strip(q.trim());
  const match = (...t: string[]) => !needle || t.some((x) => strip(x).includes(needle));

  const guides = useMemo(() => GUIDES.filter((g) => match(g.t.es, ...g.steps.map((s) => s.es))), [needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const meds = useMemo(() => MEDICINES.filter((m) => match(m.name, m.category, m.uses, ...m.brands)), [needle]); // eslint-disable-line react-hooks/exhaustive-deps
  const herbs = useMemo(() => HERBS.filter((h) => match(h.name, h.scientific, h.uses)), [needle]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={st.screen} edges={["top", "left", "right"]}>
      <TopBar />
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
        <Text style={st.h1}>Guías</Text>
        <View style={st.search}>
          <Ionicons name="search" size={18} color={C.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Buscar tema, medicamento o planta…" placeholderTextColor={C.muted} style={st.searchInput} accessibilityLabel="Buscar" />
        </View>
        <Segmented<Section>
          value={section}
          onChange={setSection}
          options={[
            { key: "sexual", label: "Salud sexual" },
            { key: "meds", label: "Medicamentos" },
            { key: "herbs", label: "Herbolaria" },
          ]}
        />

        {section === "sexual" && guides.map((g) => <GuideCard key={g.id} g={g} />)}

        {section === "meds" && (
          <>
            <Text style={st.notice}>Información general, sin dosis. Para tomar cualquier medicamento: Consulta a tu médico o farmacéutico para la dosis exacta.</Text>
            {meds.map((m) => <MedCard key={m.id} m={m} />)}
          </>
        )}

        {section === "herbs" && (
          <>
            <Text style={st.notice}>{HERB_NOTICE}</Text>
            {herbs.map((h) => <HerbCard key={h.id} h={h} />)}
          </>
        )}

        {((section === "sexual" && !guides.length) || (section === "meds" && !meds.length) || (section === "herbs" && !herbs.length)) && (
          <Text style={st.muted}>Sin resultados. Prueba con otra palabra o pregúntale a Chía.</Text>
        )}

        <Pressable onPress={() => router.push({ pathname: "/chat", params: { q: q.trim() || "Tengo una duda", n: String(Date.now()) } })} style={st.ask}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
          <Text style={st.askText}>¿No encuentras algo? Pregúntale a Chía</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function GuideCard({ g }: { g: Guide }) {
  const [open, setOpen] = useState(false);
  const stepIllos = g.illos && g.illos.length > 1 ? g.illos : undefined;
  return (
    <View style={st.card}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={st.cardHead}>
        {g.illos?.[0] ? <View style={st.illo}><Illo name={g.illos[0]} size={56} /></View> : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={st.tag}>Guía · {g.min} min</Text>
          <Text style={st.title}>{g.t.es}</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={C.muted} />
      </Pressable>
      {open && (
        <View style={{ gap: 10 }}>
          {g.steps.map((s, i) => (
            <View key={s.es} style={st.step}>
              {stepIllos?.[i] ? (
                <View style={st.illo}><Illo name={stepIllos[i]!} size={56} /></View>
              ) : (
                <View style={st.num}><Text style={st.numText}>{i + 1}</Text></View>
              )}
              <Text style={st.stepText}>{s.es}</Text>
            </View>
          ))}
          {g.sources?.length ? (
            <View style={st.sources}>
              <Text style={st.muted}>Fuentes:</Text>
              {g.sources.map((s) => (
                <Pressable key={s.url} onPress={() => void Linking.openURL(s.url)} accessibilityRole="link"><Text style={st.link}>{s.label}</Text></Pressable>
              ))}
            </View>
          ) : null}
          <Text style={st.muted}>Revisión clínica pendiente.</Text>
        </View>
      )}
    </View>
  );
}

function MedCard({ m }: { m: Medicine }) {
  const [open, setOpen] = useState(false);
  const tone = m.access === "otc" ? { bg: C.leafBg, fg: C.leaf } : m.access === "controlled" ? { bg: "#F6E7E3", fg: C.danger } : { bg: C.lavender, fg: C.primaryDark };
  return (
    <View style={st.card}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={st.cardHead}>
        <View style={[st.iconBox, { backgroundColor: tone.bg }]}><Ionicons name="medkit" size={22} color={tone.fg} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={st.title}>{m.name}</Text>
          <Text style={st.muted}>{m.category}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={[st.pill, { backgroundColor: tone.bg, color: tone.fg }]}>{MED_ACCESS_LABEL[m.access]}</Text>
          {m.priceMxn ? <Text style={st.price}>≈ ${m.priceMxn} MXN</Text> : null}
        </View>
      </Pressable>
      {open && (
        <View style={{ gap: 8 }}>
          <Row label="Para qué se usa" value={m.uses} />
          <Row label="Marcas comunes" value={m.brands.join(", ")} />
          <Row label="No usar si" value={m.contraindications} warn />
          <Text style={st.notice}>
            {m.access === "otc"
              ? "Venta libre: sigue la etiqueta. Consulta a tu médico o farmacéutico para la dosis exacta."
              : "Requiere receta: tómalo solo como te lo indicó tu médico. Chía no da dosis ni cambia tratamientos."}
          </Text>
        </View>
      )}
    </View>
  );
}

function HerbCard({ h }: { h: Herb }) {
  const [open, setOpen] = useState(false);
  const danger = h.caution === "avoid" || h.caution === "topical";
  return (
    <View style={st.card}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={st.cardHead}>
        <View style={[st.iconBox, { backgroundColor: danger ? "#F6E7E3" : C.leafBg }]}><Ionicons name="leaf" size={22} color={danger ? C.danger : C.leaf} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={st.title}>{h.name}</Text>
          <Text style={[st.muted, { fontStyle: "italic" }]}>{h.scientific}</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color={C.muted} />
      </Pressable>
      {h.caution !== "normal" && <Text style={[st.caution, danger && { color: C.danger }]}>{HERB_CAUTION_LABEL[h.caution]}</Text>}
      {open && (
        <View style={{ gap: 8 }}>
          <Row label="Usos tradicionales" value={h.uses} />
          <Row label="No usar si" value={h.contraindications} warn />
          <Row label="Interacciones con medicamentos" value={h.interactions} warn />
          <Row label="Dónde conseguirla" value={h.availability} />
        </View>
      )}
    </View>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={[st.row, warn && { backgroundColor: "#FBF3E6" }]}>
      <Text style={st.rowLabel}>{label}</Text>
      <Text style={st.rowValue}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  h1: { fontSize: 28, fontWeight: "800", color: C.ink },
  search: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 50, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1.5, borderColor: C.lavenderMid, backgroundColor: C.card },
  searchInput: { flex: 1, fontSize: 16, color: C.ink, paddingVertical: 10 },
  notice: { fontSize: 14, lineHeight: 20, color: C.ink, backgroundColor: C.lavender, padding: 12, borderRadius: R.md },
  muted: { fontSize: 13, lineHeight: 18, color: C.muted },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 14, gap: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  illo: { backgroundColor: C.lavender, borderRadius: 16, padding: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  tag: { fontSize: 12, fontWeight: "800", color: C.primary },
  title: { fontSize: 16, fontWeight: "800", color: C.ink, lineHeight: 21 },
  pill: { fontSize: 11, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, overflow: "hidden" },
  price: { fontSize: 12, fontWeight: "700", color: C.muted },
  step: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.bg, borderRadius: R.md, padding: 8 },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.lavender, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 14, fontWeight: "800", color: C.primaryDark },
  stepText: { flex: 1, fontSize: 15, lineHeight: 21, color: C.ink },
  sources: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  link: { fontSize: 13, fontWeight: "700", color: C.primary, textDecorationLine: "underline" },
  caution: { fontSize: 13, fontWeight: "800", color: "#8A5A00" },
  row: { backgroundColor: C.bg, borderRadius: R.md, padding: 10, gap: 2 },
  rowLabel: { fontSize: 12, fontWeight: "800", color: C.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  rowValue: { fontSize: 15, lineHeight: 21, color: C.ink },
  ask: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, borderRadius: R.pill, backgroundColor: C.primary, marginTop: 6 },
  askText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
