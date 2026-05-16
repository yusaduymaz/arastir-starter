# Phase 13, Plan 13-04: Live Market Data for Dashboard Ticker - Research

**Researched:** 2026-05-16
**Domain:** Real-time financial data integration (Yahoo Finance, TCMB EVDS), Next.js server-side caching
**Confidence:** HIGH

## Summary

Dashboard'daki MarqueeTicker ve TRENDING bolumu su anda tamamen hardcoded veri kullaniyor. Mevcut altyapi zaten Yahoo Finance (`yahoo-finance2`) ve TCMB EVDS client'larini iceriyor. Hedef: bu client'lari kullanarak canli veri cekmek, 5-15dk cache ile sunmak ve mevcut UI bilesenlerini beslemek.

**Ana bulgu:** `yahoo-finance2` v3 dogrudan `quote()` metoduna bir dizi sembol gecirilmesini destekliyor -- tek HTTP isteginde 13+ BIST hissesi, EUR/TRY ve altin (GLDTR.IS ETF veya GC=F futures) verisi cekilebilir. TCMB EVDS ise EUR/TRY icin `TP.DK.EUR.A` seri kodunu destekliyor.

**Primary recommendation:** Yeni bir `src/lib/market/ticker-data.ts` modulu olustur; `unstable_cache` ile 10dk TTL vererek Yahoo Finance quote() batch cagrisini cache'le. Dashboard server component'i bu fonksiyonu cagirsin, MarqueeTicker'a props olarak gecirsin.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Ticker data fetching | API / Backend (Server Component) | -- | API key'ler server-side, client'a expose edilmemeli |
| Data caching | Frontend Server (Next.js unstable_cache) | In-memory cache (mevcut) | Next.js data cache SSR icin ideal |
| MarqueeTicker rendering | Browser / Client | -- | CSS animation, `use client` directive |
| TRENDING section | Frontend Server (SSR) | -- | Static render server component icinde |
| EUR/TRY, Gold pricing | API / Backend (TCMB EVDS + Yahoo) | -- | TCMB API key server-only |

## Standard Stack

### Core (Mevcut - yeni kurulum gerekmez)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| yahoo-finance2 | ^3.14.0 (current: 3.14.1) | BIST hisse, doviz, emtia fiyatlari | Projede zaten mevcut, quota yok, batch destegi var [VERIFIED: npm registry] |
| next | 14.2.5 | Server components, unstable_cache, route handlers | Projede mevcut [VERIFIED: package.json] |
| zod | ^3.25.76 | Runtime data validation | Projede zaten mevcut, TCMB client'ta kullaniliyor [VERIFIED: package.json] |

### Supporting (Mevcut)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TCMB EVDS client | internal | EUR/TRY kuru (TP.DK.EUR.A) | Alternatif/fallback doviz kuru icin |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Yahoo Finance for EUR/TRY | TCMB EVDS (TP.DK.EUR.A) | TCMB resmi kaynak ama gunluk guncellenir; Yahoo realtime |
| Yahoo Finance for Gold | TCMB EVDS gold series | TCMB altin seri kodu dogrulanmadi; Yahoo GC=F veya GLDTR.IS daha guvenilir |
| unstable_cache | Route Handler + SWR | Client-side polling ekler, kompleksite artar, gereksiz |

## Architecture Patterns

### System Architecture Diagram

```
[Dashboard Page (Server Component)]
          |
          v
[getTickerData() - unstable_cache, 10min TTL]
          |
          +----> [Yahoo Finance quote(symbols[])] ----> Yahoo API
          |           |
          |           v
          |      BIST stocks + EURTRY=X + GC=F
          |
          +----> [TCMB EVDS fetchSeries()] ----> TCMB EVDS API
          |           |
          |           v
          |      EUR/TRY (TP.DK.EUR.A) -- fallback/ek veri
          |
          v
[MarqueeTicker (Client Component)] <-- props olarak data
[TRENDING Section (Server rendered)] <-- ayni data
```

### Recommended Project Structure

