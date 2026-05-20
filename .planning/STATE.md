# Project State

## Project Reference
See: .planning/PROJECT.md (updated 2026-05-20)

**Core value:** Automate the Turkish retail investor's 2–4 hour research process into a 60-second AI report
**Current focus:** Phase 23 (Teknik Analiz) + Phase 24 (PDF Redesign)

## Current Position
- **Last Milestone**: v22 — Rapor Kalitesi & Veri Zenginleştirme (shipped 2026-05-20)
- **Current Phase**: 23
- **Status**: Ready to plan
- **Progress**: [████████████████████] v22 complete

## Performance Metrics
- **Velocity**: TBD
- **Burn Rate**: TBD
- **Time to Comp**: TBD

## Accumulated Context
### Key Decisions
- Phase 1-5 successfully executed.
- Phase 10 Wave 1 successfully executed (In-Process Agent Architecture).
- Phase 11 successfully executed. Database migrated to use `research_sessions`, `agent_runs`, and `token_ledger`.
- Phase 12 successfully executed. KAP Puppeteer removed and replaced with HTTP API. News relevance strict filtering implemented. Market/Macro frontend UI cards implemented. Session Deletion API built.
- Phase 14 successfully executed. The frontend now subscribes directly to the `agent_runs` table using Supabase Channels, providing a true parallel progress bar. The hardcoded 7-agent grid was replaced with dynamic mapping, hiding internal agents like `writer` and `orchestrator`, and displaying only relevant running data agents like "Piyasa" or "KAP Verisi".
- Phase 22-00: @testing-library/react kurulu olmadığı için InvestmentCard testinde it.todo sözleşme yaklaşımı kullanıldı. timeAgo inline fonksiyonunda diffMs < 60_000 ms kontrolü ile 30sn edge case düzeltildi.
- Phase 22-01: InvestmentCard null-safe hale getirildi ve history rapor sayfasında koşulsuz render ediliyor. TCMB makro tablosu getLatestNonNull ile son non-null değeri gösteriyor; TÜFE/Faiz yoksa "Veri henüz yayınlanmadı" metni kullanılıyor. tsconfig vitest globals ile tsc uyumlu hale getirildi.
- Phase 22-03: CompanyOverviewSchema PBRatio/Beta/FloatShares/ROE/ROA/NetMargin alanları eklendi. yahoo-client financialData modülü eklendi; ROE/ROA/NetMargin 0-1 → yüzde dönüşümü yapılıyor.
- Phase 22-02: timeAgo helper ve zaman damgası UI eklendi (piyasa/makro/haber). Temel Göstergeler kartı (P/B, Beta, ROE, ROA, Net Marj, Halka Açık Hisse Adedi) rapor sayfasında görünüyor.

### Open Questions
- (none yet)

### Blockers
- (none yet)

### Action Items (TODO)
- Phase 14, 20, 21 tamamlandı. Phases 22-23 raporun kalite eksiklerini kapatmak için eklendi.

## Session Continuity
- **Last Session**: 2026-05-20T14:22:00+03:00
- **Stopped at**: Milestone v22 archived and tagged. RPT-01/02/04 gaps closed inline (commit 73eb591).
- **Last Command**: `/gsd-complete-milestone 22`
- **Next Command**: `/gsd-new-milestone` or `/gsd-discuss-phase 23`
