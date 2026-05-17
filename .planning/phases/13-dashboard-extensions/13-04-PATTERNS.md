# Phase 13-04: Live Market Data & MarqueeTicker - Pattern Map

**Mapped:** 2026-05-16
**Files analyzed:** 5
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/api/market/ticker/route.ts` | API route | request-response | `src/app/api/research/status/route.ts` | exact |
| `src/components/ui/MarqueeTicker.tsx` | component (modify) | data-driven presentation | `src/components/ui/MarqueeTicker.tsx` (self) | exact |
| `src/lib/tcmb/client.ts` | service (extend) | request-response | `src/lib/tcmb/client.ts` (self) | exact |
| `src/app/dashboard/page.tsx` | page (modify) | SSR data-fetching | `src/app/dashboard/page.tsx` (self) | exact |
| `src/lib/market/ticker-service.ts` | service (new) | CRUD/aggregation | `src/lib/market/client.ts` | role-match |

## Pattern Assignments

### `src/app/api/market/ticker/route.ts` (API route, request-response)

**Analog:** `src/app/api/research/status/route.ts` (lines 1-35)

Bu projede API route'lari su kaliptadir:
- `NextResponse.json()` ile JSON yanit
- `auth()` ile Clerk authentication
- Supabase istemcisi olusturma (service role key)
- try/catch ile hata yonetimi
- Turkce hata mesajlari

**Imports pattern** (lines 1-3):
```typescript
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
```

**Auth pattern** (lines 6-8):
```typescript
export async function GET(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Response pattern** (lines 28-30):
```typescript
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

**NOT:** Bu route auth gerektirmeyebilir (ticker verisi public). Eger public yapilacaksa `auth()` satiri kaldirilir ama `try/catch` + `NextResponse.json` kalir. Ayrica `src/app/api/research/[id]/route.ts` da ayni patterni kullanir (lines 9-12):

```typescript
const { userId } = auth();
if (!userId) {
  return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
}
```

---

### `src/components/ui/MarqueeTicker.tsx` (component, modify to accept props)

**Analog:** Kendisi (mevcut hali) - `src/components/ui/MarqueeTicker.tsx` (lines 1-70)

Mevcut yapida veri hardcoded bir `TICKERS` array'i olarak component icinde tanimli. Yeni yaklasim: veriyi props olarak almali ve fallback olarak hardcoded veri kullanmali.

**Mevcut hardcoded data pattern** (lines 3-20):
```typescript
const TICKERS = [
  { symbol: 'THYAO', price: '312.40', change: '+2.34%', up: true },
  { symbol: 'EREGL', price: '48.72', change: '-0.82%', up: false },
  // ...
]
```

**TickerItem sub-component pattern** (lines 22-38):
```typescript
function TickerItem({ symbol, price, change, up }: typeof TICKERS[0]) {
  return (
    <div className="flex items-center gap-2 px-6 border-r border-[#22c55e]/10 shrink-0">
      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#c5c6cc] tracking-widest">
        {symbol}
      </span>
      <span className="font-['JetBrains_Mono'] text-xs text-white">{price}</span>
      <span
        className={`font-['JetBrains_Mono'] text-xs font-bold ${
          up ? 'text-[#22c55e]' : 'text-red-400'
        }`}
      >
        {up ? '▲' : '▼'} {change}
      </span>
    </div>
  )
}
```

**Component export pattern** (lines 40-70):
```typescript
export function MarqueeTicker() {
  const doubled = [...TICKERS, ...TICKERS]
  return (
    <div className="relative w-full bg-[#050505] border border-[#22c55e]/15 rounded-lg overflow-hidden scanlines">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="flex items-center py-2.5 marquee-wrapper">
        <div className="marquee-track">
          {doubled.map((t, i) => (
            <TickerItem key={`${t.symbol}-${i}`} {...t} />
          ))}
        </div>
      </div>
      {/* LIVE indicator */}
      ...
    </div>
  )
}
```

**Donusum stratejisi:** 
1. `TickerData` tipini tanimla: `{ symbol: string; price: string; change: string; up: boolean }`
2. Props interface'i ekle: `{ tickers?: TickerData[] }`
3. Mevcut `TICKERS` array'i `DEFAULT_TICKERS` olarak koru (fallback)
4. `'use client'` directive korunur (marquee animasyonu client-side)

---

### `src/lib/tcmb/client.ts` (service, extend with new series)

**Analog:** Kendisi - `src/lib/tcmb/client.ts` (lines 1-208)

**Mevcut seri kodlari** (lines 11-17 + 139):
```typescript
const EvdsDataPointSchema = z.object({
  Tarih: z.string(),
  TP_DK_USD_A: z.string().nullable().optional(), // Dolar Kuru (Alis)
  TP_FG_J0: z.string().nullable().optional(),    // Tuketici Fiyat Endeksi (TUFE)
  TP_MK_B_A2: z.string().nullable().optional(),  // TCMB Politika Faizi
  UNIXTIME: z.object({ '$numberLong': z.string() }).optional(),
}).passthrough(); // Tanimlanmamis ek alanlari kabul et
```

Mevcut `getMacroEconomicData` fonksiyonu 3 seri kullaniyor (line 139):
```typescript
const series = 'TP.DK.USD.A-TP.FG.J0-TP.MK.B.A2';
const formulas = '0-0-0';
const aggregationTypes = 'avg-avg-avg';
```

**fetchFromEvds genel cagri pattern** (lines 64-119):
```typescript
const fetchFromEvds = async (
  seriesCodes: string,
  startDate: string,
  endDate: string,
  options: {
    frequency?: string;
    formulas?: string;
    aggregationTypes?: string;
  } = {}
): Promise<unknown> => {
  const apiKey = getApiKey();
  // ...URL olustur...
  const response = await fetch(url, { headers: { 'key': apiKey } });
  if (!response.ok) { throw new Error(...) }
  // ...json parse ve hata kontrolu...
  return data;
};
```

**fetchSeries tek seri cekme pattern** (lines 177-191):
```typescript
export const fetchSeries = async (
  seriesCode: string,
  startDate: string,
  endDate: string,
  frequency: string = '1'
): Promise<Record<string, unknown>[]> => {
  const data = await fetchFromEvds(seriesCode, startDate, endDate, { frequency });
  const responseResult = EvdsResponseSchema.safeParse(data);
  if (responseResult.success) {
    return responseResult.data.items;
  }
  throw new Error('Unexpected EVDS response format: ' + JSON.stringify(data).substring(0, 200));
};
```

**Eklenmesi gereken yeni seri kodlari (onerilen):**
- `TP.DK.EUR.A` - Euro kuru
- `TP.MK.F.BILESIK` - BIST 100 endeksi (alternatif: XU100 Yahoo'dan)
- `TP.DK.GBP.A` - Sterlin kuru (opsiyonel)
- Altin: `TP.DK.XAU.A` (gram altin) veya Yahoo `GC=F`

**Genisleme pattern'i:** Yeni bir `getTickerData()` fonksiyonu ekle, `.passthrough()` sayesinde yeni alanlar Zod validation'i bozmaz.

---

### `src/app/dashboard/page.tsx` (page, SSR data-fetching modification)

**Analog:** Kendisi - `src/app/dashboard/page.tsx` (lines 1-192)

**SSR data fetching pattern** (lines 39-53):
```typescript
export default async function DashboardPage() {
  const { userId } = auth();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  let history: any[] = [];
  if (userId) {
    const { data, error } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) history = data;
  }
```

**force-dynamic export** (line 9):
```typescript
export const dynamic = 'force-dynamic';
```

**MarqueeTicker kullanimi (mevcut - props'suz)** (lines 68-70):
```typescript
{/* -- Row 1: Live Ticker -- */}
<div className="blur-fade blur-fade-d1">
  <MarqueeTicker />
</div>
```

**Donusum stratejisi:** 
- Sayfa uzerinde yeni bir async `fetchTickerData()` cagrisi eklenir (Supabase sorgusunun yaninda)
- Yahoo/TCMB verileri sunucu tarafinda cekilir ve `<MarqueeTicker tickers={liveData} />` seklinde props olarak gecilir
- Hata durumunda fallback hardcoded veri kullanilir (graceful degradation)

---

### `src/lib/market/ticker-service.ts` (new service, aggregation)

**Analog:** `src/lib/market/client.ts` (lines 1-202)

Bu dosya canli ticker verisi toplamak icin yeni bir servis katmani olacak. Mevcut `client.ts` dosyasi su kaliplari kullanir:

**In-memory cache pattern** (lines 17-19):
```typescript
const CACHE_TTL_MS = 15 * 60 * 1000;
const marketCache = new Map<string, { data: MarketData; ts: number }>();
```

**Cache check + fetch pattern** (lines 162-177):
```typescript
export const getFullMarketData = async (ticker: string): Promise<MarketData> => {
  const cacheKey = ticker.toUpperCase().trim();
  const cached = marketCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log(`[Market] Cache hit for ${cacheKey} (age: ${Math.round((Date.now() - cached.ts) / 1000)}s)`);
    return cached.data;
  }
  // Primary: Yahoo Finance
  const yahooResult = await getYahooMarketData(ticker);
  if (yahooResult) {
    marketCache.set(cacheKey, { data: yahooResult, ts: Date.now() });
    return yahooResult;
  }
  // Fallback: Alpha Vantage ...
};
```

**Yahoo Finance cagri pattern** (`src/lib/market/yahoo-client.ts` lines 27-31):
```typescript
export async function getYahooMarketData(ticker: string): Promise<MarketData | null> {
  const symbol = toBistSymbol(ticker);
  try {
    const quoteRaw: any = await yahooFinance.quote(symbol, {}, { validateResult: false });
    if (!quoteRaw || !quoteRaw.regularMarketPrice) {
      console.warn(`[Yahoo] No quote data for ${symbol}`);
      return null;
    }
    // ...map to StockQuote...
  } catch (err) {
    console.warn(`[Yahoo] getYahooMarketData failed for ${symbol}:`, (err as Error).message);
    return null;
  }
}
```

**Ticker servisi icin onerilen pattern:**
1. Birden fazla ticker'i paralel olarak cek (`Promise.allSettled`)
2. In-memory cache (5dk TTL - ticker icin daha kisa)
3. Yahoo Finance primary, TCMB EVDS secondary (doviz/altin icin)
4. Her ticker icin sadece `quote` verisi yeterli (monthlySeries gereksiz)
5. Null donusu graceful handle edilmeli

---

## Shared Patterns

### Authentication (API Routes)
**Source:** `src/app/api/research/status/route.ts` lines 6-8, `src/app/api/research/[id]/route.ts` lines 9-12
**Apply to:** `src/app/api/market/ticker/route.ts` (eger auth gerekiyorsa)
```typescript
const { userId } = auth()
if (!userId) return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 })
```

### Supabase Client Init (API Routes)
**Source:** `src/app/api/research/[id]/route.ts` lines 22-29
**Apply to:** API routes that need DB access
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseServiceKey) {
  return NextResponse.json({ error: 'Sunucu yapilandirma hatasi' }, { status: 500 });
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### Supabase Client Init (Server Components)
**Source:** `src/app/dashboard/page.tsx` lines 41-43
**Apply to:** SSR data fetching in page components
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
```

