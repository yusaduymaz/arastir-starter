---
phase: 22-rapor-kalitesi-veri-zenginlestirme
plan: "01"
subsystem: report-quality
tags: [frontend, investmentcard, tcmb, macro-data, typecheck, vitest]

requires:
  - 22-00
provides:
  - "InvestmentCard null-safe fallback state"
  - "History report unconditional InvestmentCard render"
  - "TCMB macro table latest non-null fallback helper"
affects:
  - src/components/dashboard/report/InvestmentCard.tsx
  - src/app/dashboard/history/[id]/page.tsx
  - tsconfig.json

requirements-completed:
  - RPT-01
  - RPT-02

duration: 18min
completed: 2026-05-19
---

# Phase 22 Plan 01: InvestmentCard & TCMB Fallback Summary

Investment recommendation rendering and TCMB macro display fallbacks are implemented for the dashboard history report page.

## Accomplishments

- `InvestmentCard` now accepts `InvestmentRecommendation | null`.
- Null recommendation state now renders a fallback card with `// Yatırım tavsiyesi analiz edilemedi.` instead of accessing action styles.
- `/dashboard/history/[id]` now renders `InvestmentCard` unconditionally using `recommendation={investmentRec ?? null}`.
- Added `getLatestNonNull(data, field)` helper to scan TCMB macro rows from newest to oldest and ignore `null`, empty string, and `ND`.
- Macro table now uses latest non-null values for USD/TRY, TUFE, and policy rate.
- TUFE and policy rate now show `Veri henüz yayınlanmadı` when no usable value exists.
- Added `vitest/globals` to `tsconfig.json` so Phase 22 Wave 0 tests typecheck under `tsc --noEmit`.

## Verification

- `npx tsc --noEmit` passed.
- `npx vitest run tests/` passed: 4 files, 18 passed, 3 todo.
- Confirmed `recommendation: InvestmentRecommendation | null` exists in `InvestmentCard.tsx`.
- Confirmed `recommendation={investmentRec ?? null}` exists in `history/[id]/page.tsx`.
- Confirmed `investmentRec &&` no longer appears in `history/[id]/page.tsx`.
- Confirmed `getLatestNonNull` and `Veri henüz yayınlanmadı` exist in the history report page.

## Deviations from Plan

- `tsconfig.json` was updated to include `vitest/globals`. This was required because the Wave 0 tests use Vitest global APIs and were included by the repo TypeScript config, causing `tsc --noEmit` to fail before this plan could satisfy its verification gate.

## Known Stubs

- `tests/components/InvestmentCard.test.tsx` still contains 3 `it.todo` entries from Phase 22-00. Runtime tests pass with those todos unchanged.

## Next Phase Readiness

- Plan 22-02 can proceed with report time display and remaining quality improvements.
