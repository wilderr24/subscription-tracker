import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { FIYAT_KONTROL_TARIHI, KATALOG, Servis, TAHMINI_FIYAT_NOTU } from "./katalog";

// Fiyat dosyasının internet adresi (GitHub reposundaki data/fiyatlar.json)
const FIYAT_ADRESI =
  "https://raw.githubusercontent.com/wilderr24/subscription-tracker/main/data/fiyatlar.json";
const ONBELLEK_ANAHTARI = "fiyat-katalogu-v1";
const ZAMAN_ASIMI_MS = 8000;

type FiyatVerisi = {
  surum: number;
  kontrolTarihi: string;
  not: string;
  servisler: Servis[];
};

type Baglam = {
  katalog: Servis[];
  kontrolTarihi: string;
  not: string;
  kaynak: "internet" | "onbellek" | "uygulama";
  yukleniyor: boolean;
  yenile: () => Promise<void>;
};

const varsayilan: FiyatVerisi = {
  surum: 0,
  kontrolTarihi: FIYAT_KONTROL_TARIHI,
  not: TAHMINI_FIYAT_NOTU,
  servisler: KATALOG,
};

const Ctx = createContext<Baglam>({
  katalog: KATALOG,
  kontrolTarihi: FIYAT_KONTROL_TARIHI,
  not: TAHMINI_FIYAT_NOTU,
  kaynak: "uygulama",
  yukleniyor: false,
  yenile: async () => {},
});

// Gelen veri bozuksa uygulamayı çökertmesin diye kontrol ediyoruz
function gecerliMi(veri: any): veri is FiyatVerisi {
  if (!veri || typeof veri !== "object") return false;
  if (typeof veri.kontrolTarihi !== "string" || typeof veri.not !== "string") return false;
  if (!Array.isArray(veri.servisler) || veri.servisler.length === 0) return false;
  return veri.servisler.every(
    (s: any) =>
      s &&
      typeof s.id === "string" &&
      typeof s.ad === "string" &&
      typeof s.renk === "string" &&
      typeof s.kategori === "string" &&
      Array.isArray(s.planlar) &&
      s.planlar.length > 0 &&
      s.planlar.every(
        (p: any) =>
          p &&
          typeof p.ad === "string" &&
          (p.fiyat === undefined || (typeof p.fiyat === "number" && Number.isFinite(p.fiyat))),
      ),
  );
}

export function FiyatProvider({ children }: { children: ReactNode }) {
  const [veri, setVeri] = useState<FiyatVerisi>(varsayilan);
  const [kaynak, setKaynak] = useState<Baglam["kaynak"]>("uygulama");
  const [yukleniyor, setYukleniyor] = useState(true);

  const yenile = useCallback(async () => {
    setYukleniyor(true);
    const kontrol = new AbortController();
    const zamanlayici = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS);
    try {
      // ?t= ile telefonun eski dosyayı önbellekten getirmesini engelliyoruz
      const yanit = await fetch(`${FIYAT_ADRESI}?t=${Date.now()}`, { signal: kontrol.signal });
      if (!yanit.ok) throw new Error(`Sunucu hatası: ${yanit.status}`);
      const gelen = await yanit.json();
      if (!gecerliMi(gelen)) throw new Error("Fiyat dosyasının biçimi geçersiz");
      setVeri(gelen);
      setKaynak("internet");
      AsyncStorage.setItem(ONBELLEK_ANAHTARI, JSON.stringify(gelen)).catch(() => {});
    } catch (hata) {
      console.warn("Güncel fiyatlar alınamadı, kayıtlı veri kullanılacak:", hata);
    } finally {
      clearTimeout(zamanlayici);
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    let iptal = false;
    // Önce telefonda kayıtlı son fiyatlar gösterilir, sonra internetten yenisi aranır
    AsyncStorage.getItem(ONBELLEK_ANAHTARI)
      .then((kayit) => {
        if (!kayit || iptal) return;
        const eski = JSON.parse(kayit);
        if (gecerliMi(eski)) {
          setVeri(eski);
          setKaynak("onbellek");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!iptal) yenile();
      });
    return () => {
      iptal = true;
    };
  }, [yenile]);

  return (
    <Ctx.Provider
      value={{
        katalog: veri.servisler,
        kontrolTarihi: veri.kontrolTarihi,
        not: veri.not,
        kaynak,
        yukleniyor,
        yenile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useKatalog = () => useContext(Ctx);
