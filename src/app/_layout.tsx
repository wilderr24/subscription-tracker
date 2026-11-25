import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BildirimProvider } from "../lib/bildirim";
import { FiyatProvider } from "../lib/fiyatlar";
import { SubsProvider } from "../lib/store";

export default function RootLayout() {
  return (
    <SubsProvider>
      <FiyatProvider>
        <BildirimProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ekle" options={{ presentation: "modal" }} />
          </Stack>
        </BildirimProvider>
      </FiyatProvider>
    </SubsProvider>
  );
}
