import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { R } from "../../lib/tema";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: R.ana,
        tabBarInactiveTintColor: R.soluk,
        tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
        tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 8, borderTopWidth: 0, elevation: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Aboneliklerim",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="wallet" size={size} color={focused ? R.ana : R.soluk} />
          ),
        }}
      />
      <Tabs.Screen
        name="guncel"
        options={{
          title: "Güncel",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="pricetags" size={size} color={focused ? R.ana : R.soluk} />
          ),
        }}
      />
      <Tabs.Screen
        name="harcamalar"
        options={{
          title: "Giderler",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="pie-chart" size={size} color={focused ? R.ana : R.soluk} />
          ),
        }}
      />
      <Tabs.Screen
        name="ozel"
        options={{
          title: "Kendi Ekle",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="create" size={size} color={focused ? R.ana : R.soluk} />
          ),
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="settings" size={size} color={focused ? R.ana : R.soluk} />
          ),
        }}
      />
    </Tabs>
  );
}