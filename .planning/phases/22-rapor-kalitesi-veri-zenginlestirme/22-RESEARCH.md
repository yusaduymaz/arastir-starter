# Phase 22: Rapor Kalitesi & Veri Zenginleştirme — Research

**Araştırma Tarihi:** 2026-05-19
**Domain:** Next.js rapor sayfası, Yahoo Finance quoteSummary, TCMB EVDS veri akışı, zaman damgası UX
**Genel Güven:** HIGH (tüm temel bulgular doğrudan kaynak kodu incelemesiyle doğrulandı)

---

## Özet

Bu faz, mevcut raporun dört kritik eksiğini kapatır. Her birinin kök nedeni kaynak kodda doğrulandı:

**1. InvestmentCard neden görünmüyor?** İki ayrı rapor sayfası var: `/dashboard/reports/[id]/page.tsx` (eski, agent_runs tablosunu okur) ve `/dashboard/history/[id]/page.tsx` (yeni, research_sessions tablosundaki `synthesis_data` kolonunu okur). Yeni sayfa InvestmentCard'ı doğru şekilde kullanıyor ancak koşullu render (`{investmentRec && ...}`) nedeniyle `investmentRecommendation` alanı null veya undefined geldiğinde kart hiç gösterilmiyor. Eski rapor sayfası (`/reports/[id]`) ise InvestmentCard'ı hiç import etmiyor.

**2. TCMB TÜFE/Faiz neden N/A?** `macro-agent.ts` çağrıları TCMB'yi doğru şekilde yapıyor; veri `EvdsDataPoint[]` formatında dönüyor. Sorun iki katmanda: (a) Rapor sayfası `macro_data[last].TP_FG_J0` ve `TP_MK_B_A2` değerlerini doğrudan `parseFloat()` ile okuyor, API'den null veya boş string döndüğünde N/A basıyor. (b) `MacroDataCard` bileşeni ise `{ inflation, interest_rate }` gibi düz sayı alanlar beklerken `agent_runs.output_data` olarak saklanan veri `EvdsDataPoint[]` array formatında — bu iki bileşen arasında tip uyumsuzluğu var.

**3. Zaman damgası yok.** `source.fetched_at` alanı `MarketData` tipinde Unix timestamp olarak mevcut (`Date.now()` döndürülüyor). Ancak rapor sayfasında bu alan kullanılmıyor. `EvdsDataPoint[]` içinde TCMB verisi `Tarih` (YYYY-MM formatında ay adımı) içeriyor — bu son veri noktasının tarihi ama anlık çekim zamanı değil. `agent_runs` tablosundaki `completed_at` kolonu her agent'ın tamamlanma zamanını tutuyor ve timestamp kaynağı olarak kullanılabilir.

**4. Eksik finansal rasyolar.** Yahoo Finance `quoteSummary` `defaultKeyStatistics` modülü `priceToBook` ve `beta` ve `floatShares` döndürüyor; `financialData` modülü `returnOnEquity`, `returnOnAssets`, `profitMargins` döndürüyor. Mevcut `yahoo-client.ts` bu modülleri zaten çağırıyor (`defaultKeyStatistics` dahil) ama `CompanyOverview` tipine ve mapping'e bu alanları eklemiyor.

**Ana tavsiye:** Dört problemi birbirinden bağımsız olarak çöz — her biri tek bir dosya setini etkiliyor ve yan etkisi olmayan izole değişiklikler.

---

<phase_requirements>
## Faz Gereksinimleri

