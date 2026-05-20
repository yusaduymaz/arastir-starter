---
phase: 22
slug: rapor-kalitesi-veri-zenginlestirme
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-20
audited: 2026-05-20
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.6 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/` |
| **Full suite command** | `npx vitest run tests/` |
| **Estimated runtime** | ~3s |
| **Environments** | `node` (default) · `jsdom` (InvestmentCard — per-file override) |
| **Plugins** | `@vitejs/plugin-react` (JSX transform for jsdom tests) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/`
- **After every plan wave:** Run `npx vitest run tests/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|------|--------|
| 22-00-01 | 00 | 0 | RPT-01 | T-22-00-01 | InvestmentCard action contract (AL/TUT/SAT) | unit | `npx vitest run tests/components/InvestmentCard.test.tsx` | ✅ | ✅ green |
| 22-00-01 | 00 | 0 | RPT-01 | — | InvestmentCard score normalization (0-10 → 0-100%) | unit | `npx vitest run tests/components/InvestmentCard.test.tsx` | ✅ | ✅ green |
| 22-01-01 | 01 | 1 | RPT-01 | T-22-01-02 | InvestmentCard renders AL(Buy) label with valid recommendation | integration (jsdom) | `npx vitest run tests/components/InvestmentCard.test.tsx` | ✅ | ✅ green |
| 22-01-01 | 01 | 1 | RPT-01 | T-22-01-02 | InvestmentCard null → shows "// Yatırım tavsiyesi analiz edilemedi." without crash | integration (jsdom) | `npx vitest run tests/components/InvestmentCard.test.tsx` | ✅ | ✅ green |
| 22-01-01 | 01 | 1 | RPT-01 | T-22-01-02 | InvestmentCard minimal props (score=5, confidence=orta, empty keyFactors) renders without crash | integration (jsdom) | `npx vitest run tests/components/InvestmentCard.test.tsx` | ✅ | ✅ green |
| 22-00-02 | 00 | 0 | RPT-02 | T-22-01-01 | getLatestNonNull returns last non-null value | unit | `npx vitest run tests/lib/tcmb-fallback.test.ts` | ✅ | ✅ green |
| 22-00-02 | 00 | 0 | RPT-02 | T-22-01-01 | getLatestNonNull returns null when all null/ND/empty | unit | `npx vitest run tests/lib/tcmb-fallback.test.ts` | ✅ | ✅ green |
| 22-01-02 | 01 | 1 | RPT-02 | T-22-01-01 | getLatestNonNull — empty array, ND skip, field name variants | unit | `npx vitest run tests/lib/tcmb-fallback.test.ts` | ✅ | ✅ green |
| 22-00-03 | 00 | 0 | RPT-03 | T-22-02-01 | timeAgo 1-min, 1-hr, null, ISO string, 30s, 5min, undefined | unit | `npx vitest run tests/lib/time-ago.test.ts` | ✅ | ✅ green |
| 22-02-01 | 02 | 2 | RPT-03 | T-22-02-01 | timeAgo contract covers all cases used in page.tsx | unit | `npx vitest run tests/lib/time-ago.test.ts` | ✅ | ✅ green |
| 22-00-04 | 00 | 0 | RPT-04 | — | CompanyOverviewSchema accepts PBRatio/Beta/ROE/ROA/NetMargin/FloatShares via passthrough | unit | `npx vitest run tests/lib/yahoo-client.test.ts` | ✅ | ✅ green |
| 22-00-04 | 00 | 0 | RPT-04 | — | Schema accepts absent fields; Symbol-only parse succeeds | unit | `npx vitest run tests/lib/yahoo-client.test.ts` | ✅ | ✅ green |
| 22-03-01 | 03 | 1 | RPT-04 | — | ROE value passes through schema unchanged (multiplication in yahoo-client, not schema) | unit | `npx vitest run tests/lib/yahoo-client.test.ts` | ✅ | ✅ green |
| 22-02-02 | 02 | 2 | RPT-04 | T-22-02-03 | Temel Göstergeler null-safe display: null/undefined/empty → '-', non-empty preserved | unit | `npx vitest run tests/lib/temel-gostergeler.test.ts` | ✅ | ✅ green |
| 22-02-02 | 02 | 2 | RPT-04 | T-22-02-03 | Temel Göstergeler % prefix: ROE/ROA/NetMargin display logic | unit | `npx vitest run tests/lib/temel-gostergeler.test.ts` | ✅ | ✅ green |
| 22-02-02 | 02 | 2 | RPT-04 | — | FloatShares label substitution: ' TL' → ' hisse' | unit | `npx vitest run tests/lib/temel-gostergeler.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All covered by 22-00 plan. Infrastructure complete:

- [x] `tests/components/InvestmentCard.test.tsx` — RPT-01 contract stubs (Wave 0) + render tests (post-audit)
- [x] `tests/lib/tcmb-fallback.test.ts` — RPT-02 getLatestNonNull inline contract
- [x] `tests/lib/time-ago.test.ts` — RPT-03 timeAgo inline contract
- [x] `tests/lib/yahoo-client.test.ts` — RPT-04 CompanyOverviewSchema passthrough

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rapor sayfasında piyasa verisi zaman damgası görünüyor | RPT-03 | Next.js server component; agent_runs Supabase query — no mock | Yeni rapor oluştur, `/dashboard/history/[id]` aç, "X dakika önce güncellendi" metnini kontrol et |
| Makro/Haber bölümü başlıklarında agent tamamlanma zamanı görünüyor | RPT-03 | agent_runs query; Supabase bağlantısı gerekli | Aynı sayfa; Makro ve Haber başlıklarında timeAgo metni görünmeli |
| Temel Göstergeler kartı ekranda doğru görünüyor | RPT-04 | Server component with real Supabase data | THYAO gibi tüm alanları dolu bir hisse için rapor aç; F/DD, Beta, ROE, ROA, Net Marj, Halka Açık Hisse Adedi görünmeli; eksik alanlar '-' göstermeli |

---

## Validation Audit 2026-05-20

| Metric | Count |
|--------|-------|
| Gaps found | 2 (PARTIAL: InvestmentCard render, MISSING: Temel Göstergeler) |
| Resolved | 2 |
| Escalated to manual | 0 |
| New test files | 1 (`tests/lib/temel-gostergeler.test.ts`) |
| Tests added | 16 (3 render + 13 display logic) |
| Final suite | 34 passed / 34 total |

---

## Validation Sign-Off

- [x] All tasks have automated verify or manual-only justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-20
