import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVault } from "./vault";
import { LogoMark } from "./Logo";
import { Button, Field } from "./ui";
import { C, R } from "./theme";

// Entrada tipo app nativa: logo, PIN de 6 dígitos (entra solo al completarse) o crear cuenta,
// y la Consulta Express anónima siempre visible abajo.
export function Splash() {
  const vault = useVault();
  const [mode, setMode] = useState<"unlock" | "create">(vault.exists ? "unlock" : "create");
  useEffect(() => setMode(vault.exists ? "unlock" : "create"), [vault.exists]);

  return (
    <SafeAreaView style={st.screen} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
          <View style={st.brand}>
            <View style={st.logoBox}><LogoMark size={58} color="#FFFFFF" /></View>
            <Text style={st.name} accessibilityRole="header">Chía</Text>
            <Text style={st.tagline}>TU COMPAÑERA DE SALUD CONFIDENCIAL</Text>
          </View>

          <View style={st.sheet}>
            {mode === "unlock" ? <PinUnlock /> : <CreateAccount />}
            {mode === "create" && vault.exists && (
              <Pressable onPress={() => setMode("unlock")} style={st.link}><Text style={st.linkText}>Ya tengo cuenta: entrar con PIN</Text></Pressable>
            )}
          </View>

          <Button label="⚡ Consulta Express Anónima" variant="outlineLight" onPress={() => vault.setExpress(true)} style={{ marginTop: 18, minHeight: 56 }} />
          <Text style={st.expressSub}>Sin registro. La conversación se borra al salir.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
      setError("PIN incorrecto.");
      setTimeout(() => input.current?.focus(), 50);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      <Text style={st.sheetTitle}>Entra con tu PIN</Text>
      <Pressable onPress={() => input.current?.focus()} accessibilityLabel="PIN de 6 dígitos" style={st.pinRow}>
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
        accessibilityLabel="PIN"
      />
      <View style={st.status}>
        {busy ? <ActivityIndicator color={C.primary} /> : error ? <Text style={st.error}>{wait > 0 ? `Demasiados intentos. Espera ${wait} s.` : error}</Text> : null}
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
    <View style={{ gap: 14 }}>
      <Text style={st.sheetTitle}>Crea tu cuenta</Text>
      <Text style={st.muted}>Tu ficha, recordatorios y consultas se cifran en este teléfono. Ni nosotros podemos leerlos.</Text>
      <Field label="Nombre o apodo" hint="No uses tu nombre real si no quieres." value={alias} onChangeText={setAlias} autoCapitalize="words" />
      <Field label="PIN de 6 dígitos" value={p1} onChangeText={(t) => setP1(digits(t))} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Field label="Repite el PIN" value={p2} onChangeText={(t) => setP2(digits(t))} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Text style={st.warn}>Si olvidas el PIN no hay forma de recuperar tus datos.</Text>
      {error ? <Text style={st.error}>{error}</Text> : null}
      <Button
        label={busy ? "Protegiendo…" : "Crear mi espacio"}
        disabled={busy}
        onPress={async () => {
          if (!alias.trim()) return setError("Escribe un nombre o apodo.");
          if (!/^\d{6}$/.test(p1)) return setError("El PIN debe tener 6 números.");
          if (p1 !== p2) return setError("Los PIN no coinciden.");
          setBusy(true); setError("");
          try { await vault.create(alias.trim(), p1); } catch { setError("No se pudo crear la cuenta. Intenta de nuevo."); } finally { setBusy(false); }
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.primary },
  scroll: { flexGrow: 1, padding: 20, justifyContent: "flex-end" },
  brand: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 28 },
  logoBox: { width: 96, height: 96, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 40, fontWeight: "800", color: C.onPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.88)", letterSpacing: 1.4 },
  sheet: { backgroundColor: C.card, borderRadius: R.xl, padding: 20 },
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
