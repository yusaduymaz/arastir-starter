---
phase: 22-rapor-kalitesi-veri-zenginlestirme
plan: "02"
subsystem: report-ui
tags: [frontend, timeago, timestamp, financial-ratios, history-page]

requires:
  - 22-00
  - 22-01
  - 22-03

provides:
  - "timeAgo helper ve zaman damgası UI (piyasa, makro, haber)"
  - "Temel Göstergeler kartı (P/B, Beta, ROE, ROA, Net Marj, Halka Açık Hisse Adedi)"

affects:
  - src/app/dashboard/history/[id]/page.tsx

requirements-completed:
  - RPT-03
  - RPT-04

duration: 8min
completed: 2026-05-20
---

# Phase 22 Plan 02: timeAgo Zaman Damgası + Temel Göstergeler Kartı

History rapor sayfasına veri tazeliği göstergesi ve yeni finansal rasyo kartı eklendi.

## Accomplishments

- `timeAgo(fetchedAt)` helper eklendi (diffMs < 60_000 kontrolü ile Wave 0 sözleşmesiyle uyumlu)
- `agent_runs` tablosundan macro ve news agent tamamlanma zamanları sorgulanıyor
- Piyasa verisi zaman damgası Rapor İstatistikleri kartında görünüyor
- Makro Göstergeler bölümü başlığında TCMB agent tamamlanma zamanı görünüyor
- Haber Duygu Analizi bölümü başlığında news agent tamamlanma zamanı görünüyor
- Temel Göstergeler kartı: F/DD, Beta, ROE, ROA, Net Kar Marjı, Halka Açık Hisse Adedi satırları
- Eksik rasyo değerleri '-' olarak gösterilir; bileşen hiçbir durumda patlamaz
- `formatMarketCap` FloatShares için yeniden kullanıldı (' TL' → ' hisse' ile etiket değiştirildi)

## Verification

- `npx tsc --noEmit` — TypeScript hata yok ✓
- `npx vitest run tests/` — 4 dosya, 18 passed, 3 todo ✓
- `grep -n "timeAgo" history/[id]/page.tsx` — 4 eşleşme ✓
- `grep -n "agent_runs" history/[id]/page.tsx` — 1 eşleşme ✓
- `grep -n "Temel Gostergeler" history/[id]/page.tsx` — 1 eşleşme ✓
- `grep -n "PBRatio\|ROE\|ROA\|Halka" history/[id]/page.tsx` — 5 eşleşme ✓

## Task Commits

1. **Görev 1: timeAgo + agent_runs + zaman damgası UI** — `5754f0a`
2. **Görev 2: Temel Finansal Göstergeler kartı** — `ca09667`

## Deviations from Plan

- `timeAgo` impl: Plan `diffMin < 1` yerine Wave 0 sözleşmesine uygun `diffMs < 60_000` kullanıldı (30sn edge case düzeltmesi — 22-00-SUMMARY'de belgelenmiş)
- Haber Duygu Analizi başlığı: Plan basit `span.block` kullanıyordu; zaman damgasını satır içinde yanyana yerleştirmek için `flex items-center justify-between` wrapper eklendi

## Self-Check: PASSED