```
src/
├── lib/
│   └── market/
│       ├── yahoo-client.ts     # mevcut - tekil hisse
│       ├── client.ts           # mevcut - full market data
│       └── ticker-data.ts      # YENI - batch ticker fetch + cache
├── components/
│   └── ui/
│       └── MarqueeTicker.tsx   # GUNCELLE - props kabul etsin
└── app/
    └── dashboard/
        └── page.tsx            # GUNCELLE - getTickerData() cagir
```

### Pattern 1: unstable_cache ile Server-Side Data Caching

**What:** `unstable_cache` Next.js 14'te `fetch` kullanmayan async fonksiyonlarin sonuclarini cache'lemek icin kullanilir.
**When to use:** yahoo-finance2 gibi SDK'lar native `fetch` yerine kendi HTTP client'larini kullandiginda.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/unstable_cache
import { unstable_cache } from 'next/cache';

const getTickerData = unstable_cache(
  async () => {
    // Yahoo Finance batch call
    const yahooFinance = new YahooFinance();
    const quotes = await yahooFinance.quote(TICKER_SYMBOLS, {}, { validateResult: false });
    return quotes;
  },
  ['dashboard-ticker-data'], // cache key
  {
    revalidate: 600, // 10 dakika
    tags: ['market-data'],
  }
);
```

### Pattern 2: Yahoo Finance Batch Quote

**What:** `quote()` metodu string[] kabul eder, tek HTTP isteginde birden fazla sembol sorgular.
**When to use:** Dashboard ticker gibi birden fazla hisse fiyati gerektiginde.

```typescript
// Source: https://jsr.io/@gadicc/yahoo-finance2/doc/modules/quote [VERIFIED]
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

// Tek istekte 13+ sembol
const symbols = [
  'THYAO.IS', 'EREGL.IS', 'SASA.IS', 'ASELS.IS', 'GARAN.IS',
  'AKBNK.IS', 'KCHOL.IS', 'TUPRS.IS', 'BIMAS.IS', 'FROTO.IS',
  'PGSUS.IS', 'TOASO.IS', 'VESTL.IS',
  'EURTRY=X',  // EUR/TRY doviz kuru
  'TRY=X',     // USD/TRY doviz kuru
  'GC=F',      // Gold futures (USD cinsinden)
];

const results = await yahooFinance.quote(symbols, {}, { validateResult: false });
// results: Quote[] -- her sembol icin regularMarketPrice, regularMarketChange, etc.
```

### Pattern 3: MarqueeTicker'a Props Gecirme

**What:** Hardcoded TICKERS sabitini kaldirip, server component'tan props olarak veri iletme.
**When to use:** MarqueeTicker gibi `use client` bilesenlerinde server-fetched data gosterirken.

```typescript
// MarqueeTicker.tsx
'use client'

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
}

interface MarqueeTickerProps {
  data: TickerItem[];
}