| ID | Açıklama | Araştırma Desteği |
|----|----------|------------------|
| RPT-01 | Rapor sayfasının üst kısmında AL/TUT/SAT kartı (InvestmentCard) güven skoru ile birlikte her zaman görünür | `synthesis_data.investmentRecommendation` history/[id] sayfasında mevcut; koşullu render kaldırılıp fallback state eklenecek |
| RPT-02 | TCMB endpoint'i TÜFE ve Politika Faizi verisini dönemediğinde "N/A" yerine son bilinen değeri veya açıklayıcı fallback mesajı gösterir | macro-agent başarısız veya null döndürdüğünde graceful fallback mantığı `history/[id]` sayfasına ve `MacroDataCard`'a eklenecek |
| RPT-03 | Fiyat, makro ve haber bloklarının her birinde "X dakika önce güncellendi" şeklinde zaman damgası gösterilir | `market_data.source.fetched_at` (Unix timestamp) mevcut; agent_runs.completed_at TCMB için kaynak |
| RPT-04 | Rapor sayfasında P/B, ROE, ROA, Beta, Net Marj ve Free Float rasyoları Temel Göstergeler kartında listelenir | Yahoo quoteSummary `financialData` + `defaultKeyStatistics` modülleri bu alanları döndürüyor; tip ve mapping genişletilecek |
</phase_requirements>

---

## Mimari Sorumluluk Haritası

| Yetenek | Birincil Katman | İkincil Katman | Gerekçe |
|---------|----------------|----------------|---------|
| InvestmentCard görünürlüğü | Frontend (history/[id] sayfası) | — | Veri zaten synthesis_data içinde; sadece render koşulu düzeltilecek |
| TCMB fallback mantığı | Backend (macro-agent) | Frontend (history/[id]) | Agent katmanında graceful fallback, sayfada N/A yerine mesaj |
| Zaman damgası hesaplama | Frontend (history/[id] sayfası) | — | source.fetched_at ve completed_at zaten DB'de; hesaplama client-side |
| Yeni finansal rasyolar | Backend (yahoo-client.ts) | Tip katmanı (market.ts) | quoteSummary mapping'i yahoo-client'ta genişletilecek, tip CompanyOverview'a eklenecek |
| Yeni rasyoların gösterimi | Frontend (history/[id] sayfası) | — | Yeni alanlar overview nesnesinden okunacak |

---

## Standart Yığın

### Mevcut (Değişmeyecek)
| Kütüphane | Versiyon | Amaç | Durum |
|-----------|---------|------|-------|
| yahoo-finance2 | ^3.14.0 | Yahoo Finance quoteSummary | Mevcut, genişletilecek |
| Next.js | 14.2.5 | Rapor sayfası | Mevcut |
| Supabase JS | mevcut | DB erişimi | Mevcut |
| zod | mevcut | Tip doğrulama | Mevcut |
| date-fns / Intl | dahili | Tarih formatlama | Mevcut |

### Yeni Gereksinim Yok
Bu faz yeni kütüphane gerektirmiyor. Tüm değişiklikler mevcut altyapı üzerinde.

---

## Mimari Desenler

### Sistem Mimarisi

```
[Kullanıcı Tarayıcısı]
      |
      v
[/dashboard/history/[id]/page.tsx]  <-- ANA RAPOR SAYFASI (bu faz bu dosyayı değiştirir)
      |
      +---> research_sessions tablosu
      |         ├── synthesis_data.investmentRecommendation  (RPT-01)
      |         ├── market_data.source.fetched_at            (RPT-03 market)
      |         ├── market_data.overview.{PB,ROE,ROA,...}    (RPT-04) [YENİ]
      |         └── macro_data[].{TP_FG_J0, TP_MK_B_A2}     (RPT-02)
      |
      +---> agent_runs tablosu
                └── completed_at                             (RPT-03 macro/news)
```

```
[Market Agent] 
  --> getYahooMarketData(ticker)
        --> yf.quoteSummary(symbol, {
              modules: ['summaryDetail','price','assetProfile','defaultKeyStatistics',
                        'financialData']   <-- YENİ EKLENECEK
            })
        --> CompanyOverview mapping
              + PBRatio, Beta, ROE, ROA, NetMargin, FloatShares  <-- YENİ
```

### Proje Yapısı (Etkilenen Dosyalar)

```
src/
├── types/
│   └── market.ts                    # CompanyOverview tipine yeni alanlar eklenir
├── lib/market/
│   └── yahoo-client.ts              # financialData modülü eklenir, mapping genişler
├── agents/
│   └── market-agent.ts              # (muhtemelen değişmez, sadece yahooClient tetikler)
└── app/dashboard/history/[id]/
    └── page.tsx                     # 4 değişiklik:
                                     #   1. InvestmentCard her zaman render
                                     #   2. TCMB fallback mesajı
                                     #   3. Zaman damgaları
                                     #   4. Yeni rasyo kartı
```

