import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Logo from "../components/logo";
import { KATALOG, Servis, TAHMINI_FIYAT_NOTU } from "../lib/katalog";
import { R, golge } from "../lib/tema";
import { para, useSubs } from "../lib/store";

export default function Ekle() {
  const { ekle } = useSubs();
  const params = useLocalSearchParams<{ servis?: string; plan?: string }>();
  const [arama, setArama] = useState("");
  const [secili, setSecili] = useState<Servis | null>(null);
  const [planNo, setPlanNo] = useState<number | null>(0);
  const [ozelPlan, setOzelPlan] = useState(false);
  const [ozelAd, setOzelAd] = useState("");
  const [ozelFiyat, setOzelFiyat] = useState("");
  const [gun, setGun] = useState("1");
  const [kalanAy, setKalanAy] = useState("12");

  const liste = KATALOG.filter((k) => k.ad.toLowerCase().includes(arama.toLowerCase()));

  useEffect(() => {
    if (!params.servis) return;
    const servis = KATALOG.find((item) => item.id === params.servis);
    if (!servis) return;
    const planParam = Number(params.plan);
    const seciliPlanNo = Number.isInteger(planParam) && planParam >= 0 && planParam < servis.planlar.length
      ? planParam
      : 0;
    const seciliPlan = servis.planlar[seciliPlanNo];
    setSecili(servis);
    setPlanNo(seciliPlanNo);
    setOzelPlan(seciliPlan.fiyat === undefined);
    setOzelAd(seciliPlan.fiyat === undefined ? seciliPlan.ad : "");
    setOzelFiyat("");
  }, [params.servis, params.plan]);

  function kaydet() {
    if (!secili) return;
    const g = parseInt(gun, 10);
    if (isNaN(g) || g < 1 || g > 31) {
      Alert.alert("Geçersiz gün", "Ödeme gününü 1 ile 31 arasında gir.");
      return;
    }
    const ay = Number(kalanAy);
    if (!Number.isInteger(ay) || ay < 1 || ay > 999) {
      Alert.alert("Geçersiz süre", "Kalan ay sayısını 1 ile 999 arasında gir.");
      return;
    }
    let plan = "";
    let tutar = 0;
    if (ozelPlan) {
      tutar = parseFloat(ozelFiyat.replace(",", "."));
      plan = ozelAd.trim() || "Özel plan";
      if (!Number.isFinite(tutar) || tutar < 0) {
        Alert.alert("Geçersiz fiyat", "Aylık fiyatı sıfır veya daha büyük bir sayı olarak gir.");
        return;
      }
    } else if (planNo !== null) {
      const seciliPlan = secili.planlar[planNo];
      if (seciliPlan.fiyat === undefined) {
        Alert.alert("Fiyat gerekli", "Bu planın aylık fiyatını gir.");
        return;
      }
      plan = seciliPlan.ad;
      tutar = seciliPlan.fiyat;
    } else {
      Alert.alert("Plan gerekli", "Lütfen bir plan seç.");
      return;
    }
    ekle({ ad: secili.ad, plan, tutar, kalanAy: ay, renk: secili.renk, kategori: secili.kategori, odemeGunu: g });
    router.replace("/");
  }

  return (
    <SafeAreaView style={s.kap}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={s.ust}>
          <Pressable onPress={() => (secili ? setSecili(null) : router.back())} hitSlop={12}>
            <Ionicons name={secili ? "chevron-back" : "close"} size={28} color={R.yazi} />
          </Pressable>
          <Text style={s.baslik}>{secili ? secili.ad : "Abonelik ekle"}</Text>
          <View style={{ width: 28 }} />
        </View>

        {!secili ? (
          <View style={{ flex: 1, padding: 20 }}>
            <View style={s.arama}>
              <Ionicons name="search" size={18} color={R.soluk} />
              <TextInput style={{ flex: 1, marginLeft: 8 }} placeholder="Uygulama ara" value={arama} onChangeText={setArama} />
            </View>
            <FlatList
              data={liste}
              numColumns={3}
              keyExtractor={(k) => k.id}
              columnWrapperStyle={{ gap: 12 }}
              contentContainerStyle={{ gap: 12, paddingTop: 16 }}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [s.hucre, pressed && { transform: [{ scale: 0.95 }] }]}
                  onPress={() => {
                    const ilkPlan = item.planlar[0];
                    setSecili(item);
                    setPlanNo(0);
                    setOzelPlan(ilkPlan.fiyat === undefined);
                    setOzelAd(ilkPlan.fiyat === undefined ? ilkPlan.ad : "");
                    setOzelFiyat("");
                  }}
                >
                  <Logo ad={item.ad} renk={item.renk} boyut={56} />
                  <Text style={s.hucreAd} numberOfLines={1}>{item.ad}</Text>
                </Pressable>
              )}
              ListFooterComponent={
                <Text style={s.not}>Aradığın yoksa "Kendi Ekle" sekmesinden kendin ekleyebilirsin.</Text>
              }
            />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Logo ad={secili.ad} renk={secili.renk} boyut={80} />
            </View>

            <Text style={s.etiket}>Plan seç</Text>
            {secili.planlar.map((p, i) => {
              const aktif = planNo === i;
              return (
                <Pressable
                  key={p.ad}
                  onPress={() => {
                    setPlanNo(i);
                    setOzelPlan(p.fiyat === undefined);
                    setOzelAd(p.fiyat === undefined ? p.ad : "");
                    setOzelFiyat("");
                  }}
                  style={[s.plan, aktif && s.planAktif]}
                >
                  <Text style={s.planAd}>{p.ad}</Text>
                  <View style={{ alignItems: "flex-end", flexShrink: 1, marginLeft: 8 }}>
                    <Text style={s.planFiyat}>
                      {p.fiyat === undefined ? p.fiyatNotu : `${para(p.fiyat)} / ay`}
                    </Text>
                    {p.tahmini && <Text style={s.tahmini}>Tahmini</Text>}
                  </View>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => { setPlanNo(null); setOzelPlan(true); setOzelAd(""); setOzelFiyat(""); }}
              style={[s.plan, ozelPlan && planNo === null && s.planAktif]}
            >
              <Text style={s.planAd}>+ Kendi planım</Text>
            </Pressable>

            {planNo !== null && secili.planlar[planNo].tahmini && (
              <Text style={s.tahminNotu}>{TAHMINI_FIYAT_NOTU}</Text>
            )}

            {ozelPlan && planNo !== null && secili.planlar[planNo].fiyat === undefined && (
              <Text style={{ color: R.soluk, fontSize: 13, marginBottom: 10 }}>
                Türkiye fiyatı hesap veya ödeme kanalına göre değişebilir. Ödediğin aylık tutarı gir.
              </Text>
            )}

            {ozelPlan && (
              <View>
                <TextInput style={s.input} placeholder="Plan adı (örn. Öğrenci)" value={ozelAd} onChangeText={setOzelAd} />
                <TextInput style={s.input} placeholder="Aylık fiyat (örn. 49.90)" keyboardType="numeric" value={ozelFiyat} onChangeText={setOzelFiyat} />
              </View>
            )}

            <Text style={s.etiket}>Her ayın kaçında ödeniyor?</Text>
            <TextInput style={s.input} keyboardType="numeric" value={gun} onChangeText={setGun} maxLength={2} />

            <Text style={s.etiket}>Aboneliğin bitmesine kaç ay kaldı? (12 ay ve üzeri de girebilirsin)</Text>
            <TextInput style={s.input} placeholder="Ay sayısı" keyboardType="numeric" value={kalanAy} onChangeText={setKalanAy} maxLength={3} />

            <Pressable style={({ pressed }) => [s.buton, pressed && { opacity: 0.85 }]} onPress={kaydet}>
              <Text style={s.butonYazi}>Aboneliği ekle</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.bg },
  ust: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 },
  baslik: { fontSize: 20, fontWeight: "800", color: R.yazi },
  arama: { flexDirection: "row", alignItems: "center", backgroundColor: R.kart, borderRadius: 14, paddingHorizontal: 14, height: 48, ...golge },
  hucre: { flex: 1, backgroundColor: R.kart, borderRadius: 20, paddingVertical: 16, alignItems: "center", ...golge },
  hucreAd: { marginTop: 8, fontWeight: "600", color: R.yazi, fontSize: 12, paddingHorizontal: 4 },
  not: { color: R.soluk, textAlign: "center", marginTop: 12, fontSize: 12 },
  etiket: { color: R.yazi, fontWeight: "700", fontSize: 16, marginTop: 18, marginBottom: 10 },
  plan: { flexDirection: "row", justifyContent: "space-between", backgroundColor: R.kart, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: "transparent", ...golge },
  planAktif: { borderColor: R.ana, backgroundColor: R.anaAcik },
  planAd: { fontWeight: "700", color: R.yazi },
  planFiyat: { color: R.soluk, fontWeight: "600" },
  tahmini: { color: R.soluk, fontSize: 11, marginTop: 2 },
  tahminNotu: { color: R.soluk, fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: R.kart, borderRadius: 14, padding: 14, marginBottom: 10, ...golge },
  buton: { backgroundColor: R.ana, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 20, ...golge },
  butonYazi: { color: "#fff", fontWeight: "800", fontSize: 16 },
});