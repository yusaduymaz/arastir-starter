# Phase 23: Teknik Analiz - Pattern Map

**Mapped:** 2025-02-12
**Files analyzed:** 3
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/dashboard/report/PriceChart.tsx` | component | visualization | `src/components/dashboard/report/MacroChart.tsx` | role-match |
| `src/lib/market/technical-indicators.ts` | utility | transform | `src/lib/ticker-extractor.ts` | role-match |
| `src/components/dashboard/report/RelativePerformance.tsx` | component | visualization | `src/components/dashboard/MarketDataCard.tsx` | role-match |

## Pattern Assignments

### `src/components/dashboard/report/PriceChart.tsx` (component, visualization)

**Analog:** `src/components/dashboard/report/MacroChart.tsx`

**Imports pattern** (lines 3-3):
```typescript
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
```

**Core pattern** (lines 28-56):
```typescript
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #22c55e30',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: '#e2e8f0',
            }}
          />
          <Line yAxisId="left" type="monotone" dataKey="usdTry" stroke="#facc15" strokeWidth={2} dot={false} name="USD/TRY" />
          <Line yAxisId="right" type="monotone" dataKey="faiz" stroke="#ef4444" strokeWidth={2} dot={false} name="Faiz %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
```

**Error handling pattern** (lines 25-25):
```typescript
  if (data.length === 0) return null
```

---

### `src/lib/market/technical-indicators.ts` (utility, transform)

**Analog:** `src/lib/ticker-extractor.ts`

**Imports pattern** (lines 1-1):
```typescript
// Pure TypeScript utility, no external imports except types if needed
```

**Core pattern** (lines 135-144):
```typescript
export interface TickerExtractionResult {
  ticker: string;
  originalQuery: string;
  context: string;
  method: 'direct_ticker' | 'known_ticker_in_query' | 'company_name' | 'first_word_fallback';
  queryType: 'ticker' | 'topic';
  topicKeywords?: string;
}

export function extractTicker(rawQuery: string): TickerExtractionResult {
  const query = rawQuery.trim();
  // Transform logic
  return { ... };
}
```

---

### `src/components/dashboard/report/RelativePerformance.tsx` (component, visualization)

**Analog:** `src/components/dashboard/MarketDataCard.tsx`

**Imports pattern** (lines 1-2):
```typescript
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
```

**Core pattern** (lines 35-41):
```typescript
        <div className="flex flex-col items-end">
          <span className="text-xs text-on-surface-variant mb-1">Günlük Değişim</span>
          <span className={`text-lg font-bold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {data.change_percent ? `${isPositive ? '+' : ''}${data.change_percent.toFixed(2)}%` : 'N/A'}
          </span>
        </div>
```

**Error handling pattern** (lines 13-20):
```typescript
  if (!data) {
    return (
      <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center h-full text-on-surface-variant">
        <BarChart2 className="mb-2 opacity-50" size={32} />
        <p className="text-sm">Piyasa verisi bulunamadı.</p>
      </div>
    );
  }
```

---

## Shared Patterns

### Recharts Styling
**Source:** `src/components/dashboard/report/MacroChart.tsx`
**Apply to:** All chart components
```typescript
  contentStyle={{
    backgroundColor: '#0a0a0a',
    border: '1px solid #22c55e30',
    borderRadius: '8px',
    fontFamily: 'JetBrains Mono',
    fontSize: '11px',
    color: '#e2e8f0',
  }}
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| None | - | - | All files have matching analogs |

## Metadata

**Analog search scope:** `src/components/**/*`, `src/lib/**/*`
**Files scanned:** 12+
**Pattern extraction date:** 2025-02-12