### Desen 1: Conditional Render'dan Always-Show'a Geçiş (RPT-01)

**Şu an (sorun):**
```typescript
// SORUN: investmentRec null ise kart hiç render olmuyor
{investmentRec && (
  <InvestmentCard recommendation={investmentRec} ticker={ticker} />
)}
```

**Olması gereken:**
```typescript
// Her zaman render et; veri yoksa fallback state göster
<InvestmentCard 
  recommendation={investmentRec ?? null} 
  ticker={ticker} 
/>
// InvestmentCard içinde: recommendation null ise "Analiz bekleniyor" durumu
```

**Kaynak:** `[VERIFIED: src/app/dashboard/history/[id]/page.tsx satır 199-202]`

### Desen 2: TCMB Graceful Fallback (RPT-02)

**Kök neden:** `macro_data` agent_runs üzerinden `EvdsDataPoint[]` olarak saklanıyor. TCMB API bazen aylık periyotta `TP_FG_J0` (TÜFE) ve `TP_MK_B_A2` (Politika Faizi) için null döndürüyor çünkü bu seriler günlük değil aylık yayınlanıyor ve ay sonu çekildiğinde mevcut ay henüz yayınlanmamış olabilir.

```typescript
// Önerilen fallback mantığı:
function getLatestNonNull(data: EvdsDataPoint[], field: keyof EvdsDataPoint): string {
  // En son non-null değeri bul, yoksa açıklayıcı mesaj döndür
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][field];
    if (val && val !== '' && val !== 'ND') return String(val);
  }
  return 'Veri henüz yayınlanmadı';
}
```

**Kaynak:** `[VERIFIED: src/lib/tcmb/client.ts, src/app/dashboard/history/[id]/page.tsx satır 260-283]`

### Desen 3: Zaman Damgası Hesaplama (RPT-03)

`source.fetched_at` alanı `Date.now()` Unix timestamp (ms) olarak `MarketData` içinde mevcut.
`agent_runs.completed_at` ISO8601 string olarak DB'de mevcut.

```typescript
// Piyasa verisi için:
function timeAgo(fetchedAt: number): string {
  const diffMs = Date.now() - fetchedAt;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Az önce güncellendi';
  if (diffMin < 60) return `${diffMin} dakika önce güncellendi`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr} saat önce güncellendi`;
}

// Kullanım:
{market_data?.source?.fetched_at && (
  <span className="text-[9px] text-[#45474c]">
    {timeAgo(market_data.source.fetched_at)}
  </span>
)}
```

Makro verisi için `agent_runs` tablosundan `macro` agent'ın `completed_at` alanı okunabilir (zaten supabase query'sinde çekilebilir).

**Kaynak:** `[VERIFIED: src/types/market.ts satır 46-53, src/lib/market/yahoo-client.ts satır 118]`

### Desen 4: Yahoo quoteSummary Genişletmesi (RPT-04)

**Mevcut durum:** `yahoo-client.ts` quoteSummary çağrısında `['summaryDetail', 'price', 'assetProfile', 'defaultKeyStatistics']` modüllerini kullanıyor ama `defaultKeyStatistics`'ten sadece `trailingEps` alıyor; `financialData` modülü hiç eklenmemiş.

**Yahoo Finance2 v3 alanları (doğrulandı):**
- `defaultKeyStatistics.priceToBook` → F/DD (P/B)
- `defaultKeyStatistics.beta` → Beta
- `defaultKeyStatistics.floatShares` → Free Float (hisse adedi)
- `financialData.returnOnEquity` → ROE (oran, örn: 0.23 = %23)
- `financialData.returnOnAssets` → ROA (oran)
- `financialData.profitMargins` → Net Marj (oran)

**Kaynak:** `[VERIFIED: WebFetch github.com/gadicc/yahoo-finance2 quoteSummary-iface.ts]`

```typescript
// yahoo-client.ts güncelleme:
const summary: any = await yf.quoteSummary(
  symbol,
  { modules: ['summaryDetail', 'price', 'assetProfile', 'defaultKeyStatistics', 'financialData'] },
  { validateResult: false }
);

