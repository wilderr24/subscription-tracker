import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { abonelikBuAyda, para, useSubs } from "./store";

export type BildirimAyarlari = {
  acik: boolean;
  gunOnce: number; // ödemeden kaç gün önce haber verilsin (0 = ödeme günü)
};

type Baglam = {
  ayarlar: BildirimAyarlari;
  ayarlarYuklendi: boolean;
  ayarlariDegistir: (yeni: Partial<BildirimAyarlari>) => Promise<boolean>;
  testGonder: () => Promise<boolean>;
};

const ANAHTAR = "bildirim-ayarlari-v1";
const KANAL = "odeme-hatirlatma";
const SAAT = 9; // bildirimler sabah 09:00'da gelir
const KAC_AY_ILERI = 6; // bundan sonraki kaç ayın ödemesi planlansın
const EN_FAZLA = 50; // telefonlar ~64 planlı bildirim sınırı koyar

const Ctx = createContext<Baglam>({
  ayarlar: { acik: false, gunOnce: 1 },
  ayarlarYuklendi: false,
  ayarlariDegistir: async () => false,
  testGonder: async () => false,
});

// Uygulama açıkken de bildirim görünsün
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function kanalHazirla() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync(KANAL, {
      name: "Ödeme hatırlatmaları",
      importance: Notifications.AndroidImportance.HIGH,
    });
  } catch (hata) {
    console.warn("Bildirim kanalı oluşturulamadı:", hata);
  }
}

async function izinVarMi(iste: boolean) {
  await kanalHazirla();
  const mevcut = await Notifications.getPermissionsAsync();
  if (mevcut.granted) return true;
  if (!iste) return false;
  const sonuc = await Notifications.requestPermissionsAsync();
  return sonuc.granted;
}

function gunEtiketi(gunOnce: number) {
  if (gunOnce === 0) return "bugün";
  if (gunOnce === 1) return "yarın";
  return `${gunOnce} gün sonra`;
}

export function BildirimProvider({ children }: { children: ReactNode }) {
  const { tumKayitlar } = useSubs();
  const [ayarlar, setAyarlar] = useState<BildirimAyarlari>({ acik: false, gunOnce: 1 });
  const [ayarlarYuklendi, setAyarlarYuklendi] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ANAHTAR)
      .then((v) => v && setAyarlar({ acik: false, gunOnce: 1, ...JSON.parse(v) }))
      .catch(() => {})
      .finally(() => setAyarlarYuklendi(true));
  }, []);

  // Abonelikler ya da ayarlar değişince tüm hatırlatıcıları baştan kurar
  useEffect(() => {
    if (!ayarlarYuklendi) return;
    let iptal = false;

    async function planla() {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        if (!ayarlar.acik) return;
        if (!(await izinVarMi(false))) return;

        const simdi = new Date();
        const adaylar: { tarih: Date; baslik: string; govde: string }[] = [];

        for (const abonelik of tumKayitlar) {
          if (abonelik.silinmeTarihi) continue;
          for (let k = 0; k <= KAC_AY_ILERI; k++) {
            const ayBasi = new Date(simdi.getFullYear(), simdi.getMonth() + k, 1);
            if (!abonelikBuAyda(abonelik, ayBasi)) continue;
            const aydakiGunSayisi = new Date(ayBasi.getFullYear(), ayBasi.getMonth() + 1, 0).getDate();
            const odeme = new Date(
              ayBasi.getFullYear(),
              ayBasi.getMonth(),
              Math.min(abonelik.odemeGunu, aydakiGunSayisi),
            );
            const bildirimZamani = new Date(
              odeme.getFullYear(),
              odeme.getMonth(),
              odeme.getDate() - ayarlar.gunOnce,
              SAAT,
              0,
              0,
            );
            if (bildirimZamani.getTime() <= simdi.getTime()) continue;
            adaylar.push({
              tarih: bildirimZamani,
              baslik: `${abonelik.ad} ödemesi ${gunEtiketi(ayarlar.gunOnce)}`,
              govde: `${para(abonelik.tutar)} · ${abonelik.plan}`,
            });
          }
        }

        adaylar.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
        for (const aday of adaylar.slice(0, EN_FAZLA)) {
          if (iptal) return;
          await Notifications.scheduleNotificationAsync({
            content: { title: aday.baslik, body: aday.govde },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: aday.tarih,
              channelId: KANAL,
            },
          });
        }
      } catch (hata) {
        console.warn("Hatırlatıcılar kurulamadı:", hata);
      }
    }

    planla();
    return () => {
      iptal = true;
    };
  }, [tumKayitlar, ayarlar, ayarlarYuklendi]);

  // Açıksa izin ister. İzin verilmezse false döner.
  const ayarlariDegistir = async (yeni: Partial<BildirimAyarlari>) => {
    const birlesik = { ...ayarlar, ...yeni };
    if (birlesik.acik && !(await izinVarMi(true))) {
      return false;
    }
    setAyarlar(birlesik);
    await AsyncStorage.setItem(ANAHTAR, JSON.stringify(birlesik)).catch(() => {});
    return true;
  };

  const testGonder = async () => {
    if (!(await izinVarMi(true))) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title: "Test bildirimi", body: "Hatırlatıcılar çalışıyor 🎉" },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: KANAL,
      },
    });
    return true;
  };

  return (
    <Ctx.Provider value={{ ayarlar, ayarlarYuklendi, ayarlariDegistir, testGonder }}>
      {children}
    </Ctx.Provider>
  );
}

export const useBildirim = () => useContext(Ctx);