export function MarqueeTicker({ data }: MarqueeTickerProps) {
  const doubled = [...data, ...data]; // marquee animasyonu icin
  // ... render
}
```

### Anti-Patterns to Avoid

- **Client-side API cagrilari:** API key'leri client bundle'a koyma. Server component'ta veya route handler'da cagir.
- **Her render'da yeni fetch:** `unstable_cache` olmadan her sayfa yuklemesinde Yahoo API'ye istek atar -- rate limit riski.
- **Hardcoded fallback gizleme:** API hatalarinda kullaniciya "veri alinamadi" gostermek yerine eski hardcoded veriyi gosterme. Kullanici yanlis bilgi gorur.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Batch stock quotes | Her hisse icin ayri HTTP istegi + Promise.all | `yahoo-finance2` quote(string[]) | Tek istek, tek yanit, cok daha hizli |
| Server-side caching | Custom Map + setTimeout cache | `unstable_cache` from next/cache | Next.js Data Cache ile entegre, revalidation destegi |
| Gold price in TRY | Manual XAU/USD * USD/TRY hesaplama | Yahoo `GC=F` veya `GLDTR.IS` dogrudan | Kur donusumu hataya acik, ETF zaten TRY bazli |
| Doviz kuru formatlama | Manual string manipulation | `Intl.NumberFormat` | Locale-aware, edge case'leri handle eder |

## Common Pitfalls

### Pitfall 1: `force-dynamic` ile unstable_cache Catismasi

**What goes wrong:** Dashboard page'de `export const dynamic = 'force-dynamic'` mevcut. Bu, sayfa her istekte yeniden render edilir ama `unstable_cache` yine de cache'ten serve eder.
**Why it happens:** `force-dynamic` sadece route rendering'i etkiler, `unstable_cache` bagimsiz calisiyor.
**How to avoid:** Bu aslinda istedigimiz davranis -- sayfa auth icin dynamic ama ticker data 10dk cache'li. Ek bir sey yapmaya gerek yok.
**Warning signs:** Eger cache hiç calismiyorsa, `revalidate: 0` veya baska bir override olup olmadigini kontrol et.

### Pitfall 2: Yahoo Finance Rate Limiting (Gizli)

**What goes wrong:** yahoo-finance2 resmi olarak rate limit bildirmez ama cok fazla istekte gecici ban yenebilirsin.
**Why it happens:** Batch quote tek istek olsa da, cok sik (her request'te) cagirilirsa sorun olabilir.
**How to avoid:** `unstable_cache` ile minimum 5-10dk revalidate süresi koy. Mevcut in-memory cache `client.ts`'de 15dk TTL ile zaten var.
**Warning signs:** `null` donusler, "Too Many Requests" hatalari.

### Pitfall 3: TCMB EVDS Hafta Sonu / Tatil Boslugu

**What goes wrong:** TCMB EVDS hafta sonlari ve resmi tatillerde veri yayinlamiyor. `fetchSeries()` bos dizi donebilir.
**Why it happens:** Merkez bankasi sadece is gunleri veri yayinlar.
**How to avoid:** Son gecerli veriyi cache'te tut. Eger yanit bossa, onceki cache'i kullanmaya devam et (stale-while-revalidate).
**Warning signs:** Pazartesi sabahi ilk istekte bos veri.

### Pitfall 4: MarqueeTicker Re-render Performansi

**What goes wrong:** MarqueeTicker CSS animasyonu sifirlanir eger component unmount/remount olursa.
**Why it happens:** React key degisikligi veya parent re-render.
**How to avoid:** `data` prop'unu JSON.stringify ile karsilastir, gereksiz re-render'i onle. Veya key'i sabit tut.
**Warning signs:** Marquee animasyonu her navigasyonda bastan baslar.

### Pitfall 5: Gold Price -- TCMB vs Yahoo Fark

**What goes wrong:** TCMB altin fiyati (eger bulunursa) kapanista belirlenir, Yahoo Finance GC=F ise realtime. Ikisi arasinda fark olabilir.
**Why it happens:** Farkli veri kaynaklari farkli zamanlama ile guncellenir.
**How to avoid:** Tek kaynak sec. Yahoo `GLDTR.IS` (Borsa Istanbul Gold ETF) TRY bazli ve realtime.
**Warning signs:** Altin fiyati guncel olmayan bir deger gosteriyor.

## Code Examples

### Ornek 1: ticker-data.ts -- Batch Fetch + Cache

```typescript
// src/lib/market/ticker-data.ts
import { unstable_cache } from 'next/cache';
import YahooFinance from 'yahoo-finance2';

export interface TickerQuote {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
}

const BIST_SYMBOLS = [
  'THYAO.IS', 'EREGL.IS', 'SASA.IS', 'ASELS.IS', 'GARAN.IS',
  'AKBNK.IS', 'KCHOL.IS', 'TUPRS.IS', 'BIMAS.IS', 'FROTO.IS',
  'PGSUS.IS', 'TOASO.IS', 'VESTL.IS',
];

const FX_AND_COMMODITY_SYMBOLS = [
  'TRY=X',      // USD/TRY
  'EURTRY=X',   // EUR/TRY
  'GC=F',       // Gold (USD/oz) -- veya GLDTR.IS (TRY bazli ETF)
];

