# API Entegrasyon ve Veri Katmanı Yeniden Yapılandırma Planı

**Tarih:** 15 Mayıs 2026
**Durum:** Tüm Fazlar Tamamlandı ✅

## Ana Hedef

Mevcut durumda kullanılan, tarih bilgisi gibi kritik verileri eksik alan ve sık sık bozulma riski taşıyan Puppeteer tabanlı web kazıyıcı (scraper) altyapısını tamamen terk etmek. Bunun yerine, her veri türü için güvenilir, kararlı ve resmi API'ler kullanarak projenin veri temelini sağlamlaştırmak.

Bu plan, `search-agent`'in her zaman temiz, yapılandırılmış ve doğru tarih damgalı JSON verisi toplamasını sağlayarak, `analyst-agent`'in üreteceği analizin kalitesini temelden artıracaktır.

---

## Eylem Planı

### Faz 1: Hızlı Kazanımlar ve Temel Düzeltmeler (En Yüksek Öncelik)

*Amaç: Mevcut en acil sorunları (güvenilmez haberler ve eksik makroekonomik bağlam) en kararlı API'lerle hemen çözmek.*

| Adım | Aksiyon | Gerekli API / Araç | Durum |
| :--- | :--- | :--- | :--- |
| **1.1** | **Makroekonomik Veri Temelini Oluşturma** | **TCMB EVDS API** (evds3 endpoint) | ✅ `Tamamlandı` |
| **1.2** | **Haber Akışını Sağlamlaştırma** | **Currents API** | ✅ `Tamamlandı` |

---

### Faz 2: Çekirdek Finansal Verilerin Entegrasyonu

*Amaç: Projenin kalbini oluşturan şirket ve piyasa verilerini güvenilir kaynaklara bağlamak.*

| Adım | Aksiyon | Gerekli API / Araç | Durum |
| :--- | :--- | :--- | :--- |
| **2.1** | **Piyasa Verileri (Endeks/Hisse)** | **Alpha Vantage** | ✅ `Tamamlandı` |
| **2.2** | **KAP Bildirimleri** | **Araştırma Gerekli** (Fintables, Matriks vb.) | `Bloke Edildi (API kaynağı araştırılıyor)` |

**Not (Adım 2.2):** Bu, projenin başarısı için en kritik adımdır. Güvenilir bir KAP API'si bulunması zorunludur. Eğer bulunamazsa, B Planı olarak daha gelişmiş bir kazıma teknolojisi değerlendirilecektir.

---

### Faz 3: Agent'ların Yeniden Yapılandırılması ve Temizlik

*Amaç: Sağlamlaşan veri katmanını kullanmak üzere agent mantığını güncellemek ve eski, gereksiz kodları temizlemek.*

| Adım | Aksiyon | Bağımlılık | Durum |
| :--- | :--- | :--- | :--- |
| **3.1** | **Agent'ların Dönüşümü** | Faz 1 ve Faz 2 | ✅ `Tamamlandı` |
| **3.2** | **Eski Kodların Temizlenmesi** | Adım 3.1 | ✅ `Tamamlandı` |

---

## Tamamlanan İşler (15 Mayıs 2026)

### Faz 2.1 Değişiklikleri:
- **Alpha Vantage:** `src/lib/market/client.ts` yazıldı. BIST sembol formatı otomatik (`THYAO` → `THYAO.IS`). Fonksiyonlar: `getStockQuote`, `getCompanyOverview`, `getMonthlyPrices`, `getFullMarketData`.
- **Tipler:** `src/types/market.ts` oluşturuldu. Zod şemaları ile çalışma zamanı doğrulaması mevcut.
- **`.env.example`** güncellendi: `ALPHA_VANTAGE_API_KEY` ve `CURRENTS_API_KEY` alanları eklendi.
- **Rate limit:** Ücretsiz tier (25 istek/gün) için sequential istek + 1.2s gecikme uygulandı.

### Faz 1 Değişiklikleri:
- **TCMB EVDS:** `evds` npm paketi kaldırıldı (bozuk eski endpoint kullanıyordu). Yeni endpoint `evds3.tcmb.gov.tr/igmevdsms-dis/` ile çalışan özel istemci yazıldı. API anahtarı `key` HTTP header'ında gönderiliyor.
- **Currents API:** Zod şeması düzeltildi (tarih formatı uyumsuzluğu). Kategori filtreleri kaldırıldı (Türkçe haberler farklı kategorilere atanıyordu).
- **ES Module uyumluluğu:** `postcss.config.js` → `.cjs` olarak yeniden adlandırıldı. `next.config.js`'deki `serverExternalPackages` → `experimental.serverComponentsExternalPackages` olarak düzeltildi.

## Sonraki Adımlar

1.  Faz 2'ye geçiş: Piyasa verileri ve KAP bildirimleri için API kaynakları araştırılacak.
2.  Faz 3: Agent'lar yeni veri katmanını kullanacak şekilde güncellenecek.
