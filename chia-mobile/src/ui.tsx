import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { C, MIN_TOUCH, R } from "./theme";

export function Button({ label, onPress, variant = "primary", disabled, icon, style }: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outlineLight" | "danger";
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, v.box, (pressed || disabled) && { opacity: disabled ? 0.5 : 0.85 }, style]}
    >
      {icon}
      <Text style={[s.btnText, v.text]}>{label}</Text>
    </Pressable>
  );
}

const variants = {
  primary: { box: { backgroundColor: C.primary }, text: { color: C.onPrimary } },
  secondary: { box: { backgroundColor: C.lavender }, text: { color: C.primaryDark } },
  outlineLight: { box: { borderWidth: 2, borderColor: "rgba(255,255,255,0.75)" }, text: { color: C.onPrimary } },
  danger: { box: { backgroundColor: "transparent" }, text: { color: C.danger } },
} as const;

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Field({ label, hint, ...input }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={C.muted} style={[s.input, input.multiline && { minHeight: 76, textAlignVertical: "top" }]} {...input} />
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={s.seg} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.key)} style={[s.segItem, on && s.segOn]}>
            <Text style={[s.segText, on && { color: C.primary }]} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const H1 = ({ children }: { children: ReactNode }) => <Text style={s.h1}>{children}</Text>;
export const H2 = ({ children }: { children: ReactNode }) => <Text style={s.h2}>{children}</Text>;
export const P = ({ children, muted }: { children: ReactNode; muted?: boolean }) => <Text style={[s.p, muted && { color: C.muted }]}>{children}</Text>;

export const s = StyleSheet.create({
  btn: { minHeight: MIN_TOUCH, borderRadius: R.pill, paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { fontSize: 16, fontWeight: "700" },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 },
  label: { fontSize: 14, fontWeight: "600", color: C.ink },
  hint: { fontSize: 13, color: C.muted },
  input: { minHeight: 50, borderRadius: R.md, borderWidth: 1.5, borderColor: C.lavenderMid, backgroundColor: C.card, paddingHorizontal: 16, paddingVertical: 12, fontSize: 17, color: C.ink },
  seg: { flexDirection: "row", backgroundColor: C.lavender, borderRadius: R.lg, padding: 4, gap: 4 },
  segItem: { flex: 1, minHeight: 44, borderRadius: R.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  segOn: { backgroundColor: C.card },
  segText: { fontSize: 13, fontWeight: "700", color: C.primaryDark },
  h1: { fontSize: 28, fontWeight: "800", color: C.ink, letterSpacing: -0.3 },
  h2: { fontSize: 19, fontWeight: "800", color: C.ink },
  p: { fontSize: 16, lineHeight: 23, color: C.ink },
});
