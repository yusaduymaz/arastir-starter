# Milestones

## v22 — Rapor Kalitesi & Veri Zenginleştirme

**Shipped:** 2026-05-20  
**Phase:** 22 | **Plans:** 4 | **Commits:** 18  
**Timeline:** 2026-05-19 → 2026-05-20 (2 days)

### Delivered

Phase 22 closed critical quality gaps in the Araştır report page:

1. **InvestmentCard always visible** — removed conditional guard; card renders in null state with "Yatırım tavsiyesi analiz edilemedi." fallback when analyst agent fails
2. **TCMB graceful fallback** — `getLatestNonNull()` backward-scan helper replaces single-entry access; TÜFE and Faiz show "Veri henüz yayınlanmadı" instead of "N/A" when EVDS publication is delayed
3. **Data freshness timestamps** — `timeAgo()` + `agent_runs` query surfaces "X dakika önce güncellendi" on all three data blocks (market, macro, news)
4. **Temel Göstergeler card** — 6 financial ratios (P/B, Beta, ROE, ROA, Net Margin, Free Float) from Yahoo Finance `quoteSummary`/`financialData` module; missing fields show "-"
5. **Wave 0 TDD validation** — 4 test files with 34 tests covering all 4 requirements; Nyquist-compliant; 9 security threats closed

### Requirements

RPT-01 ✅ | RPT-02 ✅ | RPT-03 ✅ | RPT-04 ✅ (4/4)

### Archived

- [milestones/v22-ROADMAP.md](milestones/v22-ROADMAP.md) — full phase details
- [milestones/v22-REQUIREMENTS.md](milestones/v22-REQUIREMENTS.md) — requirements archive
- [milestones/v22-MILESTONE-AUDIT.md](milestones/v22-MILESTONE-AUDIT.md) — audit report (passed)
