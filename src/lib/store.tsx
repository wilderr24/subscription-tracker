import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Abonelik = {
  id: string;
  ad: string;
  plan: string;
  tutar: number;
  kalanAy: number;
  baslangicTarihi: number;
  silinmeTarihi?: number;
  renk: string;
  kategori: string;
  odemeGunu: number;
  gorsel?: string;
};

type Baglam = {
  liste: Abonelik[];
  tumKayitlar: Abonelik[];
  profilAdi: string;
  profilYuklendi: boolean;
  ekle: (a: Omit<Abonelik, "id" | "baslangicTarihi" | "silinmeTarihi">) => void;
  sil: (id: string) => void;
  profilAdiKaydet: (ad: string) => Promise<void>;
};

const Ctx = createContext<Baglam>({
  liste: [],
  tumKayitlar: [],
  profilAdi: "",
  profilYuklendi: false,
  ekle: () => {},
  sil: () => {},
  profilAdiKaydet: async () => {},
});
const ANAHTAR = "abonelikler-v1";
const PROFIL_ANAHTAR = "kullanici-profili-v1";

export function SubsProvider({ children }: { children: ReactNode }) {
  const [kayitlar, setKayitlar] = useState<Abonelik[]>([]);
  const [yuklendi, setYuklendi] = useState(false);
  const [profilAdi, setProfilAdi] = useState("");
  const [profilYuklendi, setProfilYuklendi] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ANAHTAR)
      .then((v) => {
        if (!v) return;
        const simdi = Date.now();
        const kayitlar = JSON.parse(v) as Abonelik[];
        setKayitlar(
          kayitlar.map((abonelik) => ({
            ...abonelik,
            baslangicTarihi: Number.isFinite(abonelik.baslangicTarihi)
              ? abonelik.baslangicTarihi
              : simdi,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setYuklendi(true));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(PROFIL_ANAHTAR)
      .then((ad) => ad && setProfilAdi(ad))
      .catch((error) => console.error("Kullanıcı profili yüklenemedi:", error))
      .finally(() => setProfilYuklendi(true));
  }, []);

  useEffect(() => {
    if (yuklendi) AsyncStorage.setItem(ANAHTAR, JSON.stringify(kayitlar)).catch(() => {});
  }, [kayitlar, yuklendi]);

  const profilAdiKaydet = async (ad: string) => {
    const temizAd = ad.trim();
    if (!temizAd) throw new Error("Kullanıcı adı boş olamaz.");
    await AsyncStorage.setItem(PROFIL_ANAHTAR, temizAd);
    setProfilAdi(temizAd);
  };

  const ekle = (a: Omit<Abonelik, "id" | "baslangicTarihi" | "silinmeTarihi">) =>
    setKayitlar((l) => [...l, { ...a, id: Date.now().toString(), baslangicTarihi: Date.now() }]);
  const sil = (id: string) =>
    setKayitlar((l) =>
      l.map((abonelik) =>
        abonelik.id === id ? { ...abonelik, silinmeTarihi: Date.now() } : abonelik,
      ),
    );
  const simdi = new Date();
  const liste = kayitlar.filter((abonelik) => !abonelik.silinmeTarihi && abonelikBuAyda(abonelik, simdi));

  return (
    <Ctx.Provider value={{ liste, tumKayitlar: kayitlar, profilAdi, profilYuklendi, ekle, sil, profilAdiKaydet }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSubs = () => useContext(Ctx);

export function kalanGun(gun: number) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const hedef = (y: number, m: number) =>
    new Date(y, m, Math.min(gun, new Date(y, m + 1, 0).getDate()));
  let t = hedef(bugun.getFullYear(), bugun.getMonth());
  if (t < bugun) t = hedef(bugun.getFullYear(), bugun.getMonth() + 1);
  return Math.round((t.getTime() - bugun.getTime()) / 86400000);
}

export function kalanEtiket(n: number) {
  if (n === 0) return "Bugün";
  if (n === 1) return "Yarın";
  return `${n} gün sonra`;
}

export const para = (n: number) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";

function ayIndeksi(tarih: Date) {
  return tarih.getFullYear() * 12 + tarih.getMonth();
}

function abonelikBaslangici(abonelik: Abonelik) {
  return Number.isFinite(abonelik.baslangicTarihi) ? abonelik.baslangicTarihi : Date.now();
}

function abonelikSuresi(abonelik: Abonelik) {
  return Number.isInteger(abonelik.kalanAy) && abonelik.kalanAy > 0 ? abonelik.kalanAy : 12;
}

export function abonelikBuAyda(abonelik: Abonelik, ay: Date) {
  const seciliAy = ayIndeksi(ay);
  const baslangicAy = ayIndeksi(new Date(abonelikBaslangici(abonelik)));
  const bitisAyHaric = baslangicAy + abonelikSuresi(abonelik);
  if (seciliAy < baslangicAy || seciliAy >= bitisAyHaric) return false;

  const silinmeTarihi = abonelik.silinmeTarihi;
  if (typeof silinmeTarihi === "number" && Number.isFinite(silinmeTarihi)) {
    const silinmeAyi = ayIndeksi(new Date(silinmeTarihi));
    if (seciliAy > silinmeAyi) return false;
  }
  return true;
}

export function yillikTahmin(liste: Abonelik[]) {
  const buAy = ayIndeksi(new Date());
  return liste.reduce((toplam, abonelik) => {
    const baslangicAy = ayIndeksi(new Date(abonelikBaslangici(abonelik)));
    const bitisAyHaric = baslangicAy + abonelikSuresi(abonelik);
    const kalanAy = Math.min(Math.max(bitisAyHaric - Math.max(baslangicAy, buAy), 0), 12);
    return toplam + abonelik.tutar * kalanAy;
  }, 0);
}