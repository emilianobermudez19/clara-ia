import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BLOOD_TYPES, COMMON_VACCINES, newId, nextDose, type BloodType, type Profile, type Vaccine } from "../../src/shared/lib/vault";
import { ensurePermission } from "../../src/notifications";
import { TopBar } from "../../src/TopBar";
import { Button, Card, Field, H1, H2, P, Segmented } from "../../src/ui";
import { useVault } from "../../src/vault";
import { DISCLAIMER } from "../../src/topics";
import { C, R } from "../../src/theme";

type Tab = "history" | "reminders" | "record" | "tele";

export default function Espacio() {
  const vault = useVault();
  const [tab, setTab] = useState<Tab>("history");
  const profile = vault.profile;

  return (
    <SafeAreaView style={st.screen} edges={["top", "left", "right"]}>
      <TopBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          {!profile ? (
            <Card>
              <H2>Mi espacio</H2>
              <P muted>Estás en Consulta Express. Para guardar tu ficha, vacunas, recordatorios y consultas, crea una cuenta o entra con tu PIN.</P>
              <Button label="Crear cuenta o entrar" onPress={() => vault.setExpress(false)} />
            </Card>
          ) : (
            <>
              <H1>Hola, {profile.alias}</H1>
              <NextDose profile={profile} onPress={() => setTab("reminders")} />
              <Segmented<Tab>
                value={tab}
                onChange={setTab}
                options={[
                  { key: "history", label: "Consultas" },
                  { key: "reminders", label: "Recordatorios" },
                  { key: "record", label: "Ficha" },
                  { key: "tele", label: "Telemedicina" },
                ]}
              />
              {tab === "history" && <History profile={profile} />}
              {tab === "reminders" && <Reminders profile={profile} />}
              {tab === "record" && <Record profile={profile} />}
              {tab === "tele" && <Tele profile={profile} />}
              <Text style={st.privacy}>Cifrado AES-256 en este teléfono · clave en el llavero seguro del sistema · se bloquea al salir de la app</Text>
            </>
          )}
          <Text style={st.disclaimer}>{DISCLAIMER}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NextDose({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  const next = nextDose(profile.reminders, new Date());
  return (
    <Pressable onPress={onPress} style={st.dose}>
      <View style={st.doseIcon}><Ionicons name="alarm" size={24} color="#FFFFFF" /></View>
      <View style={{ flex: 1 }}>
        <Text style={st.doseLabel}>Próxima toma</Text>
        <Text style={st.doseValue}>{next ? `${next.reminder.name} · ${next.at.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : "Sin recordatorios activos"}</Text>
      </View>
    </Pressable>
  );
}

function History({ profile }: { profile: Profile }) {
  const vault = useVault();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <View style={{ gap: 12 }}>
      <Button label="Nueva consulta" icon={<Ionicons name="add" size={20} color="#FFFFFF" />} onPress={() => router.push("/chat")} />
      {profile.consultations.length === 0 && <Card><P muted>Aún no guardas consultas. En el chat, activa "Guardar en Mi espacio". Las consultas anónimas nunca se guardan.</P></Card>}
      {profile.consultations.map((k) => (
        <Card key={k.id}>
          <Pressable onPress={() => setOpen(open === k.id ? null : k.id)} accessibilityRole="button" accessibilityState={{ expanded: open === k.id }}>
            <Text style={st.date}>{new Date(k.date).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
            <Text style={st.itemTitle}>{k.title}</Text>
          </Pressable>
          {open === k.id && (
            <View style={{ gap: 8 }}>
              {k.turns.map((t, i) => (
                <Text key={i} style={[st.turn, t.role === "user" ? { backgroundColor: C.lavender } : { backgroundColor: C.bg }]}>
                  <Text style={{ fontWeight: "800" }}>{t.role === "user" ? "Tú" : "Chía"}: </Text>
                  {t.text.replace(/\[\[media:[a-z0-9-]+\]\]/g, "")}
                </Text>
              ))}
              <Button variant="danger" label="Borrar consulta" onPress={() => void vault.update((p) => ({ ...p, consultations: p.consultations.filter((x) => x.id !== k.id) }))} />
            </View>
          )}
        </Card>
      ))}
    </View>
  );
}

function Reminders({ profile }: { profile: Profile }) {
  const vault = useVault();
  const [name, setName] = useState("");
  const [times, setTimes] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [allowed, setAllowed] = useState<boolean | null>(null);

  return (
    <View style={{ gap: 12 }}>
      <Text style={st.rule}>Chía no calcula dosis ni horarios: usa los de tu receta o los del empaque.</Text>
      {profile.reminders.map((r) => (
        <Card key={r.id} style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={st.itemTitle}>{r.name}</Text>
            <Text style={st.date}>{r.times.join(" · ")}</Text>
            {r.note ? <Text style={st.muted}>{r.note}</Text> : null}
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: r.active }}
            accessibilityLabel={r.name}
            onPress={() => void vault.update((p) => ({ ...p, reminders: p.reminders.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)) }))}
            style={[st.round, { backgroundColor: r.active ? C.primary : C.lavender }]}
          >
            <Ionicons name={r.active ? "notifications" : "notifications-off"} size={20} color={r.active ? "#FFFFFF" : C.muted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${r.name}`}
            onPress={() => void vault.update((p) => ({ ...p, reminders: p.reminders.filter((x) => x.id !== r.id) }))}
            style={[st.round, { backgroundColor: C.lavender }]}
          >
            <Ionicons name="trash" size={20} color={C.muted} />
          </Pressable>
        </Card>
      ))}
      <Card>
        <H2>Nuevo recordatorio</H2>
        <Field label="Medicamento o método" placeholder="Ej. pastilla anticonceptiva, PrEP" value={name} onChangeText={setName} />
        <Field label="Horas (separadas por coma)" placeholder="08:00, 20:00" value={times} onChangeText={setTimes} keyboardType="numbers-and-punctuation" />
        <Field label="Indicación de tu receta" placeholder="Tal como la escribió tu médico" value={note} onChangeText={setNote} />
        {error ? <Text style={st.error}>{error}</Text> : null}
        <Button
          label="Agregar recordatorio"
          onPress={async () => {
            const list = times.split(",").map((t) => t.trim()).filter(Boolean);
            if (!name.trim() || !list.length || !list.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) return setError("Escribe horas como 08:00 o 20:30.");
            setError("");
            const ok = await ensurePermission();
            setAllowed(ok);
            await vault.update((p) => ({ ...p, reminders: [...p.reminders, { id: newId(), name: name.trim(), times: list, note: note.trim(), active: true }] }));
            setName(""); setTimes(""); setNote("");
          }}
        />
        <Text style={st.muted}>
          {allowed === false
            ? "Activa las notificaciones de Chía en los ajustes del teléfono para recibir avisos."
            : "Los avisos llegan aunque la app esté cerrada. Por privacidad, no dicen el nombre del medicamento."}
        </Text>
      </Card>
    </View>
  );
}