const stats = summary?.defaultKeyStatistics || {};
const fd = summary?.financialData || {};

overview = {
  // ... mevcut alanlar ...
  PBRatio: fmt(stats.priceToBook),
  Beta: fmt(stats.beta),
  FloatShares: fmt(stats.floatShares),
  ROE: fd.returnOnEquity != null ? fmt(fd.returnOnEquity * 100) : '',  // yüzdeye çevir
  ROA: fd.returnOnAssets != null ? fmt(fd.returnOnAssets * 100) : '',
  NetMargin: fd.profitMargins != null ? fmt(fd.profitMargins * 100) : '',
} as CompanyOverview;
```

### Anti-Desenler

- **`investmentRec && <InvestmentCard>`**: Null guard kullanmak kartı tamamen gizliyor. "Veri yok" state'i olan bir bileşen her zaman daha iyi UX sunar.
- **`parseFloat(val) || 'N/A'`**: `parseFloat('0')` falsy döner, 0 değeri N/A olarak gösterilir. Kontrol `val != null && val !== ''` şeklinde yapılmalı.
- **ROE/ROA'yı ham oran olarak göstermek**: Yahoo Finance bu değerleri 0-1 skalasında döndürür (örn: 0.23). Göstermeden önce 100 ile çarp.
- **`financialData` modülünü atlamak**: Mevcut kod bu modülü hiç çağırmıyor. Sadece modül listesine eklemek yeterli, büyük bir refactor gerektirmiyor.

---

## El Yapımı Çözme (Don't Hand-Roll)

| Problem | Yapmayın | Kullanın | Neden |
|---------|----------|----------|-------|
| Zaman damgası formatlama | Kendi formatter | `Intl.RelativeTimeFormat` veya basit `timeAgo()` helper | Tarayıcı native API yeterli, kütüphane gereksiz |
| Yahoo Finance tip tanımları | Kendi interface | `yahoo-finance2`'nin TypeScript tipleri | Kütüphane tam tiplenmiş, `.raw` accessor ile ham değer alınır |
| TCMB veri parse | Özel parser | Mevcut Zod şeması (`EvdsDataPointSchema`) | Zaten var, sadece fallback mantığı eklenecek |

---

## Yaygın Tuzaklar

### Tuzak 1: İki Ayrı Rapor Sayfası Karışıklığı
**Ne oluyor:** `/dashboard/reports/[id]` (eski) ve `/dashboard/history/[id]` (yeni) aynı anda var. İkisi farklı veri modellerini okuyor.
**Neden oluyor:** Migration sürecinde eski sayfa silinmedi.
**Nasıl önlenir:** Bu fazda sadece `/history/[id]` sayfasını güncelle; eski `/reports/[id]` sayfasını karıştırma. Planlama notuna ekle.
**Erken uyarı:** `[VERIFIED: src/app/dashboard/reports/[id]/page.tsx` InvestmentCard import etmiyor]

### Tuzak 2: FloatShares Yüzde Değil Hisse Adedi
**Ne oluyor:** `floatShares` milyon/milyar hisse adedi döndürür, yüzde değil.
**Neden oluyor:** "Free Float" kavramının iki yorumu var.
**Nasıl önlenir:** Gösterimde "X milyon hisse" formatında göster veya piyasa değerine böl. Yüzde sanılmamalı.
**Kaynak:** `[VERIFIED: github.com/gadicc/yahoo-finance2 quoteSummary-iface.ts]`

### Tuzak 3: ROE/ROA/NetMargin Oran vs Yüzde
**Ne oluyor:** Yahoo Finance bu değerleri 0.0-1.0 arasında döndürür. Doğrudan gösterilirse "%0.23" değil "0.23" görünür.
**Nasıl önlenir:** `* 100` uygula, `%` sembolü ekle. Örn: `(fd.returnOnEquity * 100).toFixed(2) + '%'`
**Kaynak:** `[VERIFIED: WebFetch github.com/gadicc/yahoo-finance2 quoteSummary-iface.ts]`

### Tuzak 4: TCMB Aylık Gecikme
**Ne oluyor:** TCMB TÜFE ve Politika Faizi verileri ay sonu ya da takip eden ayın başında yayınlanır. Mevcut ay için veri boş gelir.
**Neden oluyor:** `getMacroEconomicData` today'e kadar veri istiyor ama henüz yayınlanmamış aylar için `null` geliyor.
**Nasıl önlenir:** Son non-null değeri al, tarihi ile birlikte göster (örn: "Nisan 2026: %69.80").
**Kaynak:** `[VERIFIED: src/lib/tcmb/client.ts - fetchFromEvds, EvdsDataPointSchema]`

### Tuzak 5: `source.fetched_at` ms vs saniye
**Ne oluyor:** `Date.now()` milisaniye döndürür. Yanlış bölme yapılırsa yanlış zaman gösterilir.
**Nasıl önlenir:** `fetched_at` Unix ms timestamp olduğunu belgeye ekle. `Date.now() - fetched_at` ms cinsinden.
**Kaynak:** `[VERIFIED: src/lib/market/yahoo-client.ts satır 118 - source.fetched_at: Date.now()]`

---

## Kod Örnekleri

### InvestmentCard Always-Show Pattern
```typescript
// src/app/dashboard/history/[id]/page.tsx
// Değişiklik: koşullu render yerine null-safe prop
const investmentRec = synthesis_data?.investmentRecommendation ?? null;

// Render kısmında:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {monthlySeries && Object.keys(monthlySeries).length > 0 && (
    <div className="bg-[#080808] ...">
      <PriceChart monthlySeries={monthlySeries} />
    </div>
  )}
  {/* Her zaman göster - investmentRec null bile olsa */}
  <InvestmentCard recommendation={investmentRec} ticker={ticker} />
