import { AntDesign, FontAwesome5, Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Image, Text, View } from "react-native";

type MarkaIkonu =
  | { set: "material"; name: ComponentProps<typeof MaterialCommunityIcons>["name"] }
  | { set: "ant"; name: ComponentProps<typeof AntDesign>["name"] }
  | { set: "fontisto"; name: ComponentProps<typeof Fontisto>["name"] }
  | { set: "fa5brand"; name: ComponentProps<typeof FontAwesome5>["name"] };

const markaIkonlari: Record<string, MarkaIkonu> = {
  spotify: { set: "material", name: "spotify" },
  spotifypremium: { set: "material", name: "spotify" },
  netflix: { set: "material", name: "netflix" },
  netflixpremium: { set: "material", name: "netflix" },
  youtube: { set: "material", name: "youtube" },
  youtubepremium: { set: "material", name: "youtube" },
  youtubemusic: { set: "material", name: "youtube" },
  youtubemusicpremium: { set: "material", name: "youtube" },
  amazon: { set: "ant", name: "amazon" },
  amazonprime: { set: "ant", name: "amazon" },
  prime: { set: "ant", name: "amazon" },
  primevideo: { set: "ant", name: "amazon" },
  icloud: { set: "material", name: "apple-icloud" },
  icloudplus: { set: "material", name: "apple-icloud" },
  appleicloud: { set: "material", name: "apple-icloud" },
  chatgpt: { set: "ant", name: "open-ai" },
  chatgptplus: { set: "ant", name: "open-ai" },
  openai: { set: "ant", name: "open-ai" },
  discord: { set: "fontisto", name: "discord" },
  discordnitro: { set: "fontisto", name: "discord" },
  applemusic: { set: "fontisto", name: "applemusic" },
  playstation: { set: "fontisto", name: "playstation" },
  playstationplus: { set: "fontisto", name: "playstation" },
  xbox: { set: "fontisto", name: "xbox" },
  xboxgamepass: { set: "fontisto", name: "xbox" },
  twitch: { set: "fontisto", name: "twitch" },
  adobe: { set: "fontisto", name: "adobe" },
  adobecreativecloud: { set: "fontisto", name: "adobe" },
  dropbox: { set: "fontisto", name: "dropbox" },
  microsoft: { set: "fontisto", name: "microsoft" },
  microsoft365: { set: "fontisto", name: "microsoft" },
  appletv: { set: "material", name: "apple" },
  appletvplus: { set: "material", name: "apple" },
  googleone: { set: "material", name: "google" },
  deezer: { set: "fa5brand", name: "deezer" },
  strava: { set: "fa5brand", name: "strava" },
};

function adAnahtari(ad: string) {
  return ad.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function Logo({
  ad, renk, gorsel, boyut = 48,
}: { ad: string; renk: string; gorsel?: string; boyut?: number }) {
  const radius = boyut * 0.3;
  if (gorsel) {
    return <Image source={{ uri: gorsel }} style={{ width: boyut, height: boyut, borderRadius: radius }} />;
  }
  const markaIkonu = markaIkonlari[adAnahtari(ad)];
  if (markaIkonu) {
    return (
      <View style={{ width: boyut, height: boyut, borderRadius: radius, backgroundColor: renk, alignItems: "center", justifyContent: "center" }}>
        {markaIkonu.set === "material" ? (
          <MaterialCommunityIcons name={markaIkonu.name} size={boyut * 0.58} color="#fff" />
        ) : markaIkonu.set === "ant" ? (
          <AntDesign name={markaIkonu.name} size={boyut * 0.58} color="#fff" />
        ) : markaIkonu.set === "fontisto" ? (
          <Fontisto name={markaIkonu.name} size={boyut * 0.58} color="#fff" />
        ) : (
          <FontAwesome5 name={markaIkonu.name} size={boyut * 0.58} color="#fff" brand />
        )}
      </View>
    );
  }
  return (
    <View style={{ width: boyut, height: boyut, borderRadius: radius, backgroundColor: renk, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: boyut * 0.45 }}>
        {ad.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}