### In-Memory Caching (Server-Side)
**Source:** `src/lib/market/client.ts` lines 17-19, 162-177
**Apply to:** `src/lib/market/ticker-service.ts`
```typescript
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika (ticker verisi icin kisa TTL)
const tickerCache = new Map<string, { data: TickerData[]; ts: number }>();

export async function getLiveTickerData(): Promise<TickerData[]> {
  const cached = tickerCache.get('all');
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }
  // ...fetch ve cache guncelle...
}
```

### Error Handling (API Routes)
**Source:** `src/app/api/research/[id]/route.ts` lines 57-61
**Apply to:** All API route files
```typescript
} catch (error: any) {
  console.error('API Error:', error);
  return NextResponse.json({ error: 'Sunucu hatasi' }, { status: 500 });
}
```

### Error Handling (Library Clients)
**Source:** `src/lib/market/yahoo-client.ts` lines 117-121, `src/lib/tcmb/client.ts` lines 86-98
**Apply to:** `src/lib/market/ticker-service.ts`
```typescript
// Yahoo: return null on failure (non-blocking)
} catch (err) {
  console.warn(`[Yahoo] getYahooMarketData failed for ${symbol}:`, (err as Error).message);
  return null;
}

// TCMB: throw on HTTP failure
if (!response.ok) {
  const errorBody = await response.text();
  throw new Error(`TCMB EVDS API request failed with status ${response.status}: ${errorBody.substring(0, 300)}`);
}
```

