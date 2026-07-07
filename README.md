# MuzSports: Sunucusuz P2P Spor & Sosyal Ekosistemi

Selamlar! Bu dokümantasyon MuzSports'un tamamı hakkında bilgi verir. Uygulama tamamen **serverless (sunucusuz), P2P (akran-akrana), tarayıcı tabanlı** olarak tasarlandı.

---

## 🎯 Temel Özellikler

### 🎨 Marka Kimliği & Tasarım
- **Logo**: Performansın Zirvesi teması (Kırmızı, Beyaz, Siyah)
- **Tema**: Elegant Dark (#0a0a0a arka plan, #ef4444 ana renk - dinamik kırmızı)
- **Tipografi**: Outfit (başlıklar), JetBrains Mono (veriler)
- **Cihazlar**: Web, Mobil (iOS/Android via Capacitor), Masaüstü (Windows/Mac via Electron)

---

## 📊 Canlı Veri Akışları

### Maç Takibi (Match Tracker)
- **Veri Kaynağı**: ESPN API (Gerçek zamanlı)
- **Ligler**: Türk Süper Lig, Euro League, Premier League, La Liga
- **Özellikler**:
  - Canlı skorlar (30s güncelleme aralığı)
  - İstatistikler (Topla oynama, şutlar, kornerler, fauller)
  - AI tahmin paneli
  - Maç olayları ve anlatım

### Haber & Arşiv (Sports News)
- **Veri Kaynağı**: ESPN News API
- **AI Özet Motoru**: 
  - 30 günü geçen haberler otomatik özetlenir
  - Threshold (7-90 gün) kullanıcı tarafından ayarlanabilir
  - Özet durum göstergesi ve "AI ÖZETİ" etiketi

### P2P Forum (Serverless Forum)
- **Teknoloji**: BroadcastChannel API
- **Senkronizasyon**: Tüm açık sekmeler arasında anlık
- **Veriler**: localStorage'de kalıcı
- **Özellikler**:
  - Konu başlığı oluşturma
  - Kategori bazlı filtreleme
  - Gerçek zamanlı mesaj akışı

### Muz Cafe (P2P Oda Sistemi)
- **Özellikler**:
  - Screen Sharing (Tarayıcı getDisplayMedia API)
  - Camera Access (Kamera akışı)
  - Interactive Whiteboard (Taktik tahtası)
  - Reaction Balloons (GOL!, WOW!, 🔥 vs.)
  - Fırça rengi seçimi

---

## 🔄 P2P Senkronizasyon

```typescript
// Tüm sekmelerde eşzamanlı:
- Maç skorları ve olayları
- Forum konuları ve mesajları
- Kullanıcı profili güncellemeleri
- AI ayarları
- Kafe reaksiyonları
```

**Mekanizma**: BroadcastChannel API kullanarak tarayıcı içi senkronizasyon (hiçbir sunucuya ihtiyaç yok).

---

## 💾 Yerel Kalıcılık

Tüm veriler `localStorage`'de saklanır:
- `muzsports_username` - Kullanıcı adı
- `muzsports_ai_enabled` - AI aktif/pasif
- `muzsports_ai_aging_days` - Threshold günü
- `muzsports_forum_topics` - Forum konuları
- `muzsports_forum_messages` - Forum mesajları

---

## 📱 Cihaz Desteği

### Web (Ana Platform)
```bash
npm run dev        # Geliştirme sunucusu
npm run build      # Üretim derlemesi
npm run preview    # Derlenmiş halı önizle
```

### Mobil (iOS & Android)
```bash
npm run build
npx cap add ios
npx cap add android
npm run ios        # iOS Simulator
npm run android    # Android Emulator
```

**Yapılandırma**: `capacitor.config.ts`
- App ID: `com.muzsports.app`
- Display Name: `MuzSports`
- Başlat dosyası: `dist/index.html`

### Masaüstü (Windows & macOS)
```bash
npm run build
npm run electron:dev  # Geliştirme modu
npm run electron:build # Paket oluştur
```

**Yapılandırma**: `electron/main.cjs`
- Ana pencere: 1200x800
- Preload script: Güvenlik

---

## 🤖 AI Ayarları Paneli

**Konum**: Sağ yan panel

**Kontroller**:
- **Otomatik Özetleme**: Açık/Kapalı toggle
- **Yaş Sınırı**: 7-90 gün aralığı slider

**AI Sağlayıcıları**:
- `Yerel`: Tarayıcı içi özetleyici (ücretsiz, offline)
- `OpenAI`: Dış sağlayıcı; OpenAI API anahtarı girilerek kullanılabilir. API anahtarınızı `AI Panel` > `OpenAI API Key` alanına yapıştırın. Anahtar gönderilmez veya depolanmaz sunucuya; sadece tarayıcı yerel depolamasında saklanır.

Not: OpenAI veya diğer sağlayıcılar kullanıldığında faturalama doğrudan sağlayıcı tarafından yapılır. Ben anahtarların güvenliğini sağlamıyorum; isterseniz kullanım için yönergeler oluştururum.

**Çalışma Mantığı**:
```typescript
if (aiEnabled && isOlderThanDays(article.date, agingDays)) {
  summarize(article.content);  // AI tarafından özetlenir
}
```

---

## 🎯 Sistem Durumu Göstergesi

Başlık panosu gerçek zamanlı statüyü gösterir:
- ✅ **Canlı Veri Akışı**: Aktif
- ✅ **Forum**: Senkronize
- ✅ **Kafe Odaları**: Açık
- ✅ **AI Özet**: Açık/Kapalı

---

## 🔐 Veri Güvenliği

- Hiçbir sunucuya veri gönderilmez
- Tüm işlemler tarayıcıda yapılır
- localStorage tarayıcı tarafından korunur
- P2P mesajları sadece açık sekmeler arasında iletilir

---

## 📝 Konfigürasyon Dosyaları

### `tailwind.config.js`
```javascript
colors: {
  primary: '#ef4444',        // MuzSports Kırmızı
  background: '#0a0a0a',     // Koyu Siyah
  // ...
}
```

### `capacitor.config.ts`
iOS, Android, Web platform konfigürasyonu.

### `electron/main.cjs`
Elektron ana pencere ve IPC iletişimi.

---

## 🚀 Başlama

```bash
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Derle
npm run build

# Mobil için Capacitor ekle
npx cap add ios
npx cap add android

# Masaüstü için Electron çalıştır
npm run electron:dev
```

---

## 📋 Proje Yapısı

```
muzsports/
├── src/
│   ├── App.tsx                 # Ana uygulama shell
│   ├── components/
│   │   ├── Header.tsx          # Başlık (logo + navigasyon)
│   │   ├── MatchTracker.tsx    # Maç takibi
│   │   ├── SportsNews.tsx      # Haberler (AI özet)
│   │   ├── ServerlessForum.tsx # P2P forum
│   │   ├── MuzCafes.tsx        # Kafe odaları
│   │   ├── AISettings.tsx      # AI kontrol paneli
│   │   └── MobileSync.tsx      # Mobil eşleme
│   ├── lib/
│   │   ├── data.ts            # ESPN API entegrasyonu
│   │   ├── p2p.ts             # BroadcastChannel yöneticisi
│   │   ├── ai.ts              # AI özet motoru
│   │   └── storage.ts         # localStorage yardımcıları
│   ├── types/
│   │   └── index.ts           # TypeScript tiplemeri
│   └── index.css              # Global stiller
├── electron/
│   └── main.cjs               # Elektron ana süreci
├── capacitor.config.ts        # Capacitor konfigürasyonu
├── vite.config.ts             # Vite yapısı
└── tailwind.config.js         # Tailwind teması
```

---

## 🎓 Kullanım Örnekleri

### Maçları Takip Etmek
1. "MAÇLAR" sekmesini açın
2. Sol panelden maç seçin
3. Sağ panelde skorları, istatistikleri ve tahminleri görün

### Forum Konuşması
1. "FORUM" sekmesini açın
2. Soldaki listeden konu seçin veya yeni konu oluşturun
3. Mesajlaşın - tüm açık sekmeler senkronize olur

### Kafe Odasında Toplantı
1. "MUZ CAFE" sekmesini açın
2. Oda seçin veya yeni oda oluşturun
3. Kamera/ekran paylaşımı etkinleştirin
4. Taktik tahtasında çizim yapın
5. Reaksiyonlar gönderin

### AI Özetleme Ayarla
1. Sağ yan panelindeki "AI Panel" bölümünü açın
2. Otomatik özetlemeyi aç/kapat
3. Yaş sınırını ayarla (7-90 gün)

---

## 🛠 Geliştirme İpuçları

- **Hot Reload**: Değişiklikleri kaydedin, sayfayı yenileyin
- **localStorage Temizleme**: DevTools → Application → localStorage
- **P2P Hata Ayıklama**: Birden fazla sekme açıp test edin
- **ESPN API**: Gerçek API kullanılır; erişim sorununda uygulama "veri yok" durumunu gösterir (sahte veri gösterilmiyor)

---

## 📞 Destek

Herhangi bir soru veya sorun için, lütfen GitHub issue açın veya geliştirici ekibine başvurun.

---

**Son Güncelleme**: Ocak 2025  
**Sürüm**: 1.0.0-beta  
**Lisans**: MIT