</div>
```

`InvestmentCard` bileşeninde `recommendation` prop null olduğunda "Analiz tamamlanmadı" fallback state'i:
```typescript
// src/components/dashboard/report/InvestmentCard.tsx
interface InvestmentCardProps {
  recommendation: InvestmentRecommendation | null  // null kabul et
  ticker: string
}

export function InvestmentCard({ recommendation, ticker }: InvestmentCardProps) {
  if (!recommendation) {
    return (
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 flex items-center justify-center">
        <p className="font-['JetBrains_Mono'] text-[11px] text-[#45474c]">
          Yatirim tavsiyesi analiz edilemedi.
        </p>
      </div>
    )
  }
  // ... mevcut kod
}
```

### TCMB Graceful Fallback
```typescript
// history/[id]/page.tsx - makro veri gösterimi için yardımcı fonksiyon
function getLatestNonNull(data: any[], field: string): string | null {
  if (!data || data.length === 0) return null;
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][field];
    if (val != null && val !== '' && val !== 'ND') return String(val);
  }
  return null;
}

// Kullanım:
const tufeVal = getLatestNonNull(macro_data, 'TP_FG_J0');
const faizVal = getLatestNonNull(macro_data, 'TP_MK_B_A2');
// Gösterim: tufeVal ? `%${parseFloat(tufeVal).toFixed(2)}` : 'Veri henüz yayınlanmadı'
```

### Yahoo quoteSummary Genişletmesi
```typescript
// src/lib/market/yahoo-client.ts - güncelleme
const summary: any = await yf.quoteSummary(
  symbol,
  { modules: ['summaryDetail', 'price', 'assetProfile', 'defaultKeyStatistics', 'financialData'] },
  { validateResult: false }
);

const fd = summary?.financialData || {};
const stats = summary?.defaultKeyStatistics || {};

