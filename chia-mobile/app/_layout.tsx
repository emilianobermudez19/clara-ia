import "../src/polyfills";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { VaultProvider } from "../src/vault";
import { LangProvider } from "../src/i18n";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <LangProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: "#FAF8F5" } }} />
        </LangProvider>
      </VaultProvider>
    </SafeAreaProvider>
  );
}
