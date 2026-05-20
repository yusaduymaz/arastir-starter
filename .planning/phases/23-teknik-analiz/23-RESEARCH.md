<user_constraints>
## User Constraints (from Phase Goal)

### Locked Decisions
- PriceChart üzerine MA20/MA50/MA200 overlay'leri ve ayrı bir RSI paneli ekle.
- Hacim anomali tespiti ile anormal işlem günlerini vurgula (Ortalamanın 2 katı üstü = Turuncu/Kırmızı, tooltip = Anormal Hacim: X).
- BIST100 relative performance karşılaştırması ile hissenin endekse göre performansını göster (örn. "ASELSAN +91% | BIST100 +42%").
- Tüm hesaplamalar (MA, RSI, hacim ortalaması) istemci tarafında mevcut OHLCV verisinden türetilir; ekstra API çağrısı gerektirmez.

### the agent's Discretion
- How to structure the BIST100 comparison data model within `MarketData`.
- Which math utility pattern to use for MAs and RSI (pure custom TS vs library).

### Deferred Ideas (OUT OF SCOPE)
- None.
</user_constraints>

# Phase 23: Teknik Analiz - Research

**Researched:** 2024-05-20 (Current Session)
**Domain:** Data Visualization (Recharts) & Client-side Technical Analysis
**Confidence:** HIGH

## Summary

The goal of this phase is to enrich the existing `PriceChart` component with technical overlays (MA20, MA50, MA200), add a separate RSI(14) panel below it, and highlight abnormal volume bars. Additionally, a relative performance comparison against the BIST100 index will be implemented. 

Since all calculations must occur on the client side without extra API calls, we will implement pure TypeScript utility functions for Simple Moving Average (SMA), Relative Strength Index (RSI), and Volume averages. To support daily technical indicators (like MA200), the backend data fetching mechanism (`yahoo-client.ts`) must be updated to provide **daily** OHLCV data instead of the current monthly aggregation (`interval: '1mo'`), and include the BIST100 baseline data within the same single response payload.

**Primary recommendation:** Implement custom TS functions for SMA and RSI calculation to avoid heavy dependency bloat. Use Recharts' `<ComposedChart>` to overlay MAs on price and render volume bars on a secondary Y-axis, utilizing `<Cell>` mapping for conditional volume coloring. Sync the new RSI chart panel using Recharts' `syncId`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Technical Indicators (MA, RSI) | Browser / Client | — | Requirement mandates calculating on the client from provided OHLCV array. |
| Volume Anomaly Logic | Browser / Client | — | Requirement mandates calculating 2x average volume client-side. |
| OHLCV & BIST100 Fetching | API / Backend | — | Must be bundled inside `market_data` (`yahoo-client.ts`) to avoid extra client API calls. |
| Relative Performance % | Browser / Client | — | Simple math using first and last points of the fetched BIST100 and Stock series. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `recharts` | ^3.8.1 | Charting | Already used in `PriceChart.tsx`. Supports `ComposedChart` and `syncId`. |
| `lucide-react` | ^1.14.0 | Icons | Already installed, useful for toggle switches and indicator tooltips. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom TS Math functions | `technicalindicators` (npm) | `technicalindicators` is robust but adds significant bundle weight for just SMA/RSI. Custom functions perfectly satisfy the "istemci tarafında hesapla" constraint without the extra weight. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── dashboard/
│       └── report/
│           ├── PriceChart.tsx            # Migrated to ComposedChart (Price + MA + Vol)
│           ├── RsiChart.tsx              # New: Synced chart panel for RSI
│           └── RelativePerformance.tsx   # New: Simple UI component for BIST100 comparison
└── lib/
    └── math/
        └── technical-indicators.ts       # Pure TS functions for SMA, RSI, VolAvg
