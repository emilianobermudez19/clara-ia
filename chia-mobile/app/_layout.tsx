import "../src/polyfills";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { VaultProvider } from "../src/vault";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </VaultProvider>
    </SafeAreaProvider>
  );
}
