---
phase: 22-rapor-kalitesi-veri-zenginlestirme
plan: "03"
subsystem: market-data
tags: [yahoo-finance, types, schema, financial-ratios]

requires:
  - 22-00

provides:
  - "CompanyOverviewSchema 6 yeni rasyo alanı: PBRatio, Beta, FloatShares, ROE, ROA, NetMargin"
  - "getYahooMarketData financialData modülü ile ROE/ROA/NetMargin veri çekimi"

affects:
  - src/types/market.ts
  - src/lib/market/yahoo-client.ts

requirements-completed:
  - RPT-04

duration: 5min
completed: 2026-05-20
---

# Phase 22 Plan 03: Yahoo Finance financialData + CompanyOverview Genişletme

CompanyOverviewSchema 6 yeni rasyo alanı ile genişletildi; yahoo-client financialData modülünü çekiyor.

## Accomplishments

- `CompanyOverviewSchema` `PBRatio`, `Beta`, `FloatShares`, `ROE`, `ROA`, `NetMargin` alanları eklendi (hepsi `z.string().default('')`)
- `CompanyOverview` tipi z.infer ile otomatik genişledi
- `getYahooMarketData` quoteSummary çağrısına `financialData` modülü eklendi
- `fd.returnOnEquity/returnOnAssets/profitMargins` değerleri `!= null` kontrolü ile 100 ile çarpılarak yüzde string'e dönüştürüldü
- `stats.priceToBook`, `stats.beta`, `stats.floatShares` fmt() ile mevcut mapping'e eklendi
- `.raw ?? value` pattern'i ile Yahoo Finance nested obje değerleri doğru alınıyor
- 4 test dosyası, 18 test geçiyor

## Verification

- `npx tsc --noEmit` — TypeScript hata yok ✓
- `npx vitest run tests/` — 4 dosya, 18 passed, 3 todo ✓
- `grep -n "PBRatio" src/types/market.ts` — 1 eşleşme ✓
- `grep -n "financialData" src/lib/market/yahoo-client.ts` — 2 eşleşme ✓
- `grep -n "returnOnEquity" src/lib/market/yahoo-client.ts` — 1 eşleşme ✓

## Task Commits

1. **Görev 1: CompanyOverviewSchema 6 yeni alan** — `5b10958`
2. **Görev 2: yahoo-client financialData + mapping** — `abb72d6`

## Self-Check: PASSED