```

### Pattern 1: Pure TS Client-Side Technical Indicators
**What:** Implementing SMA and RSI directly in a utility file.
**When to use:** For basic overlays on existing OHLCV arrays without incurring bundle size bloat.
**Example:**
```typescript
export function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, idx, arr) => {
    if (idx < period - 1) return null;
    const slice = arr.slice(idx - period + 1, idx + 1);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  });
}
```

### Pattern 2: ComposedChart with SyncId
**What:** Using `ComposedChart` from Recharts to combine `Area` (Price), `Line` (MAs), and `Bar` (Volume) in one SVG, and using `syncId` to link tooltips with a separate RSI chart.
**Example:**
```tsx
// Price & Volume Chart
<ComposedChart data={chartData} syncId="tech-analysis-chart">
  <XAxis dataKey="date" />
  <YAxis yAxisId="price" domain={['auto', 'auto']} />
  <YAxis yAxisId="volume" orientation="right" hide={true} />
  
  <Area yAxisId="price" type="monotone" dataKey="close" stroke="#22c55e" />
  {showMA50 && <Line yAxisId="price" type="monotone" dataKey="ma50" stroke="#facc15" dot={false} />}
  
  <Bar yAxisId="volume" dataKey="volume">
    {chartData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.volume > entry.avgVolume * 2 ? '#ea580c' : '#22c55e30'} />
    ))}
  </Bar>
</ComposedChart>

// RSI Chart (Rendered below)
<ComposedChart data={chartData} syncId="tech-analysis-chart" height={100}>
   <Line dataKey="rsi" stroke="#c084fc" dot={false} />
   <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
   <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
</ComposedChart>
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart Axis Syncing | Manual event listeners for panning/zooming | Recharts `syncId` prop | Automatically links cursors and tooltips across multiple charts (Price vs RSI panels). |
| Conditional Bar Formatting | A new chart wrapper | Recharts `<Cell>` inside `<Bar>` | Native support for customizing individual bar colors based on row properties. |

## Runtime State Inventory
> None — verified by architecture map. This is a greenfield UI enhancement; no persistent runtime state strings are altered.

## Common Pitfalls

### Pitfall 1: Insufficient Data for Moving Averages (MA200)
**What goes wrong:** The chart attempts to draw a 200-day moving average but the data payload only contains 12 months of monthly data (12 points).
**Why it happens:** `src/lib/market/yahoo-client.ts` currently fetches `interval: '1mo'` with a 1-year period.
**How to avoid:** Update `yahoo-client.ts` to fetch **daily** data (`interval: '1d'`) and ideally over a 1.5 - 2 year horizon (e.g. ~500 points). This provides enough leading points to calculate MA200 and plot it for the recent year.

### Pitfall 2: Recharts Performance on Large Datasets
**What goes wrong:** The app lags when hovering over a chart with 500+ daily data points.
**Why it happens:** Recharts renders every data point as a DOM element unless optimized.
**How to avoid:** Use `dot={false}` and `activeDot={{ r: 4 }}` on `Line`/`Area` components. Disable animation (`isAnimationActive={false}`) if necessary.

## Code Examples

### BIST100 Comparison Data Model Addition
The backend `MarketData` payload (`src/types/market.ts`) must be updated to include the benchmark series so the client has the data without making an API call:
```typescript
export interface MarketData {
  quote: StockQuote;
  overview: CompanyOverview | null;
  // Previously monthlySeries, should now contain daily data
  timeSeries: Record<string, MonthlySeriesEntry>; 
  // New benchmark data fetched concurrently by the server
  benchmarkSeries?: Record<string, MonthlySeriesEntry>; 
  source: {
    provider: string;
    fetched_at: number;
    ttl_remaining: number;
  };
}
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Backend `yahoo-client.ts` will be modified to fetch `interval: '1d'` instead of `'1mo'`. | Pitfalls | If left as `1mo`, calculating MA200 (200 months) is impossible. |
| A2 | BIST100 data fetching will be bundled into the initial `market_data` backend fetch. | Arch Map | If BIST100 isn't pre-fetched, the client violates the "no extra API call" constraint. |

## Environment Availability
Step 2.6: SKIPPED (no external dependencies identified beyond existing API connections).
