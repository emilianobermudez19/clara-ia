import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVault } from "./vault";
import { LogoMark } from "./Logo";
import { Button, Field } from "./ui";
import { LangToggle } from "./LangToggle";
import { C, R } from "./theme";
import { tr } from "./i18n";

// Entrada tipo app nativa: logo, PIN de 6 dígitos (entra solo al completarse) o crear cuenta,
// y la Consulta Express anónima siempre visible abajo.
export function Splash() {
  const vault = useVault();
  const { height } = useWindowDimensions();
  const [mode, setMode] = useState<"unlock" | "create">(vault.exists ? "unlock" : "create");
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => setMode(vault.exists ? "unlock" : "create"), [vault.exists]);
  useEffect(() => {
    const a = Keyboard.addListener("keyboardDidShow", () => setKeyboard(true));
    const b = Keyboard.addListener("keyboardDidHide", () => setKeyboard(false));
    return () => { a.remove(); b.remove(); };
  }, []);
  // En pantallas bajas, o con el teclado abierto, la marca se compacta para que todo quepa sin scroll.
  const compact = keyboard || height < 740 || mode === "create";

  return (
    <View style={st.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={st.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "flex-end" }}><LangToggle light /></View>
          <View style={[st.brand, compact && st.brandCompact]}>
            <View style={[st.logoBox, compact && st.logoBoxCompact]}><LogoMark size={compact ? 40 : 58} color="#FFFFFF" /></View>
            <Text style={[st.name, compact && { fontSize: 30 }]} accessibilityRole="header">{tr("Chía")}</Text>
            {!keyboard && <Text style={st.tagline}>{tr("TU COMPAÑERA DE SALUD CONFIDENCIAL")}</Text>}
          </View>

          <View style={st.sheet}>
            {mode === "unlock" ? <PinUnlock /> : <CreateAccount />}
            {mode === "create" && vault.exists && (
              <Pressable onPress={() => setMode("unlock")} style={st.link}><Text style={st.linkText}>{tr("Ya tengo cuenta: entrar con PIN")}</Text></Pressable>
            )}
          </View>

          {!keyboard && (
            <View>
              <Button label={tr("⚡ Consulta Express Anónima")} variant="outlineLight" onPress={() => vault.setExpress(true)} style={{ marginTop: 16, minHeight: 56 }} />
              <Text style={st.expressSub}>{tr("Sin registro. La conversación se borra al salir.")}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function PinUnlock() {
  const vault = useVault();
  const input = useRef<TextInput>(null);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fails, setFails] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (waitUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [waitUntil]);
  const wait = Math.max(0, Math.ceil((waitUntil - now) / 1000));

  const tryUnlock = async (value: string) => {
    if (busy || wait > 0) return;
    setBusy(true);
    setError("");
    try {
      await vault.unlock(value);
    } catch {
      const n = fails + 1;
      setFails(n);
      setPin("");
      if (n % 5 === 0) { setWaitUntil(Date.now() + 30_000 * (n / 5)); setNow(Date.now()); }
      setError(tr("PIN incorrecto."));
      setTimeout(() => input.current?.focus(), 50);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={st.sheetTitle}>{tr("Entra con tu PIN")}</Text>
      <Pressable onPress={() => input.current?.focus()} accessibilityLabel={tr("PIN de 6 dígitos")} style={st.pinRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={[st.pinBox, i < pin.length && st.pinFilled, i === pin.length && !busy && st.pinActive]}>
            <Text style={st.pinDot}>{i < pin.length ? "•" : ""}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={input}
        value={pin}
        onChangeText={(t) => {
          const v = t.replace(/\D/g, "").slice(0, 6);
          setPin(v);
          if (v.length === 6) void tryUnlock(v);
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        secureTextEntry
        editable={!busy && wait === 0}
        style={st.hiddenInput}
        accessibilityLabel={tr("PIN")}
      />
      <View style={st.status}>
        {busy ? <ActivityIndicator color={C.primary} /> : error ? <Text style={st.error}>{wait > 0 ? tr("Demasiados intentos. Espera {s} s.").replace("{s}", String(wait)) : error}</Text> : null}
      </View>
    </View>
  );
}

function CreateAccount() {
  const vault = useVault();
  const [alias, setAlias] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const digits = (t: string) => t.replace(/\D/g, "").slice(0, 6);

  return (
    <View style={{ gap: 10 }}>
      <Text style={st.sheetTitle}>{tr("Crea tu cuenta")}</Text>
      <Text style={st.muted}>{tr("Se cifra en este teléfono. Ni nosotros podemos leerla.")}</Text>
      <Field label={tr("Nombre o apodo")} value={alias} onChangeText={setAlias} autoCapitalize="words" />
      <Field label={tr("PIN de 6 dígitos")} value={p1} onChangeText={(t) => setP1(digits(t))} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Field label={tr("Repite el PIN")} value={p2} onChangeText={(t) => setP2(digits(t))} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Text style={st.warn}>{tr("Si olvidas el PIN no se pueden recuperar tus datos.")}</Text>
      {error ? <Text style={st.error}>{error}</Text> : null}
      <Button
        label={busy ? tr("Protegiendo…") : tr("Crear mi espacio")}
        disabled={busy}
        onPress={async () => {
          if (!alias.trim()) return setError(tr("Escribe un nombre o apodo."));
          if (!/^\d{6}$/.test(p1)) return setError(tr("El PIN debe tener 6 números."));
          if (p1 !== p2) return setError(tr("Los PIN no coinciden."));
          setBusy(true); setError("");
          try { await vault.create(alias.trim(), p1); } catch { setError(tr("No se pudo crear la cuenta. Intenta de nuevo.")); } finally { setBusy(false); }
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.primary },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 12, justifyContent: "space-between" },
  brand: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, minHeight: 200 },
  brandCompact: { flexGrow: 0, minHeight: 0, paddingVertical: 8, gap: 4 },
  logoBox: { width: 96, height: 96, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  logoBoxCompact: { width: 64, height: 64, borderRadius: 20 },
  name: { fontSize: 40, fontWeight: "800", color: C.onPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.88)", letterSpacing: 1.4 },
  sheet: { backgroundColor: C.card, borderRadius: R.xl, padding: 18 },
  sheetTitle: { fontSize: 21, fontWeight: "800", color: C.ink, textAlign: "center" },
  muted: { fontSize: 15, lineHeight: 21, color: C.muted },
  warn: { fontSize: 14, lineHeight: 19, color: C.ink, backgroundColor: C.lavender, padding: 12, borderRadius: R.md },
  pinRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
  pinBox: { width: 44, height: 56, borderRadius: 16, borderWidth: 2, borderColor: C.lavenderMid, alignItems: "center", justifyContent: "center" },
  pinFilled: { borderColor: C.primary, backgroundColor: C.lavender },
  pinActive: { borderColor: C.primary },
  pinDot: { fontSize: 26, color: C.primaryDark },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
  status: { minHeight: 24, alignItems: "center", justifyContent: "center" },
  error: { fontSize: 14, fontWeight: "700", color: C.danger, textAlign: "center" },
  link: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 8 },
  linkText: { fontSize: 14, fontWeight: "700", color: C.primary },
  expressSub: { marginTop: 8, textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.88)" },
});
