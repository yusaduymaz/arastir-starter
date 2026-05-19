---
phase: 22-rapor-kalitesi-veri-zenginlestirme
plan: "00"
subsystem: testing
tags: [vitest, tdd, wave0, red-green, tcmb, yahoo-finance, investmentcard, time-ago]

requires: []
provides:
  - "Wave 0 TDD red test dosyaları: InvestmentCard, tcmb-fallback, time-ago, yahoo-client"
  - "getLatestNonNull sözleşmesi (inline, 22-01 ile src/'a taşınacak)"
  - "timeAgo sözleşmesi (inline, 22-02 ile src/'a taşınacak)"
  - "CompanyOverviewSchema passthrough davranış doğrulaması"
affects:
  - 22-01-rapor-kalitesi
  - 22-02-rapor-kalitesi
  - 22-03-rapor-kalitesi

tech-stack:
  added: []
  patterns:
    - "Wave 0 TDD: inline fonksiyon → sözleşme belgeler → Wave 1 import ile değiştirilir"
    - "it.todo ile RED durumu belgeleme — gelecek implementasyon için placeholder"

key-files:
  created:
    - tests/components/InvestmentCard.test.tsx
    - tests/lib/tcmb-fallback.test.ts
    - tests/lib/time-ago.test.ts
    - tests/lib/yahoo-client.test.ts
  modified: []

key-decisions:
  - "@testing-library/react kurulu olmadığı için InvestmentCard testinde TypeScript sözleşme yaklaşımı kullanıldı (it.todo)"
  - "timeAgo inline fonksiyonunda diffMin < 1 yerine diffMs < 60_000 kontrolü — Math.round(0.5)=1 kenar durumu düzeltildi"
  - "vitest.config.ts değiştirilmedi — mevcut node environment korundu"

patterns-established:
  - "Wave 0 sözleşme dosyaları: inline tanım + WAVE 0 yorumu + hangi plan tarafından güncellenecek"

requirements-completed:
  - RPT-01
  - RPT-02
  - RPT-03
  - RPT-04

duration: 12min
completed: 2026-05-19
---

# Phase 22 Plan 00: Wave 0 TDD Red Test Dosyaları Summary

**4 Wave 0 TDD sözleşme test dosyası: InvestmentCard (it.todo RED), getLatestNonNull inline (6 test yesil), timeAgo inline (7 test yesil), CompanyOverviewSchema passthrough (3 test yesil)**

## Performance

- **Duration:** ~12 dk
- **Started:** 2026-05-19T22:27:00+03:00
- **Completed:** 2026-05-19T22:32:00+03:00
- **Tasks:** 4/4
- **Files created:** 4

## Accomplishments

- Wave 0 TDD altyapısı: 4 test dosyası `tests/` dizininde oluşturuldu
- `getLatestNonNull` ve `timeAgo` sözleşmeleri inline fonksiyonlarla belgelendi; Wave 1 implementasyonları bu sözleşmeyi karşılamalı
- `CompanyOverviewSchema.passthrough()` davranışı doğrulandı; 22-03 explicit alan eklemesi sonrası testler yeşil kalmaya devam edecek
- InvestmentCard null handling `it.todo` olarak Wave 1 için bekliyor (kasıtlı RED)

## Task Commits

1. **Görev 1: InvestmentCard.test.tsx** — `28e27ba` (test)
2. **Görev 2: tcmb-fallback.test.ts** — `c3a32d0` (test)
3. **Görev 3: time-ago.test.ts** — `4c84e81` (test)
4. **Görev 4: yahoo-client.test.ts** — `96be6f0` (test)

## Files Created

- `tests/components/InvestmentCard.test.tsx` — InvestmentCard tip sözleşmesi ve Wave 1 RED placeholder testleri
- `tests/lib/tcmb-fallback.test.ts` — getLatestNonNull inline fonksiyon ve 6 test (null, ND, empty array edge cases)
- `tests/lib/time-ago.test.ts` — timeAgo inline fonksiyon ve 7 test (dakika, saat, null, ISO string)
- `tests/lib/yahoo-client.test.ts` — CompanyOverviewSchema passthrough alan doğrulaması

## Decisions Made

- **InvestmentCard test yaklaşımı:** `@testing-library/react` kurulu olmadığı ve `@vitejs/plugin-react` eksik olduğu için JSX dosyaları doğrudan import edilemiyor. `it.todo` sözleşme yaklaşımı seçildi — davranışsal testler Wave 1'e ertelendi.
- **timeAgo edge case düzeltmesi:** Plan'da `diffMin < 1` önerilen eşik değerinde `Math.round(0.5) = 1` sorunu fark edildi. `diffMs < 60_000` ms tabanlı kontrol ile düzeltildi.
- **vitest.config.ts:** node environment korundu; esbuild JSX denendi ancak `vite:import-analysis` engeli nedeniyle geri alındı.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] timeAgo inline fonksiyonunda 30 saniye "Az önce" eşik hatası**
- **Found during:** Görev 3 (time-ago.test.ts)
- **Issue:** Plan'ın `diffMin < 1` eşiği Math.round(30000/60000) = Math.round(0.5) = 1 ürettiği için 30 saniye "1 dakika önce" döndürüyordu
- **Fix:** `diffMs < 60_000` ms kontrolü ile düzeltildi; Wave 2 implementasyonu aynı mantığı kullanmalı
- **Files modified:** tests/lib/time-ago.test.ts
- **Committed in:** 4c84e81 (Görev 3 commit)

**2. [Rule 3 - Blocking] InvestmentCard JSX import engeli — yaklaşım değiştirildi**
- **Found during:** Görev 1 (InvestmentCard.test.tsx)
- **Issue:** `@vitejs/plugin-react` kurulu olmadan vite:import-analysis JSX parse edemedi
- **Fix:** JSX import kaldırıldı; `it.todo` TypeScript sözleşme yaklaşımına geçildi
- **Files modified:** tests/components/InvestmentCard.test.tsx
- **Committed in:** 28e27ba (Görev 1 commit)

---

**Total deviations:** 2 auto-fixed (1 Bug, 1 Blocking)
**Impact on plan:** Her iki düzeltme gerekli ve kapsam dışı değil. InvestmentCard null testi kasıtlı RED olarak kaldı.

## Issues Encountered

- vitest node environment JSX dosyalarını @vitejs/plugin-react olmadan parse edemiyor — bu Wave 0 için beklenen bir kısıtlama; Wave 1'de @vitejs/plugin-react eklenebilir veya testler react olmayan yaklaşımla devam edebilir.

## Known Stubs

- `tests/components/InvestmentCard.test.tsx`: `it.todo('renders with null recommendation...')` — Wave 0'da kasıtlı stub; 22-01-PLAN.md Görev 1 tamamlandıktan sonra gerçek render testiyle değiştirilecek.

## Next Phase Readiness

- Wave 0 test dosyaları commit edildi; 22-01, 22-02, 22-03 planları bu dosyaları `depends_on` ile alabilir.
- `getLatestNonNull` ve `timeAgo` inline fonksiyonları Wave 1 implementasyonlarının karşılaması gereken sözleşmeyi belgeliyor.
- `CompanyOverviewSchema` passthrough davranışı Wave 0'da doğrulandı; 22-03 explicit alan eklemesi sonrası testler geçmeye devam edecek.

---
*Phase: 22-rapor-kalitesi-veri-zenginlestirme*
*Completed: 2026-05-19*