const ALL_SYMBOLS = [...BIST_SYMBOLS, ...FX_AND_COMMODITY_SYMBOLS];

async function fetchTickerData(): Promise<TickerQuote[]> {
  const yahooFinance = new YahooFinance();

  const results: any[] = await yahooFinance.quote(
    ALL_SYMBOLS,
    {},
    { validateResult: false }
  );

  return results
    .filter((q: any) => q && q.regularMarketPrice != null)
    .map((q: any) => {
      const symbol = q.symbol?.replace('.IS', '') || q.symbol;
      const displaySymbol = mapDisplaySymbol(symbol);
      const change = q.regularMarketChange ?? 0;
      const changePct = q.regularMarketChangePercent ?? 0;

      return {
        symbol: displaySymbol,
        price: formatPrice(q.regularMarketPrice, q.symbol),
        change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
        changePercent: `${changePct.toFixed(2)}%`,
        up: change >= 0,
      };
    });
}

function mapDisplaySymbol(symbol: string): string {
  const map: Record<string, string> = {
    'TRY=X': 'DOLAR',
    'EURTRY=X': 'EURO',
    'GC=F': 'ALTIN',
    'GLDTR': 'ALTIN',
  };
  return map[symbol] || symbol;
}

function formatPrice(price: number, symbol: string): string {
  // Altin ons fiyati binlerce USD, TRY cinsinden gostermek icin
  if (symbol === 'GC=F') {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export const getTickerData = unstable_cache(
  fetchTickerData,
  ['dashboard-ticker-data'],
  {
    revalidate: 600, // 10 dakika
    tags: ['market-data'],
  }
);
```

### Ornek 2: Dashboard Page Entegrasyonu

```typescript
// src/app/dashboard/page.tsx (degisiklik)
import { getTickerData } from '@/lib/market/ticker-data';

export default async function DashboardPage() {
  // ... mevcut auth ve supabase logic

  // Canli ticker verisi
  const tickerData = await getTickerData();

  // TRENDING icin en yuksek hacimli/degisimli hisseleri sec
  const trending = tickerData
    .filter(t => !['DOLAR', 'EURO', 'ALTIN'].includes(t.symbol))
    .sort((a, b) => Math.abs(parseFloat(b.changePercent)) - Math.abs(parseFloat(a.changePercent)))
    .slice(0, 6);

  return (
    <main>
      <MarqueeTicker data={tickerData} />
      {/* TRENDING section artik canli veriyle */}
    </main>
  );
}
```

### Ornek 3: TCMB EVDS EUR/TRY (Alternatif/Fallback)

```typescript
// TCMB EVDS'den EUR/TRY cekmek icin (zaten client.ts'de fetchSeries mevcut)
import { fetchSeries } from '@/lib/tcmb/client';

// EUR/TRY seri kodu: TP.DK.EUR.A
const today = new Date();
const startDate = `${String(today.getDate()).padStart(2,'0')}-${String(today.getMonth()+1).padStart(2,'0')}-${today.getFullYear()}`;

const eurData = await fetchSeries('TP.DK.EUR.A', startDate, startDate, '1');
// eurData[0]?.TP_DK_EUR_A -> "41.8900" gibi bir string
```

## TCMB EVDS Series Codes

### Dogrulanan Seri Kodlari

| Series Code | Field Name | Description | Confidence |
|-------------|-----------|-------------|------------|
| TP.DK.USD.A | TP_DK_USD_A | USD/TRY Alis Kuru | HIGH [VERIFIED: codebase + multiple sources] |
| TP.DK.EUR.A | TP_DK_EUR_A | EUR/TRY Alis Kuru | HIGH [VERIFIED: github.com/fatihmete/evds, evds PyPI docs] |
| TP.DK.EUR.A.YTL | TP_DK_EUR_A_YTL | EUR/TRY Alis (alternatif format) | MEDIUM [CITED: evds PyPI package examples] |
| TP.FG.J0 | TP_FG_J0 | TUFE (Tuketici Fiyat Endeksi) | HIGH [VERIFIED: codebase] |
| TP.MK.B.A2 | TP_MK_B_A2 | TCMB Politika Faizi | HIGH [VERIFIED: codebase] |

### Altin (Gold) Seri Kodu -- DOGRULANAMADI

| Series Code | Data Group | Description | Confidence |
|-------------|-----------|-------------|------------|
| bie_mkaltytl | Data Group | Altin Fiyatlari (TL) | MEDIUM [CITED: EVDS portal URL structure] |
| TP.DK.XAU.A (?) | Unknown | Gold buying price (tahmin) | LOW [ASSUMED] |

**Onemli Not:** TCMB EVDS'de altin fiyati seri kodu kesin olarak dogrulanamadi. Web arastirmasi `bie_mkaltytl` veri grubunun var oldugunu gosteriyor ama icindeki seri kodlari EVDS portal'a login olmadan erisilemez durumda. **Oneri: Altin icin Yahoo Finance kullan (GC=F veya GLDTR.IS).**

## Yahoo Finance Symbol Reference

| Symbol | Description | Currency | Notes |
|--------|-------------|----------|-------|
| THYAO.IS | Turk Hava Yollari | TRY | BIST |
| EREGL.IS | Eregli Demir Celik | TRY | BIST |
| SASA.IS | SASA Polyester | TRY | BIST |
| ASELS.IS | Aselsan | TRY | BIST |
| GARAN.IS | Garanti BBVA | TRY | BIST |
| AKBNK.IS | Akbank | TRY | BIST |
| KCHOL.IS | Koc Holding | TRY | BIST |
| TUPRS.IS | Tupras | TRY | BIST |
| BIMAS.IS | BIM | TRY | BIST |
| FROTO.IS | Ford Otosan | TRY | BIST |
| PGSUS.IS | Pegasus | TRY | BIST |
| TOASO.IS | Tofas Otomobil | TRY | BIST |
| VESTL.IS | Vestel Elektronik | TRY | BIST |
| TRY=X | USD/TRY | TRY | Forex pair |
| EURTRY=X | EUR/TRY | TRY | Forex pair [VERIFIED: Yahoo Finance] |
| GC=F | Gold Futures | USD | COMEX, ons cinsinden |
| GLDTR.IS | Istanbul Gold Type B ETF | TRY | BIST, TRY bazli [VERIFIED: Yahoo Finance] |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `unstable_cache` | `use cache` directive | Next.js 16 | Projemiz Next 14.2.5 kullandiginden `unstable_cache` hala dogru secim [VERIFIED: Next.js docs] |
| yahoo-finance (v1) | yahoo-finance2 (v3) | 2022 | v3 class-based, batch quote destegi, TypeScript native |
| EVDS2 endpoint | EVDS3 endpoint (evds3.tcmb.gov.tr) | 2024 | Yeni endpoint, header-based API key zorunlu (Nisan 2024) -- projemiz zaten buna uyumlu [VERIFIED: codebase] |
| `export const revalidate = N` | `unstable_cache` per-function | Next 14+ | Daha granular kontrol, route-level yerine function-level cache |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | TCMB EVDS altin seri kodu TP.DK.XAU.A olabilir | TCMB EVDS Series Codes | Dusuk risk -- Yahoo Finance (GC=F, GLDTR.IS) primary kaynak olarak onerildi |
| A2 | EURTRY=X Yahoo Finance'ta gecerli sembol | Yahoo Finance Symbol Reference | Orta risk -- calismiyorsa TRY=X ve EURUSD=X ile hesaplanabilir |
| A3 | yahoo-finance2 v3 quote() array kabul eder | Architecture Patterns | Dusuk risk -- resmi JSR dokumantasyonu ve GitHub source ile dogrulandi |

## Open Questions

1. **TCMB EVDS Altin Seri Kodu**
   - What we know: `bie_mkaltytl` veri grubu var, icinde altin fiyat serileri olmali
   - What's unclear: Tam seri kodu (TP.xxx.xxx formatinda) dogrulanamadi
   - Recommendation: Yahoo Finance GLDTR.IS (TRY bazli Istanbul Gold ETF) veya GC=F (USD) kullan. TCMB altin verisine ihtiyac duyulursa, EVDS portal'a login olup seri kodu bulunmali.

2. **GLDTR.IS vs GC=F Altin Gosterimi**
   - What we know: GLDTR.IS TRY bazli ama ETF (NAV farki olabilir). GC=F USD bazli ons fiyati.
   - What's unclear: Kullanici hangi formatta altin gormek istiyor? Gram vs ons?
   - Recommendation: `GLDTR.IS` kullan -- TRY bazli, Borsa Istanbul'da islem goren ETF, ticker'a dogal uyumlu. Eger fiyat cok dusuk/garip gorunurse GC=F'yi USD/TRY ile carparak gram'a cevir.

3. **Dashboard `force-dynamic` ile Cache Davranisi**
   - What we know: `export const dynamic = 'force-dynamic'` sayfa duzeyinde mevcut. `unstable_cache` bundan bagimsiz calisir.
   - What's unclear: Production'da Vercel uzerinde bu kombinasyon dogru calisacak mi?
   - Recommendation: Sorun yok -- `unstable_cache` Data Cache kullanir, `force-dynamic` sadece Full Route Cache'i devre disi birakir. Resmi dokumantasyon bunu destekliyor.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| yahoo-finance2 | Batch ticker quotes | OK | ^3.14.0 | Alpha Vantage (rate limited) |
| TCMB EVDS API Key | EUR/TRY fallback | OK (env var) | -- | Yahoo EURTRY=X |
| Next.js unstable_cache | Server-side caching | OK | 14.2.5 | In-memory Map cache (mevcut pattern) |
| Node.js | Runtime | OK | -- | -- |

**Missing dependencies:** Yok -- tum gerekli araclar mevcut.

## Sources

### Primary (HIGH confidence)
- [Next.js 14 unstable_cache docs](https://nextjs.org/docs/app/api-reference/functions/unstable_cache) - API reference, parametreler, ornek kullanim
- [Next.js 14 Data Fetching, Caching and Revalidating](https://nextjs.org/docs/14/app/building-your-application/data-fetching/fetching-caching-and-revalidating) - Cache stratejileri
- [yahoo-finance2 quote module (JSR)](https://jsr.io/@gadicc/yahoo-finance2/doc/modules/quote) - Array destegi, return types
- [yahoo-finance2 GitHub source](https://github.com/gadicc/yahoo-finance2/blob/dev/src/modules/quote.ts) - TypeScript overloads dogrulama
- npm registry: yahoo-finance2 current version 3.14.1

### Secondary (MEDIUM confidence)
- [evds PyPI package](https://pypi.org/project/evds/) - TP.DK.EUR.A.YTL kullanim ornegi
- [github.com/fatihmete/evds](https://github.com/fatihmete/evds) - TP.DK.EUR.A.YTL seri kodu dogrulama
- [Yahoo Finance GLDTR.IS](https://finance.yahoo.com/quote/GLDTR.IS/) - Istanbul Gold ETF varligi
- [Yahoo Finance EURTRY=X](https://finance.yahoo.com/quote/EURTRY=X/) - EUR/TRY pair varligi (URL'den cikarim)
- [R-bloggers CBRT guide](https://www.r-bloggers.com/2024/12/unlocking-cbrt-data-in-r-a-guide-to-the-cbrt-r-package/) - bie_mkaltytl data group

### Tertiary (LOW confidence)
- TCMB EVDS altin seri kodu (dogrulanamadi -- portal login gerekli)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - tum kutuphaneler projede mevcut, versiyonlar dogrulandi
- Architecture: HIGH - unstable_cache + batch quote pattern resmi dokumantasyonla destekleniyor
- Pitfalls: MEDIUM - bazi pitfall'lar deneyimsel, production'da test gerekli

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stabil kutuphaneler, yavas degisim)
