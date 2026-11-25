import { useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Logo from "../../components/logo";
import { R, golge } from "../../lib/tema";
import { kalanEtiket, kalanGun, para, useSubs, yillikTahmin } from "../../lib/store";

export default function Aboneliklerim() {
  const { liste, sil, profilAdi, profilYuklendi, profilAdiKaydet } = useSubs();
  const [profilAcik, setProfilAcik] = useState(false);
  const [profilTaslak, setProfilTaslak] = useState("");
  const sirali = [...liste].sort((a, b) => kalanGun(a.odemeGunu) - kalanGun(b.odemeGunu));
  const toplam = liste.reduce((t, a) => t + a.tutar, 0);
  const yaklasan = sirali[0];

  function profiliAc() {
    setProfilTaslak(profilAdi);
    setProfilAcik(true);
  }

  async function profiliKaydet() {
    const ad = profilTaslak.trim();
    if (!ad) {
      Alert.alert("Kullanıcı adı gerekli", "Lütfen bir kullanıcı adı gir.");
      return;
    }

    try {
      await profilAdiKaydet(ad);
      setProfilAcik(false);
    } catch (error) {
      console.error("Kullanıcı adı kaydedilemedi:", error);
      Alert.alert("Kaydedilemedi", "Kullanıcı adı kaydedilirken bir hata oluştu.");
    }
  }

  function silOnay(id: string, ad: string) {
    Alert.alert("Silinsin mi?", `${ad} aboneliği listeden kalkacak.`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => sil(id) },
    ]);
  }

  return (
    <SafeAreaView style={s.kap} edges={["top"]}>
      <FlatList
        data={sirali}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        ListHeaderComponent={
          <View>
            <View style={s.profilSatir}>
              <View style={s.profilAvatar}>
                <Text style={s.profilAvatarYazi}>{(profilAdi.charAt(0) || "K").toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.profilEtiket}>Profil</Text>
                <Text style={s.profilAd}>{profilAdi || "Kullanıcı adı ekle"}</Text>
              </View>
              <Pressable
                onPress={profiliAc}
                disabled={!profilYuklendi}
                accessibilityRole="button"
                accessibilityLabel="Kullanıcı adını düzenle"
                style={s.profilDuzenle}
              >
                <Ionicons name="create-outline" size={20} color={R.ana} />
              </Pressable>
            </View>
            <Text style={s.selam}>Merhaba{profilAdi ? `, ${profilAdi}` : ""} 👋</Text>
            <Text style={s.baslik}>Aboneliklerim</Text>

            <View style={s.ozet}>
              <Text style={s.ozetSoluk}>Aylık toplam harcama</Text>
              <Text style={s.ozetTutar}>{para(toplam)}</Text>
              <View style={s.ozetAlt}>
                <Text style={s.ozetKucuk}>{liste.length} abonelik</Text>
                <Text style={s.ozetKucuk}>Yıllık: {para(yillikTahmin(liste))}</Text>
              </View>
            </View>

            {yaklasan && (
              <View style={s.uyari}>
                <Ionicons name="alarm" size={20} color={R.ana} />
                <Text style={s.uyariYazi}>
                  Sıradaki ödeme: <Text style={{ fontWeight: "800" }}>{yaklasan.ad}</Text> ·{" "}
                  {kalanEtiket(kalanGun(yaklasan.odemeGunu))}
                </Text>
              </View>
            )}

            <Text style={s.bolum}>Tüm abonelikler</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={s.bos}>
            <Ionicons name="wallet-outline" size={56} color={R.soluk} />
            <Text style={s.bosYazi}>Henüz abonelik yok</Text>
            <Text style={s.bosAlt}>Sağ alttaki + ile ilkini ekle</Text>
          </View>
        }
        renderItem={({ item }) => {
          const n = kalanGun(item.odemeGunu);
          const yakin = n <= 3;
          return (
            <Pressable
              onLongPress={() => silOnay(item.id, item.ad)}
              style={({ pressed }) => [s.kart, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <Logo ad={item.ad} renk={item.renk} gorsel={item.gorsel} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.kartAd}>{item.ad}</Text>
                <Text style={s.kartPlan}>{item.plan} · {item.kalanAy ?? 12} ay kaldı</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.kartTutar}>{para(item.tutar)}</Text>
                <View style={[s.rozet, { backgroundColor: yakin ? "#FFE9EC" : R.anaAcik }]}>
                  <Text style={[s.rozetYazi, { color: yakin ? R.kirmizi : R.ana }]}>{kalanEtiket(n)}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable style={({ pressed }) => [s.fab, pressed && { transform: [{ scale: 0.92 }] }]} onPress={() => router.push("/ekle")}>
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>

      <Modal visible={profilAcik} transparent animationType="fade" onRequestClose={() => setProfilAcik(false)}>
        <View style={s.modalArka}>
          <View style={s.modalKart}>
            <Text style={s.modalBaslik}>Profilini düzenle</Text>
            <Text style={s.modalAlt}>Ana sayfada görünecek kullanıcı adını yaz.</Text>
            <TextInput
              style={s.profilInput}
              value={profilTaslak}
              onChangeText={setProfilTaslak}
              placeholder="Kullanıcı adı"
              maxLength={30}
              autoCapitalize="words"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={profiliKaydet}
            />
            <View style={s.modalButonlar}>
              <Pressable style={s.modalIptal} onPress={() => setProfilAcik(false)}>
                <Text style={s.modalIptalYazi}>Vazgeç</Text>
              </Pressable>
              <Pressable style={s.modalKaydet} onPress={profiliKaydet}>
                <Text style={s.modalKaydetYazi}>Kaydet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  kap: { flex: 1, backgroundColor: R.bg },
  profilSatir: { flexDirection: "row", alignItems: "center", backgroundColor: R.kart, borderRadius: 18, padding: 12, marginBottom: 16, ...golge },
  profilAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: R.anaAcik, alignItems: "center", justifyContent: "center", marginRight: 12 },
  profilAvatarYazi: { color: R.ana, fontSize: 18, fontWeight: "800" },
  profilEtiket: { color: R.soluk, fontSize: 12 },
  profilAd: { color: R.yazi, fontSize: 16, fontWeight: "700", marginTop: 2 },
  profilDuzenle: { padding: 10 },
  selam: { color: R.soluk, fontSize: 15 },
  baslik: { color: R.yazi, fontSize: 30, fontWeight: "800", marginBottom: 16 },
  ozet: { backgroundColor: R.ana, borderRadius: 24, padding: 22, ...golge },
  ozetSoluk: { color: "#D9D4FF", fontSize: 14 },
  ozetTutar: { color: "#fff", fontSize: 38, fontWeight: "800", marginVertical: 6 },
  ozetAlt: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  ozetKucuk: { color: "#E7E3FF", fontSize: 13 },
  uyari: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: R.kart, borderRadius: 16, padding: 14, marginTop: 14, ...golge },
  uyariYazi: { color: R.yazi, flex: 1 },
  bolum: { color: R.yazi, fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 12 },
  kart: { flexDirection: "row", alignItems: "center", backgroundColor: R.kart, borderRadius: 20, padding: 14, marginBottom: 12, ...golge },
  kartAd: { color: R.yazi, fontSize: 16, fontWeight: "700" },
  kartPlan: { color: R.soluk, fontSize: 13, marginTop: 2 },
  kartTutar: { color: R.yazi, fontSize: 16, fontWeight: "800" },
  rozet: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  rozetYazi: { fontSize: 11, fontWeight: "700" },
  bos: { alignItems: "center", marginTop: 50 },
  bosYazi: { color: R.yazi, fontSize: 18, fontWeight: "700", marginTop: 12 },
  bosAlt: { color: R.soluk, marginTop: 4 },
  fab: { position: "absolute", right: 22, bottom: 24, width: 62, height: 62, borderRadius: 31, backgroundColor: R.ana, alignItems: "center", justifyContent: "center", ...golge },
  modalArka: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalKart: { width: "100%", maxWidth: 420, backgroundColor: R.kart, borderRadius: 22, padding: 22, ...golge },
  modalBaslik: { color: R.yazi, fontSize: 20, fontWeight: "800" },
  modalAlt: { color: R.soluk, marginTop: 6, marginBottom: 18 },
  profilInput: { backgroundColor: R.bg, borderRadius: 12, padding: 14, color: R.yazi },
  modalButonlar: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  modalIptal: { paddingVertical: 11, paddingHorizontal: 16 },
  modalIptalYazi: { color: R.soluk, fontWeight: "700" },
  modalKaydet: { backgroundColor: R.ana, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 18 },
  modalKaydetYazi: { color: "#fff", fontWeight: "700" },
});