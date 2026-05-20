# Project State

## Project Reference
- **Name**: Araştır — AI-Powered Research Agent
- **Core Value**: To provide an AI-powered research agent for the Turkish financial market that automates data collection, synthesis, and reporting.
- **Current Focus**: Phase 22: Rapor Kalitesi & Veri Zenginleştirme (Not Started)

## Current Position
- **Current Phase**: 22
- **Current Plan**: 2
- **Status**: In Progress
- **Progress**: [█████░░░░░░░░░░░░░░░] 25%

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

### Open Questions
- (none yet)

### Blockers
- (none yet)

### Action Items (TODO)
- Phase 14, 20, 21 tamamlandı. Phases 22-23 raporun kalite eksiklerini kapatmak için eklendi.

## Session Continuity
- **Last Session**: 2026-05-19T23:47:44+03:00
- **Stopped at**: 22-01-PLAN.md tamamlandı. InvestmentCard null fallback ve TCMB latest non-null fallback doğrulandı.
- **Last Command**: `/gsd-execute-phase 22` (plan 01)
- **Next Command**: `/gsd-execute-phase 22` (plan 02)