### Dynamic Page Config
**Source:** `src/app/dashboard/page.tsx` line 9
**Apply to:** Dashboard page (korunmali)
```typescript
export const dynamic = 'force-dynamic';
```

### Graceful Degradation (Fallback Data)
**Source:** `src/app/api/research/route.ts` lines 354-360 (market agent failure handling)
**Apply to:** Ticker data fetching - basarisiz olursa hardcoded fallback kullan
```typescript
// Non-critical agent failure: log but continue with fallback
if (marketResult.status === 'rejected' || !marketResult.value) {
  failedAgents.push('Market');
}
// Pipeline devam eder, rapor degraded modda uretilir
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| - | - | - | Bu plan icindeki tum dosyalarin mevcut codebase'de yakin analoglari var. |

## Metadata

**Analog search scope:** `src/app/api/`, `src/app/dashboard/`, `src/components/ui/`, `src/lib/market/`, `src/lib/tcmb/`, `src/agents/`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-16

## Summary: Implementasyon Kilavuzu

### Veri Akisi (Onerilen Mimari)
```
Dashboard Page (SSR, force-dynamic)
  |-- fetchTickerData() --> ticker-service.ts
        |-- Yahoo Finance (BIST hisseleri: THYAO, ASELS, GARAN vb.)
        |-- TCMB EVDS (Doviz: USD, EUR / Altin: XAU)
        |-- In-memory cache (5dk TTL)
  |-- <MarqueeTicker tickers={liveData} />  (props ile veri aktarimi)

API Route (Opsiyonel - client-side refresh icin)
  GET /api/market/ticker
  |-- Ayni ticker-service.ts'i kullanir
  |-- JSON response: { tickers: TickerData[] }
```

### Onemli Noktalar
1. **Next.js cache yok** - proje `force-dynamic` + in-memory Map cache tercih ediyor
2. **Yahoo Finance primary** - BIST hisseleri icin kota yok, `yahoo-finance2` paketi zaten mevcut
3. **TCMB EVDS secondary** - doviz ve altin verisi icin, `.passthrough()` sayesinde yeni seriler eklenebilir
4. **Graceful degradation** - herhangi bir kaynak basarisiz olursa hardcoded fallback kullan
5. **`'use client'` directive** - MarqueeTicker client component kalir, sadece props interface'i degisir
