import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Logo from "../../components/logo";
import { useKatalog } from "../../lib/fiyatlar";
import { R, golge } from "../../lib/tema";
import { para } from "../../lib/store";

function kaynagiAc(url?: string) {
  if (!url) return;
  Linking.openURL(url).catch((error) => {
    console.error("Abonelik sayfası açılamadı:", error);
    Alert.alert("Sayfa açılamadı", "Resmi abonelik sayfasına şu anda ulaşılamıyor.");
  });
}

export default function Guncel() {
  const { katalog, kontrolTarihi, not, kaynak, yukleniyor } = useKatalog();
  return (
    <SafeAreaView style={s.kap} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={s.baslik}>Güncel Abonelikler</Text>
        <Text style={s.alt}>
          Doğrulanabilen Türkiye fiyatları {kontrolTarihi} tarihinde kontrol edildi. {not} Fiyatı hesaba göre değişen servislerde kendi ödediğin tutarı gir.
        </Text>
        <Text style={s.alt}>{yukleniyor ? "Güncel fiyatlar kontrol ediliyor..." : kaynak === "internet" ? "Fiyatlar internetten güncellendi." : "İnternete ulaşılamadı, kayıtlı fiyatlar gösteriliyor."}</Text>
        {katalog.map((k) => (
          <View key={k.id} style={s.kart}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Logo ad={k.ad} renk={k.renk} boyut={44} />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.ad}>{k.ad}</Text>
                <Text style={s.kat}>{k.kategori}</Text>
              </View>
            </View>
            {k.planlar.map((p, index) => (
              <View key={p.ad} style={s.satir}>
                <Text style={s.planAd}>{p.ad}</Text>
                <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
                  <Text style={[s.fiyat, p.fiyat === undefined && { color: R.soluk }]}>
                    {p.fiyat === undefined ? p.fiyatNotu : para(p.fiyat)}
                  </Text>
                  {p.tahmini && <Text style={s.tahmini}>Tahmini</Text>}
                </View>
                <Pressable
                  onPress={() => router.push({ pathname: "/ekle", params: { servis: k.id, plan: String(index) } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${k.ad} ${p.ad} aboneliğini ekle`}
                  hitSlop={8}
                  style={s.ekle}
                >
                  <Ionicons name="add-circle" size={24} color={R.ana} />
                </Pressable>
              </View>
            ))}
              {k.kaynak && (
                <Pressable onPress={() => kaynagiAc(k.kaynak)} accessibilityRole="link">
                  <Text style={s.kaynak}>Resmi sayfayı aç ↗</Text>
                </Pressable>
              )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.bg },
  baslik: { fontSize: 28, fontWeight: "800", color: R.yazi },
  alt: { color: R.soluk, marginTop: 6, marginBottom: 18 },
  kart: { backgroundColor: R.kart, borderRadius: 20, padding: 16, marginBottom: 14, ...golge },
  ad: { fontSize: 17, fontWeight: "700", color: R.yazi },
  kat: { color: R.soluk, fontSize: 12 },
  satir: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F0F0F5" },
  planAd: { color: R.yazi, flex: 1, paddingRight: 8 },
  fiyat: { fontWeight: "700", color: R.ana },
  tahmini: { color: R.soluk, fontSize: 11, marginTop: 2 },
  ekle: { marginLeft: 12, padding: 2 },
  kaynak: { color: R.ana, fontSize: 13, fontWeight: "700", marginTop: 10 },
});