function Record({ profile }: { profile: Profile }) {
  const vault = useVault();
  const [p, setP] = useState(profile);
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setP((x) => ({ ...x, [k]: v })); setSaved(false); };

  return (
    <View style={{ gap: 12 }}>
      <Card>
        <H2>Ficha médica</H2>
        <Text style={st.label}>Tipo de sangre</Text>
        <View style={st.chips}>
          {BLOOD_TYPES.map((b) => (
            <Pressable key={b} accessibilityRole="radio" accessibilityState={{ checked: p.bloodType === b }} onPress={() => set("bloodType", b as BloodType)} style={[st.chip, p.bloodType === b && st.chipOn]}>
              <Text style={[st.chipText, p.bloodType === b && { color: "#FFFFFF" }]}>{b === "unknown" ? "No lo sé" : b}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Alergias" placeholder="Ej. penicilina, látex" value={p.allergies} onChangeText={(v) => set("allergies", v)} />
        <Field label="Medicamentos que tomas" placeholder="Nombre y para qué" value={p.medications} onChangeText={(v) => set("medications", v)} multiline />
        <Field label="Condiciones de salud" placeholder="Ej. asma, diabetes" value={p.conditions} onChangeText={(v) => set("conditions", v)} />
        <Text style={st.muted}>En el chat, el interruptor "Usar mi ficha" comparte solo alergias, condiciones y medicamentos para revisar opciones de venta libre. Está apagado por defecto.</Text>
      </Card>

      <Vaccines profile={profile} />

      <Card>
        <H2>Diario de síntomas</H2>
        <Field label="¿Qué sentiste hoy?" value={entry} onChangeText={setEntry} />
        <Button
          variant="secondary"
          label="Agregar al diario"
          onPress={() => {
            if (!entry.trim()) return;
            set("symptoms", [{ date: new Date().toISOString().slice(0, 10), text: entry.trim() }, ...p.symptoms]);
            setEntry("");
          }}
        />
        {p.symptoms.map((s, i) => (
          <View key={`${s.date}-${i}`} style={st.entry}>
            <Text style={st.date}>{new Date(`${s.date}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</Text>
            <Text style={st.entryText}>{s.text}</Text>
          </View>
        ))}
      </Card>

      <Button
        label="Guardar ficha"
        onPress={async () => {
          await vault.update((cur) => ({ ...cur, bloodType: p.bloodType, allergies: p.allergies, medications: p.medications, conditions: p.conditions, symptoms: p.symptoms }));
          setSaved(true);
        }}
      />
      {saved && <Text style={st.ok}>Guardado y cifrado.</Text>}
      <Button
        variant="danger"
        label="Borrar mi espacio"
        onPress={() =>
          Alert.alert("Borrar mi espacio", "¿Borrar todos tus datos de este teléfono? No se puede deshacer.", [
            { text: "Cancelar", style: "cancel" },
            { text: "Borrar", style: "destructive", onPress: () => void vault.remove() },
          ])
        }
      />
    </View>
  );
}

function Vaccines({ profile }: { profile: Profile }) {
  const vault = useVault();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Vaccine["status"]>("applied");
  const [date, setDate] = useState("");
  const [dose, setDose] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const missing = COMMON_VACCINES.filter((n) => !profile.vaccines.some((v) => v.name === n));
  const add = (v: Omit<Vaccine, "id">) => vault.update((p) => ({ ...p, vaccines: [...p.vaccines, { ...v, id: newId() }] }));

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="shield-checkmark" size={22} color={C.primary} />
        <H2>Cartilla de vacunación</H2>
      </View>
      <P muted>Registra las vacunas que ya tienes y las que te faltan. Un centro de salud puede decirte cuáles te corresponden.</P>
      {profile.vaccines.map((v) => (
        <View key={v.id} style={[st.entry, { flexDirection: "row", alignItems: "center" }]}>
          <View style={{ flex: 1 }}>
            <Text style={st.entryText}>{v.name}{v.dose ? ` · ${v.dose}` : ""}</Text>
            <Text style={[st.date, { color: v.status === "applied" ? C.leaf : C.primary }]}>{v.status === "applied" ? `Aplicada${v.date ? ` · ${v.date}` : ""}` : "Pendiente"}</Text>
          </View>
          {v.status === "pending" && (
            <Pressable accessibilityLabel={`Marcar ${v.name} como aplicada`} onPress={() => void vault.update((p) => ({ ...p, vaccines: p.vaccines.map((x) => (x.id === v.id ? { ...x, status: "applied", date: x.date || today } : x)) }))} style={[st.round, { backgroundColor: C.lavender }]}>
              <Ionicons name="checkmark" size={20} color={C.primaryDark} />
            </Pressable>
          )}
          <Pressable accessibilityLabel={`Eliminar ${v.name}`} onPress={() => void vault.update((p) => ({ ...p, vaccines: p.vaccines.filter((x) => x.id !== v.id) }))} style={[st.round, { backgroundColor: C.lavender }]}>
            <Ionicons name="trash" size={18} color={C.muted} />
          </Pressable>
        </View>
      ))}
      {missing.length > 0 && (
        <>
          <Text style={st.label}>Agregar rápido (pendiente):</Text>
          <View style={st.chips}>
            {missing.map((n) => (
              <Pressable key={n} onPress={() => void add({ name: n, status: "pending", date: "", dose: "" })} style={st.chip}>
                <Text style={st.chipText}>+ {n}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      <Field label="Otra vacuna" value={name} onChangeText={setName} />
      <View style={st.chips}>
        {(["applied", "pending"] as const).map((s) => (
          <Pressable key={s} accessibilityRole="radio" accessibilityState={{ checked: status === s }} onPress={() => setStatus(s)} style={[st.chip, status === s && st.chipOn]}>
            <Text style={[st.chipText, status === s && { color: "#FFFFFF" }]}>{s === "applied" ? "Aplicada" : "Pendiente"}</Text>
          </Pressable>
        ))}
      </View>
      {status === "applied" && <Field label="Fecha (AAAA-MM-DD)" placeholder={today} value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />}
      <Field label="Dosis (opcional)" placeholder="Ej. 1.ª dosis, refuerzo" value={dose} onChangeText={setDose} />
      <Button
        variant="secondary"
        label="Agregar vacuna"
        onPress={async () => {
          if (!name.trim()) return;
          const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
          await add({ name: name.trim(), status, date: status === "applied" ? d : "", dose: dose.trim() });
          setName(""); setDate(""); setDose("");
        }}
      />
    </Card>
  );
}

const SPECS = ["Medicina general", "Ginecología", "Salud sexual e ITS", "Urología", "Psicología"];

function Tele({ profile }: { profile: Profile }) {
  const vault = useVault();
  const [spec, setSpec] = useState(SPECS[0] ?? "Medicina general");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <Card style={{ backgroundColor: C.leafBg, borderColor: C.leafBg }}>
        <H2>Habla con un especialista</H2>
        <P>Estamos sumando médicas y médicos aliados. Deja tu solicitud y te avisaremos aquí cuando la consulta esté disponible.</P>
      </Card>
      <Card>
        <Text style={st.label}>Especialidad</Text>
        <View style={st.chips}>
          {SPECS.map((x) => (
            <Pressable key={x} onPress={() => setSpec(x)} style={[st.chip, spec === x && st.chipOn]}>
              <Text style={[st.chipText, spec === x && { color: "#FFFFFF" }]}>{x}</Text>
            </Pressable>
          ))}
        </View>
        <Field label="Motivo (opcional)" value={reason} onChangeText={setReason} multiline />
        <P muted>Tu ficha y tus síntomas solo se compartirán con tu permiso, al momento de la consulta.</P>
        <Button
          label="Solicitar consulta"
          onPress={async () => {
            await vault.update((p) => ({ ...p, teleRequests: [{ id: newId(), date: new Date().toISOString(), specialty: spec, reason: reason.trim(), status: "pending" }, ...p.teleRequests] }));
            setReason(""); setSent(true);
          }}
        />
        {sent && <Text style={st.ok}>Solicitud registrada.</Text>}
      </Card>
      {profile.teleRequests.map((r) => (
        <Card key={r.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={st.itemTitle}>{r.specialty}</Text>
            <Text style={st.date}>{new Date(r.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</Text>
          </View>
          <Text style={st.pending}>Pendiente</Text>
        </Card>
      ))}
      <Text style={st.urgent}>Si es urgente, no esperes: llama a tu número de emergencias o acude a urgencias.</Text>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  dose: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.primary, borderRadius: R.lg, padding: 16 },
  doseIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  doseLabel: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  doseValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  date: { fontSize: 13, fontWeight: "700", color: C.primary },
  itemTitle: { fontSize: 16, fontWeight: "800", color: C.ink },
  turn: { fontSize: 14, lineHeight: 20, color: C.ink, padding: 10, borderRadius: R.md, overflow: "hidden" },
  rule: { fontSize: 14, lineHeight: 19, color: C.ink, backgroundColor: C.lavender, padding: 12, borderRadius: R.md },
  muted: { fontSize: 14, lineHeight: 19, color: C.muted },
  error: { fontSize: 14, fontWeight: "700", color: C.danger },
  ok: { fontSize: 14, fontWeight: "700", color: C.leaf, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "600", color: C.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, borderRadius: R.pill, backgroundColor: C.lavender },
  chipOn: { backgroundColor: C.primary },
  chipText: { fontSize: 14, fontWeight: "700", color: C.primaryDark },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  entry: { backgroundColor: C.bg, borderRadius: R.md, padding: 12, gap: 2 },
  entryText: { fontSize: 15, color: C.ink, fontWeight: "600" },
  pending: { fontSize: 13, fontWeight: "800", color: C.primaryDark, backgroundColor: C.lavender, paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.pill, overflow: "hidden" },
  urgent: { fontSize: 14, fontWeight: "700", color: C.ink },
  privacy: { fontSize: 12, lineHeight: 17, color: C.muted, textAlign: "center" },
  disclaimer: { fontSize: 13, lineHeight: 18, color: C.muted, textAlign: "center" },
});
