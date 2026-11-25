# Abonelik Takip

Dijital aboneliklerini tek yerden takip et: ay sonunda ne kadar harcadığını gör, hangi ödemenin yaklaştığını kaçırma.

Expo (React Native) ile yazılmış, Android'de test edilmiş bir mobil uygulamadır. Hesap açmak gerekmez, tüm veriler yalnızca telefonda tutulur.

> **Not:** Uygulama şu an yalnızca Türkçe ve Türk lirası (₺) destekler. Diğer diller ve para birimleri planlanıyor.

## Özellikler

- **Aboneliklerim:** Aylık ve yıllık toplam harcama özeti, ödeme gününe göre sıralı abonelik kartları, sıradaki ödemeyi gösteren uyarı. Yaklaşan ödemeler vurgulanır. Bir kartı basılı tutarak silebilirsin.
- **Abonelik ekleme:** 30'dan fazla popüler servisin olduğu listeden uygulamayı ve planı seç. Listede plan yoksa kendi planını ve fiyatını yazabilirsin. Ödeme günü ve kalan ay sayısı girilir.
- **Güncel abonelikler:** Servislerin plan fiyatlarına abone olmadan da göz atabilirsin. Her servis için resmi sayfaya bağlantı vardır.
- **Aylık giderler:** Bu ayın toplamı, yıllık tahmin ve kategoriye göre harcama dağılımı.
- **Kendi aboneliğim:** Listede olmayan bir aboneliği galeriden fotoğraf, isim, fiyat ve kategoriyle ekleyebilirsin.
- **Yerel kayıt:** Uygulamayı kapatsan da veriler silinmez. Silinen abonelikler, geçmiş ayların hesabı bozulmasın diye arka planda saklanır.

## Fiyatlar hakkında

Katalogdaki fiyatlar elle derlenmiştir ve en son **24 Kasım 2026** tarihinde kontrol edilmiştir. Tahmini olarak işaretlenen fiyatlar kesin ödeme tutarı değildir. Dövizli servislerde ABD liste fiyatı sabit bir kurla (1 USD ≈ 50,63 TL) çevrilmiştir; vergi ve mağaza fiyatları farklı olabilir. Fiyatı hesaba göre değişen servislerde kendi ödediğin tutarı girmen önerilir.

Fiyatlar [`src/lib/katalog.ts`](src/lib/katalog.ts) dosyasındadır. Hata görürsen düzeltmek için pull request açabilirsin.

## Kullanılan teknolojiler

- [Expo](https://expo.dev) SDK 58 ve [Expo Router](https://docs.expo.dev/router/introduction) (dosya tabanlı yönlendirme)
- React Native, TypeScript
- AsyncStorage (yerel veri saklama)
- expo-image-picker (fotoğraf seçme)

## Kurulum

Gereksinimler: [Node.js](https://nodejs.org) (LTS) ve telefonda [Expo Go](https://expo.dev/go).

```bash
git clone https://github.com/wilderr24/subscription-tracker.git
cd subscription-tracker
npm install
npx expo start
```

Terminalde çıkan QR kodu Expo Go ile okut. Telefon ve bilgisayar aynı Wi-Fi ağında olmalıdır. Bağlanamazsan `npx expo start --tunnel` dene.

## Proje yapısı

```
src/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Aboneliklerim
│   │   ├── guncel.tsx      # Güncel abonelik fiyatları
│   │   ├── harcamalar.tsx  # Aylık giderler
│   │   └── ozel.tsx        # Kendi aboneliğim
│   ├── ekle.tsx            # Abonelik ekleme ekranı
│   └── _layout.tsx
├── components/
│   └── logo.tsx            # Marka ikonu / fotoğraf gösterimi
└── lib/
    ├── katalog.ts          # Servisler ve plan fiyatları
    ├── store.tsx           # Veri saklama ve hesaplamalar
    └── tema.ts             # Renkler ve gölgeler
```

## Yol haritası

- [ ] Ödeme günü yaklaşınca yerel bildirim
- [ ] Ay ay harcama geçmişi ve karşılaştırma
- [ ] Fiyatların internetten güncellenmesi
- [ ] Çoklu para birimi
- [ ] Çoklu dil desteği
- [ ] Koyu mod
- [ ] Yedekleme ve dışa aktarma

## Katkı

Hata bildirimleri ve fiyat düzeltmeleri için bir issue ya da pull request açabilirsin.

## Lisans

[MIT](LICENSE)
