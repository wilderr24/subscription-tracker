import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { abonelikBuAyda, para, useSubs, yillikTahmin } from "../../lib/store";
import { R, golge } from "../../lib/tema";

function ayIndeksi(tarih: Date) {
  return tarih.getFullYear() * 12 + tarih.getMonth();
}

function mevsimTemasi(ay: number) {
  if (ay === 11 || ay <= 1) {
    return { ad: "Kış", ikon: "snow" as const, arka: "#355C85", vurgu: "#8DBBE8" };
  }
  if (ay <= 4) {
    return { ad: "İlkbahar", ikon: "leaf" as const, arka: "#43815B", vurgu: "#8BC99A" };
  }
  if (ay <= 7) {
    return { ad: "Yaz", ikon: "sunny" as const, arka: "#C77B2D", vurgu: "#F3C66B" };
  }
  return { ad: "Sonbahar", ikon: "leaf" as const, arka: "#945339", vurgu: "#D99A70" };
}

export default function Harcamalar() {
  const { liste, tumKayitlar } = useSubs();
  const [seciliAy, setSeciliAy] = useState(() => {
    const simdi = new Date();
    return new Date(simdi.getFullYear(), simdi.getMonth(), 1);
  });
  const simdi = new Date();
  const buAy = new Date(simdi.getFullYear(), simdi.getMonth(), 1);
  const seciliAyIndeksi = ayIndeksi(seciliAy);
  const buAyIndeksi = ayIndeksi(buAy);
  const gelecekAy = seciliAyIndeksi > buAyIndeksi;
  const buAyinAbonelikleri = tumKayitlar.filter((abonelik) => abonelikBuAyda(abonelik, seciliAy));
  const toplam = buAyinAbonelikleri.reduce((tutar, abonelik) => tutar + abonelik.tutar, 0);
  const gruplar: Record<string, number> = {};
  buAyinAbonelikleri.forEach((abonelik) => {
    gruplar[abonelik.kategori] = (gruplar[abonelik.kategori] || 0) + abonelik.tutar;
  });
  const sirali = Object.entries(gruplar).sort((a, b) => b[1] - a[1]);
  const ayAdi = seciliAy.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const tema = mevsimTemasi(seciliAy.getMonth());

  function ayDegistir(fark: number) {
    setSeciliAy((ay) => new Date(ay.getFullYear(), ay.getMonth() + fark, 1));
  }

  return (
    <SafeAreaView style={s.kap} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={s.baslik}>Aylık Giderler</Text>

        <View style={s.ayNavigasyon}>
          <Pressable
            onPress={() => ayDegistir(-1)}
            accessibilityRole="button"
            accessibilityLabel="Önceki ay"
            style={s.ok}
          >
            <Ionicons name="chevron-back" size={22} color={R.ana} />
          </Pressable>
          <View style={s.ayBilgisi}>
            <Text style={s.ayAdi}>{ayAdi}</Text>
            <Text style={s.mevsim}>{tema.ad}</Text>
          </View>
          <Pressable
            onPress={() => ayDegistir(1)}
            accessibilityRole="button"
            accessibilityLabel="Sonraki ay"
            style={s.ok}
          >
            <Ionicons name="chevron-forward" size={22} color={R.ana} />
          </Pressable>
        </View>
        {seciliAyIndeksi !== buAyIndeksi && (
          <Pressable onPress={() => setSeciliAy(buAy)} style={s.buAyaDon}>
            <Text style={s.buAyaDonYazi}>Bu aya dön</Text>
          </Pressable>
        )}

        <View style={[s.ozet, { backgroundColor: tema.arka }]}>
          <View style={s.ozetUst}>
            <Ionicons name={tema.ikon} size={26} color="#fff" />
            <Text style={s.ozetBaslik}>
              {gelecekAy ? "Tahmini aylık gider" : seciliAyIndeksi === buAyIndeksi ? "Bu ay toplam" : "Aylık gider"}
            </Text>
          </View>
          <Text style={s.tutar}>{para(toplam)}</Text>
          {gelecekAy ? (
            <Text style={s.ozetNot}>Tahmini fiyattır, kesin ödeme tutarı değildir.</Text>
          ) : seciliAyIndeksi === buAyIndeksi ? (
            <Text style={s.ozetNot}>Yıllık tahmin: {para(yillikTahmin(liste))}</Text>
          ) : (
            <Text style={s.ozetNot}>Bu ay için kaydedilmiş abonelik giderleri.</Text>
          )}
        </View>

        <Text style={s.bolum}>Kategoriye göre</Text>
        {sirali.length === 0 && (
          <View style={s.bos}>
            <Text style={s.bosYazi}>Bu ay kayıtlı abonelik gideri yok.</Text>
            <Text style={s.bosTutar}>{para(0)}</Text>
          </View>
        )}
        {sirali.map(([kat, tutar]) => {
          const oran = toplam ? tutar / toplam : 0;
          return (
            <View key={kat} style={[s.kart, { borderLeftColor: tema.vurgu }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={s.kat}>{kat}</Text>
                <Text style={s.kat}>{para(tutar)}</Text>
              </View>
              <View style={s.cubuk}>
                <View style={[s.dolu, { width: `${Math.round(oran * 100)}%`, backgroundColor: tema.arka }]} />
              </View>
              <Text style={{ color: R.soluk, fontSize: 12 }}>%{Math.round(oran * 100)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.bg },
  baslik: { fontSize: 28, fontWeight: "800", color: R.yazi },
  ayNavigasyon: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 18 },
  ok: { width: 44, height: 44, borderRadius: 22, backgroundColor: R.kart, alignItems: "center", justifyContent: "center", ...golge },
  ayBilgisi: { flex: 1, alignItems: "center" },
  ayAdi: { color: R.yazi, fontSize: 18, fontWeight: "800", textTransform: "capitalize" },
  mevsim: { color: R.soluk, fontSize: 12, marginTop: 2 },
  buAyaDon: { alignSelf: "center", marginTop: -8, marginBottom: 14, padding: 6 },
  buAyaDonYazi: { color: R.ana, fontSize: 13, fontWeight: "700" },
  ozet: { borderRadius: 24, padding: 22, ...golge },
  ozetUst: { flexDirection: "row", alignItems: "center", gap: 10 },
  ozetBaslik: { color: "#fff", fontSize: 14, fontWeight: "700" },
  tutar: { color: "#fff", fontSize: 36, fontWeight: "800", marginVertical: 8 },
  ozetNot: { color: "#F1F1F1", fontSize: 12 },
  bolum: { fontSize: 18, fontWeight: "700", color: R.yazi, marginTop: 24, marginBottom: 12 },
  bos: { backgroundColor: R.kart, borderRadius: 18, padding: 18, alignItems: "center", ...golge },
  bosYazi: { color: R.soluk, textAlign: "center" },
  bosTutar: { color: R.yazi, fontSize: 18, fontWeight: "800", marginTop: 8 },
  kart: { backgroundColor: R.kart, borderRadius: 18, borderLeftWidth: 4, padding: 16, marginBottom: 12, ...golge },
  kat: { fontWeight: "700", color: R.yazi },
  cubuk: { height: 10, backgroundColor: R.anaAcik, borderRadius: 5, marginVertical: 8, overflow: "hidden" },
  dolu: { height: 10, borderRadius: 5 },
});
