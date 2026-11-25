import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBildirim } from "../../lib/bildirim";
import { useKatalog } from "../../lib/fiyatlar";
import { R, golge } from "../../lib/tema";

const GUN_SECENEKLERI = [
  { deger: 0, etiket: "Ödeme günü" },
  { deger: 1, etiket: "1 gün önce" },
  { deger: 2, etiket: "2 gün önce" },
  { deger: 3, etiket: "3 gün önce" },
  { deger: 7, etiket: "1 hafta önce" },
];

const KAYNAK_YAZISI = {
  internet: "İnternetten alındı",
  onbellek: "Telefondaki son kayıt kullanılıyor",
  uygulama: "Uygulamayla gelen fiyatlar kullanılıyor",
} as const;

export default function Ayarlar() {
  const { ayarlar, ayarlariDegistir, testGonder } = useBildirim();
  const { kaynak, kontrolTarihi, yukleniyor, yenile } = useKatalog();

  async function acKapat(acik: boolean) {
    const basarili = await ayarlariDegistir({ acik });
    if (!basarili) {
      Alert.alert(
        "Bildirim izni gerekli",
        "Hatırlatıcılar için bildirim iznini telefonun Ayarlar bölümünden açman gerekiyor.",
      );
    }
  }

  async function test() {
    const basarili = await testGonder();
    if (basarili) {
      Alert.alert("Test bildirimi yolda", "5 saniye içinde bildirim gelecek. Beklerken uygulamayı arka plana alabilirsin.");
    } else {
      Alert.alert("Bildirim izni gerekli", "Telefonun Ayarlar bölümünden bildirim iznini aç.");
    }
  }

  return (
    <SafeAreaView style={s.kap} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={s.baslik}>Ayarlar</Text>

        <Text style={s.bolum}>Hatırlatıcılar</Text>
        <View style={s.kart}>
          <View style={s.satir}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={s.ad}>Ödeme bildirimleri</Text>
              <Text style={s.soluk}>Sabah 09:00'da haber verir</Text>
            </View>
            <Switch
              value={ayarlar.acik}
              onValueChange={acKapat}
              trackColor={{ true: R.ana, false: "#D5D7E0" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {ayarlar.acik && (
          <>
            <Text style={s.bolum}>Ne zaman haber verilsin?</Text>
            <View style={s.chipler}>
              {GUN_SECENEKLERI.map((g) => {
                const aktif = ayarlar.gunOnce === g.deger;
                return (
                  <Pressable
                    key={g.deger}
                    onPress={() => ayarlariDegistir({ gunOnce: g.deger })}
                    style={[s.chip, aktif && s.chipAktif]}
                  >
                    <Text style={{ color: aktif ? "#fff" : R.yazi, fontWeight: "600" }}>{g.etiket}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={({ pressed }) => [s.ikincil, pressed && { opacity: 0.8 }]} onPress={test}>
              <Text style={s.ikincilYazi}>Test bildirimi gönder</Text>
            </Pressable>
          </>
        )}

        <Text style={s.bolum}>Fiyat listesi</Text>
        <View style={s.kart}>
          <Text style={s.ad}>{KAYNAK_YAZISI[kaynak]}</Text>
          <Text style={s.soluk}>Son kontrol: {kontrolTarihi}</Text>
          <Pressable
            style={({ pressed }) => [s.ikincil, { marginTop: 12 }, (pressed || yukleniyor) && { opacity: 0.6 }]}
            onPress={yenile}
            disabled={yukleniyor}
          >
            <Text style={s.ikincilYazi}>{yukleniyor ? "Kontrol ediliyor..." : "Fiyatları şimdi güncelle"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.bg },
  baslik: { fontSize: 28, fontWeight: "800", color: R.yazi },
  bolum: { fontSize: 18, fontWeight: "700", color: R.yazi, marginTop: 24, marginBottom: 12 },
  kart: { backgroundColor: R.kart, borderRadius: 18, padding: 16, ...golge },
  satir: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ad: { fontWeight: "700", color: R.yazi, fontSize: 16 },
  soluk: { color: R.soluk, marginTop: 2 },
  chipler: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: R.kart, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, ...golge },
  chipAktif: { backgroundColor: R.ana },
  ikincil: { backgroundColor: R.anaAcik, borderRadius: 14, padding: 14, alignItems: "center", marginTop: 14 },
  ikincilYazi: { color: R.ana, fontWeight: "700" },
});
