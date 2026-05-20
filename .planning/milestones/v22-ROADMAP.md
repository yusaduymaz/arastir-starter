# Milestone v22: Rapor Kalitesi & Veri Zenginleştirme

**Status:** ✅ SHIPPED 2026-05-20  
**Phase:** 22  
**Total Plans:** 4 (22-00, 22-01, 22-02, 22-03)  
**Timeline:** 2026-05-19 → 2026-05-20 (2 days)  
**Git range:** `06ea431` → `73eb591` (18 commits)  
**Tests:** 34/34 passing | **Security:** 9/9 threats closed | **Nyquist:** compliant

---

## Overview

Phase 22 closed critical quality gaps in the report page. Delivered: AL/TUT/SAT investment recommendation card always visible (null-safe fallback), TCMB macro data graceful fallback with backward-scan helper, data freshness timestamps on all three data blocks, and Temel Göstergeler card with 6 financial ratios (P/B, Beta, ROE, ROA, Net Margin, Free Float) sourced from Yahoo Finance quoteSummary.

---

## Phase 22: Rapor Kalitesi & Veri Zenginleştirme

**Goal:** Rapordaki kritik eksikleri kapat: AL/TUT/SAT tavsiyesini görünür kıl, TCMB verilerindeki N/A sorununu düzelt, her veri bloğuna "son güncelleme" zaman damgası ekle ve Yahoo Finance'dan çekilen temel finansal rasyoları genişlet (P/B, ROE, ROA, Beta, Free Float, Net Marj).

**Depends on:** Phase 21  
**Requirements:** RPT-01, RPT-02, RPT-03, RPT-04

**Success Criteria (all met):**
1. ✅ Rapor sayfasının üst kısmında AL/TUT/SAT kartı (InvestmentCard) güven skoru ile birlikte her zaman görünür.
2. ✅ TCMB endpoint'i TÜFE ve Politika Faizi verisini dönemediğinde "N/A" yerine son bilinen değeri veya "Veri henüz yayınlanmadı" metnini gösterir.
3. ✅ Fiyat, makro ve haber bloklarının her birinde "X dakika önce güncellendi" şeklinde zaman damgası gösterilir.
4. ✅ Rapor sayfasında P/B, ROE, ROA, Beta, Net Marj ve Free Float rasyoları Temel Göstergeler kartında listelenir.
5. ✅ Yeni rasyolar Yahoo Finance `quoteSummary` endpoint'inden çekilir; eksik alan varsa "-" ile gösterilir.

**Plans:**
- [x] 22-00-PLAN.md — Wave 0 TDD Red Test Infrastructure
- [x] 22-01-PLAN.md — AL/TUT/SAT Kartı Entegrasyonu & TCMB Graceful Fallback
- [x] 22-02-PLAN.md — Stale Data Timestamp & Temel Finansal Rasyolar
- [x] 22-03-PLAN.md — Yahoo Finance quoteSummary Genişletmesi & Tip Güncellemeleri

---

## Milestone Summary

### Key Deliverables

1. **InvestmentCard null-safe rendering** — removed conditional `{investmentRec && ...}` guard; card always renders with `recommendation={investmentRec ?? null}`; fallback state shows "// Yatırım tavsiyesi analiz edilemedi."
2. **getLatestNonNull TCMB backward-scan** — helper scans macro_data from newest to oldest, skipping null/ND/empty values; TÜFE and Faiz show "Veri henüz yayınlanmadı" instead of "N/A"
3. **Data freshness timestamps** — `timeAgo()` helper + `agent_runs` query; "X dakika önce güncellendi" shown on market, macro, and news data blocks
4. **Temel Göstergeler card** — F/DD (P/B), Beta, ROE, ROA, Net Kar Marjı, Halka Açık Hisse Adedi; empty fields show "-"; card always renders when `overview` exists
5. **CompanyOverviewSchema extension** — 6 new fields (PBRatio, Beta, FloatShares, ROE, ROA, NetMargin) with `.default('')`; backward-compatible with Alpha Vantage path
6. **Yahoo Finance financialData module** — `quoteSummary` extended with `financialData` module; ROE/ROA/NetMargin converted from 0-1 ratio to percentage string

### Key Decisions

- **Wave 0 TDD approach:** Inline function contracts in test files documented the expected behavior before implementation; Wave 1 moved them to production code.
- **it.todo for InvestmentCard Wave 0:** `@vitejs/plugin-react` not installed, so JSX test files could not be imported in vitest node environment; post-audit added jsdom environment with React plugin.
- **timeAgo edge case:** `diffMs < 60_000` check instead of `diffMin < 1` to handle `Math.round(0.5) = 1` edge case for 30-second timestamps.
- **Inline gap closure (milestone completion):** 3 RPT gaps (RPT-01 InvestmentCard guard, RPT-02 getLatestNonNull absent, RPT-04 visibility guard) closed inline in 1 commit rather than creating a formal Phase 22.1.

### Issues Resolved

- InvestmentCard never visible when analyst agent fails or LLM omits investmentRecommendation field
- TCMB TÜFE/Faiz showing "N/A" when latest EVDS entry has null values (delayed publication)
- 22-01-SUMMARY.md contained false verification claims; corrected by audit + inline fix

### Issues Deferred

- InvestmentCard.test.tsx still has 3 `it.todo` stubs from Wave 0 (render contract tests; not blocking)
- timeAgo NaN cosmetic issue on invalid ISO timestamps (AR-22-02, accepted risk)
- REQUIREMENTS.md traceability table never received Phase 22 RPT entries (documentation gap, not a functional issue)

### Technical Debt Incurred

- `CompanyOverviewSchema` uses `any` via `.passthrough()` for unrecognized fields from Yahoo Finance API; explicit schema would be stricter
- `getLatestNonNull` typed as `Record<string, unknown>[]` — could be tightened to the actual EVDS data point type

---

*For current project status, see .planning/ROADMAP.md*
