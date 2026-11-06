import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Splash } from "../../src/Splash";
import { useVault } from "../../src/vault";
import { C } from "../../src/theme";
import { WellbeingCheck } from "../../src/WellbeingCheck";
import { tr } from "../../src/i18n";

// Sin sesión ni Consulta Express: pantalla de acceso. Con cualquiera de las dos: pestañas.
export default function TabsLayout() {
  const vault = useVault();
  if (!vault.ready) return <View style={{ flex: 1, backgroundColor: C.primary }} />;
  if (!vault.profile && !vault.express) return <Splash />;

  return (
    <>
    <WellbeingCheck />
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        sceneStyle: { backgroundColor: C.bg },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: tr("Inicio"), tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: tr("Consulta"), tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} /> }} />
      <Tabs.Screen name="guias" options={{ title: tr("Guías"), tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} /> }} />
      <Tabs.Screen name="espacio" options={{ title: tr("Mi espacio"), tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} /> }} />
    </Tabs>
    </>
  );
}
