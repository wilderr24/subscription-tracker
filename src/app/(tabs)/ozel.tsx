import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { KATEGORILER } from "../../lib/katalog";
import { R, golge } from "../../lib/tema";
import { useSubs } from "../../lib/store";

export default function Ozel() {
  const { ekle } = useSubs();
  const [gorsel, setGorsel] = useState<string | undefined>();
  const [ad, setAd] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [gun, setGun] = useState("1");
  const [kalanAy, setKalanAy] = useState("12");
  const [kategori, setKategori] = useState("Diğer");

  async function fotoSec() {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      Alert.alert("İzin gerekli", "Fotoğraf seçmek için galeri izni vermelisin.");
      return;
    }
    const sonuc = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!sonuc.canceled) setGorsel(sonuc.assets[0].uri);
  }

  function kaydet() {
    const tutar = parseFloat(fiyat.replace(",", "."));
    const g = parseInt(gun, 10);
    const ay = Number(kalanAy);
    if (!ad.trim() || !Number.isFinite(tutar) || tutar < 0 || !Number.isInteger(g) || g < 1 || g > 31 ||
      !Number.isInteger(ay) || ay < 1 || ay > 999) {
      Alert.alert("Eksik bilgi", "İsim, fiyat, ödeme günü ve kalan ay sayısını doğru gir.");
      return;
    }
    ekle({ ad: ad.trim(), plan: "Özel", tutar, kalanAy: ay, renk: R.ana, kategori, odemeGunu: g, gorsel });
    setAd(""); setFiyat(""); setGun("1"); setKalanAy("12"); setGorsel(undefined); setKategori("Diğer");
    router.navigate("/");
  }

  return (
    <SafeAreaView style={s.kap} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={s.baslik}>Kendi Aboneliğim</Text>
          <Text style={s.alt}>Listede olmayan bir aboneliği kendin ekle.</Text>

          <Pressable onPress={fotoSec} style={s.foto}>
            {gorsel ? (
              <Image source={{ uri: gorsel }} style={s.fotoImg} />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="camera" size={32} color={R.ana} />
                <Text style={{ color: R.ana, fontWeight: "600", marginTop: 4 }}>Fotoğraf seç</Text>
              </View>
            )}
          </Pressable>

          <TextInput style={s.input} placeholder="Abonelik adı" value={ad} onChangeText={setAd} />
          <TextInput style={s.input} placeholder="Aylık fiyat (örn. 99.90)" keyboardType="numeric" value={fiyat} onChangeText={setFiyat} />
          <TextInput style={s.input} placeholder="Ödeme günü (1-31)" keyboardType="numeric" value={gun} onChangeText={setGun} maxLength={2} />
          <Text style={s.etiket}>Aboneliğin bitmesine kaç ay kaldı? (12 ay ve üzeri de girebilirsin)</Text>
          <TextInput style={s.input} placeholder="Ay sayısı" keyboardType="numeric" value={kalanAy} onChangeText={setKalanAy} maxLength={3} />

          <Text style={s.etiket}>Kategori</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {KATEGORILER.map((k) => (
              <Pressable key={k} onPress={() => setKategori(k)} style={[s.chip, kategori === k && s.chipAktif]}>
                <Text style={{ color: kategori === k ? "#fff" : R.yazi, fontWeight: "600" }}>{k}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={({ pressed }) => [s.buton, pressed && { opacity: 0.85 }]} onPress={kaydet}>
            <Text style={s.butonYazi}>Kaydet</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.bg },
  baslik: { fontSize: 28, fontWeight: "800", color: R.yazi },
  alt: { color: R.soluk, marginTop: 4, marginBottom: 18 },
  foto: { width: 110, height: 110, borderRadius: 30, backgroundColor: R.anaAcik, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 20, overflow: "hidden" },
  fotoImg: { width: 110, height: 110 },
  input: { backgroundColor: R.kart, borderRadius: 14, padding: 14, marginBottom: 10, ...golge },
  etiket: { fontWeight: "700", fontSize: 16, color: R.yazi, marginTop: 8, marginBottom: 10 },
  chip: { backgroundColor: R.kart, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, ...golge },
  chipAktif: { backgroundColor: R.ana },
  buton: { backgroundColor: R.ana, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 24, ...golge },
  butonYazi: { color: "#fff", fontWeight: "800", fontSize: 16 },
});