import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { emptyInsurance, type Insurance, type Profile } from "./shared/lib/vault";
import { useVault } from "./vault";
import { tr } from "./i18n";
import { Button, Card, Field, H2, P } from "./ui";
import { C, R } from "./theme";

// Seguro médico en "Mi espacio": datos y foto de la credencial, cifrados como el resto de la ficha.
// Para quien no tiene seguro: opciones públicas y, próximamente, planes accesibles con aliados.
export function InsuranceCard({ profile }: { profile: Profile }) {
  const vault = useVault();
  const [ins, setIns] = useState<Insurance>(profile.insurance ?? emptyInsurance());
  const [saved, setSaved] = useState(false);
  const [interest, setInterest] = useState(false);
  const set = <K extends keyof Insurance>(k: K, v: Insurance[K]) => { setIns((x) => ({ ...x, [k]: v })); setSaved(false); };

  const pickPhoto = async (camera: boolean) => {
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.4, base64: true, allowsEditing: true, aspect: [16, 10] };
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    const a = res.canceled ? null : res.assets[0];
    if (a?.base64) set("cardPhoto", `data:image/jpeg;base64,${a.base64}`);
  };

  const save = async () => {
    await vault.update((p) => ({ ...p, insurance: ins }));
    setSaved(true);
  };

  const kinds: { k: Insurance["kind"]; label: string }[] = [
    { k: "private", label: tr("Seguro privado") },
    { k: "public", label: tr("IMSS, ISSSTE u otro público") },
    { k: "none", label: tr("No tengo seguro") },
  ];

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="card" size={22} color={C.primary} />
        <H2>{tr("Seguro médico")}</H2>
      </View>
      <View style={st.chips}>
        {kinds.map((x) => (
          <Pressable key={x.k} accessibilityRole="radio" accessibilityState={{ checked: ins.kind === x.k }} onPress={() => set("kind", x.k)} style={[st.chip, ins.kind === x.k && st.chipOn]}>
            <Text style={[st.chipText, ins.kind === x.k && { color: "#FFFFFF" }]}>{x.label}</Text>
          </Pressable>
        ))}
      </View>

      {(ins.kind === "private" || ins.kind === "public") && (
        <>
          <Field label={tr("Aseguradora o institución")} value={ins.insurer} onChangeText={(v) => set("insurer", v)} />
          <Field label={tr("Número de póliza o afiliación")} value={ins.policyNumber} onChangeText={(v) => set("policyNumber", v)} autoCapitalize="characters" />
          <Field label={tr("Teléfono de atención del seguro")} value={ins.phone} onChangeText={(v) => set("phone", v)} keyboardType="phone-pad" />
          <Field label={tr("Vigencia (AAAA-MM-DD)")} value={ins.validUntil} onChangeText={(v) => set("validUntil", v)} keyboardType="numbers-and-punctuation" />
          {ins.cardPhoto ? (
            <View style={{ gap: 8 }}>
              <Image source={{ uri: ins.cardPhoto }} style={st.photo} resizeMode="cover" accessibilityLabel={tr("Foto de tu credencial")} />
              <Button variant="danger" label={tr("Quitar foto")} onPress={() => set("cardPhoto", undefined)} />
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button variant="secondary" label={tr("Tomar foto")} onPress={() => void pickPhoto(true)} style={{ flex: 1 }} />
              <Button variant="secondary" label={tr("Subir de galería")} onPress={() => void pickPhoto(false)} style={{ flex: 1 }} />
            </View>
          )}
          <Text style={st.muted}>{tr("Se guarda cifrado en tu teléfono. Úsalo para tenerlo a mano en consulta o urgencias.")}</Text>
        </>
      )}

      {ins.kind === "none" && (
        <View style={{ gap: 10 }}>
          <P>{tr("No tener seguro no significa no tener atención:")}</P>
          <View style={st.option}>
            <Text style={st.optionTitle}>{tr("Atención pública gratuita")}</Text>
            <Text style={st.muted}>{tr("En México, si no tienes seguridad social, puedes atenderte en centros de salud y hospitales públicos (IMSS-Bienestar en los estados adheridos). Lleva una identificación y tu CURP.")}</Text>
          </View>
          <View style={st.option}>
            <Text style={st.optionTitle}>{tr("Planes accesibles con aliados (próximamente)")}</Text>
            <Text style={st.muted}>{tr("Estamos buscando aseguradoras aliadas para ofrecer planes sencillos y económicos dentro de Chía.")}</Text>
            {interest ? (
              <Text style={st.ok}>{tr("Gracias, te avisaremos aquí cuando estén disponibles.")}</Text>
            ) : (
              <Button
                variant="secondary"
                label={tr("Me interesa")}
                onPress={() => {
                  // Métrica anónima de demanda: sin datos de la persona.
                  console.info("[intent]", { source: "insurance", choice: "interested" });
                  setInterest(true);
                }}
              />
            )}
          </View>
        </View>
      )}

      {ins.kind !== "" && <Button label={tr("Guardar seguro")} onPress={() => void save()} />}
      {saved && <Text style={st.ok}>{tr("Guardado y cifrado.")}</Text>}
    </Card>
  );
}

const st = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderRadius: R.pill, backgroundColor: C.lavender },
  chipOn: { backgroundColor: C.primary },
  chipText: { fontSize: 14, fontWeight: "700", color: C.primaryDark },
  photo: { width: "100%", aspectRatio: 1.6, borderRadius: R.md, backgroundColor: C.lavender },
  muted: { fontSize: 13, lineHeight: 18, color: C.muted },
  ok: { fontSize: 14, fontWeight: "700", color: C.leaf, textAlign: "center" },
  option: { backgroundColor: C.bg, borderRadius: R.md, padding: 12, gap: 6 },
  optionTitle: { fontSize: 15, fontWeight: "800", color: C.ink },
});
