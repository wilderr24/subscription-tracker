import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SubsProvider } from "../lib/store";

export default function RootLayout() {
  return (
    <SubsProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ekle" options={{ presentation: "modal" }} />
      </Stack>
    </SubsProvider>
  );
}