import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Splash } from "../../src/Splash";
import { useVault } from "../../src/vault";
import { C } from "../../src/theme";

// Sin sesión ni Consulta Express: pantalla de acceso. Con cualquiera de las dos: pestañas.
export default function TabsLayout() {
  const vault = useVault();
  if (!vault.ready) return <View style={{ flex: 1, backgroundColor: C.primary }} />;
  if (!vault.profile && !vault.express) return <Splash />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Consulta", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" color={color} size={size} /> }} />
      <Tabs.Screen name="espacio" options={{ title: "Mi espacio", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} /> }} />
    </Tabs>
  );
}