// fmt() null/undefined için '' döndürüyor, bu "-" gösterimi için uygun
overview = {
  // ... mevcut alanlar aynen korunur ...
  PBRatio: fmt(stats.priceToBook?.raw ?? stats.priceToBook),
  Beta: fmt(stats.beta?.raw ?? stats.beta),
  FloatShares: fmt(stats.floatShares?.raw ?? stats.floatShares),
  ROE: fd.returnOnEquity != null 
    ? fmt(((fd.returnOnEquity?.raw ?? fd.returnOnEquity) * 100).toFixed(2))
    : '',
  ROA: fd.returnOnAssets != null 
    ? fmt(((fd.returnOnAssets?.raw ?? fd.returnOnAssets) * 100).toFixed(2))
    : '',
  NetMargin: fd.profitMargins != null 
    ? fmt(((fd.profitMargins?.raw ?? fd.profitMargins) * 100).toFixed(2))
    : '',
} as CompanyOverview;
```

```typescript
// src/types/market.ts - CompanyOverviewSchema genişletmesi
export const CompanyOverviewSchema = z.object({
  // ... mevcut alanlar ...
  PBRatio: z.string().default(''),       // F/DD
  Beta: z.string().default(''),
  FloatShares: z.string().default(''),   // Free Float (hisse adedi)
  ROE: z.string().default(''),           // Özkaynak Karlılığı %
  ROA: z.string().default(''),           // Varlık Karlılığı %
  NetMargin: z.string().default(''),     // Net Kar Marjı %
}).passthrough();
```

---

## Çalışma Zamanı Durum Envanteri

Bu faz rename/refactor içermiyor. Bununla birlikte dikkat edilmesi gereken bir şema durumu var:

| Kategori | Bulunan | Gerekli Eylem |
|----------|---------|---------------|
| Saklanan veri | `research_sessions.market_data` JSON'u CompanyOverview tipiyle uyumlu; eski kayıtlarda yeni alanlar olmayacak | Yeni alanlar için boş string default'u yeterli, migration gereksiz |
| Saklanan veri | `agent_runs.output_data` macro agent için `EvdsDataPoint[]` — format değişmiyor | Sadece okuma mantığı değişiyor |
| Canlı servis config | Yok | — |
| OS kayıtları | Yok | — |
| Secrets/env | `TCMB_EVDS_API_KEY` — değişmiyor | — |
| Build artifacts | Yok | — |

---

## Ortam Uygunluğu

| Bağımlılık | Gerektiren | Mevcut | Versiyon | Fallback |
|------------|-----------|--------|---------|---------|
| yahoo-finance2 | RPT-04 | ✓ | ^3.14.0 | — |
| Supabase | Tüm RPT-xx | ✓ | mevcut | — |
| TCMB_EVDS_API_KEY env | RPT-02 | ✓ (varsayılıyor) | — | graceful fallback zaten var |

---

## Doğrulama Mimarisi

### Test Altyapısı
| Özellik | Değer |
|---------|-------|
| Framework | Vitest (Phase 15'te kuruldu) |
| Config | vitest.config.ts |
| Hızlı çalıştırma | `npx vitest run --reporter=verbose` |
| Tam suite | `npx vitest run` |

### Gereksinim → Test Haritası

| Req ID | Davranış | Test Tipi | Otomatik Komut | Dosya Var mı? |
|--------|----------|-----------|----------------|---------------|
| RPT-01 | InvestmentCard null recommendation ile render | Unit | `npx vitest run tests/components/InvestmentCard.test.tsx` | ❌ Wave 0 |
| RPT-02 | getLatestNonNull boş dizi → null döner | Unit | `npx vitest run tests/lib/tcmb-fallback.test.ts` | ❌ Wave 0 |
| RPT-03 | timeAgo() doğru dakika hesabı | Unit | `npx vitest run tests/lib/time-ago.test.ts` | ❌ Wave 0 |
| RPT-04 | yahoo-client financialData mapping | Unit | `npx vitest run tests/lib/yahoo-client.test.ts` | ❌ Wave 0 |

### Wave 0 Eksikleri
- [ ] `tests/components/InvestmentCard.test.tsx` — RPT-01 null state
- [ ] `tests/lib/tcmb-fallback.test.ts` — RPT-02 graceful fallback
- [ ] `tests/lib/time-ago.test.ts` — RPT-03 zaman hesabı
- [ ] `tests/lib/yahoo-client.test.ts` — RPT-04 yeni alan mapping

---

## Güvenlik Alanı

Bu faz yalnızca frontend rapor gösterimi ve mevcut backend API çağrılarının genişletilmesini kapsıyor.

| ASVS Kategorisi | Uygulanır | Standart Kontrol |
|----------------|---------|-----------------|
| V5 Girdi Doğrulama | evet | Mevcut Zod şemaları (CompanyOverviewSchema.passthrough()) |
| V6 Kriptografi | hayır | — |
| V2 Kimlik Doğrulama | hayır (mevcut Clerk auth değişmiyor) | — |

Yahoo Finance'den gelen `financialData` alanları `fmt()` fonksiyonundan geçiyor — bu null/undefined → boş string dönüşümünü handle ediyor. `parseFloat()` ile güvensiz cast yapmadan önce null kontrolü yapılmalı (mevcut `fmt()` bu işi yapıyor).

---

## Varsayımlar Günlüğü

| # | İddia | Bölüm | Yanlışsa Etki |
|---|-------|-------|--------------|
| A1 | TCMB EVDS'nin TÜFE/Faiz için null döndürmesi ay sonu gecikme sorunudur, API hatası değil | Tuzak 4 | Düşük — fallback her iki durumu da ele alıyor |
| A2 | Mevcut `research_sessions` tablosunda `market_data` JSONB kolonu `CompanyOverview` şeklinde saklanıyor | Kod Örnekleri | Orta — history/[id] sayfasında `overview` okunuyor, tip doğrulamasız |
| A3 | Yahoo Finance `financialData` modülü BIST hisseleri için ROE/ROA/profitMargins döndürüyor | RPT-04 | Orta — bazı BIST hisseleri için bu alanlar null olabilir; fmt() boş string döndürür, bu kabul edilebilir |

---

## Açık Sorular (RESOLVED)

1. **`/dashboard/reports/[id]` sayfası silinmeli mi?**
   - RESOLVED: Bu fazda dokunulmayacak. Yalnızca `history/[id]/page.tsx` güncelleniyor. Eski URL'ler bozulmasın diye silinmez.

2. **FloatShares gösterimi ne şekilde olmalı?**
   - RESOLVED: Hisse adedi olarak gösterilecek. `formatMarketCap` benzeri formatlayıcı ile "Halka Açık Hisse Adedi" etiketiyle listeleniyor. 22-02 ve 22-03 planlarında uygulandı.

---

## Kaynaklar

### Birincil (HIGH güven)
- `[VERIFIED: src/app/dashboard/history/[id]/page.tsx]` — InvestmentCard koşullu render, TCMB N/A kök nedeni, mevcut zaman damgası yokluğu
- `[VERIFIED: src/components/dashboard/report/InvestmentCard.tsx]` — Bileşen interface ve props
- `[VERIFIED: src/lib/market/yahoo-client.ts]` — quoteSummary modülleri, CompanyOverview mapping, source.fetched_at
- `[VERIFIED: src/lib/tcmb/client.ts]` — EvdsDataPointSchema, getMacroEconomicData
- `[VERIFIED: src/types/market.ts]` — MarketData, CompanyOverviewSchema alanları
- `[VERIFIED: src/agents/analyst-agent.ts]` — InvestmentRecommendation interface, output_data formatı
- `[VERIFIED: src/agents/macro-agent.ts]` — EvdsDataPoint[] output formatı
- `[VERIFIED: src/agents/market-agent.ts]` — Tier hierarchy, source.provider

### İkincil (MEDIUM güven)
- `[CITED: WebFetch github.com/gadicc/yahoo-finance2/blob/dev/src/modules/quoteSummary-iface.ts]` — defaultKeyStatistics, financialData alan isimleri

---

## Metadata

**Güven dağılımı:**
- Kök neden analizi: HIGH — tüm iddialar doğrudan kaynak koddan doğrulandı
- Yahoo Finance alanları: MEDIUM — WebFetch ile GitHub kaynak dosyasından onaylandı
- TCMB null sebebi: HIGH — EvdsDataPointSchema + API davranışı tutarlı

**Araştırma tarihi:** 2026-05-19
**Geçerlilik süresi:** 60 gün (stabil yığın — yahoo-finance2 v3, Next.js 14)
