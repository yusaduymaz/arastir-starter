# Araştır — Project Overview

## What This Is

An AI-powered financial research SaaS for the Turkish market. Users submit a BIST ticker or financial topic; the system dispatches a multi-agent pipeline (KAP disclosures, news, market data, macro indicators) and generates a professional research report with AL/TUT/SAT investment recommendation, PDF export, and real-time progress tracking.

## Core Value

Automate the 2–4 hour research process a Turkish retail investor performs manually — condensed into a 60-second AI report with professional-grade output.

## Current State

**Shipped:** v22 (2026-05-20)  
**Active phases:** 23 (Teknik Analiz), 24 (PDF Redesign)  
**Tech stack:** Next.js 14 App Router, TypeScript, Supabase (Realtime + DB), Clerk auth, Upstash QStash + Redis, Sentry, @react-pdf/renderer  
**Infrastructure:** Vercel (serverless), QStash async pipeline, Supabase RPC atomic token ledger, Redis rate limiting

## Requirements

### Validated

- ✓ SETUP-01: Next.js 14 TypeScript project — v1
- ✓ SETUP-02: Supabase DB + auth — v1
- ✓ SETUP-03: Project folder structure — v1
- ✓ DATA-01: TCMB EVDS API integration — v1
- ✓ DATA-02: TÜİK integration — v1
- ✓ REPORT-01: PDF generation — v2 (evolved to @react-pdf/renderer in v24)
- ✓ REPORT-02: PPTX generation — v2
- ✓ AGENT-01: Writer agent — v2
- ✓ SCRAPE-01: KAP scraper (HTTP API, no Puppeteer) — v3
- ✓ SCRAPE-02: News scrapers (Bloomberg HT + others) — v4
- ✓ AGENT-02: Search/KAP agent — v3
- ✓ AGENT-03: Analyst agent (Claude, Chain of Thought) — v4
- ✓ UI-01/02/03/04: Dashboard, results, auth, history — v5
- ✓ SAAS-01/02/03: Token system, Clerk webhooks — v6
- ✓ UX-01: Supabase Realtime agent_runs progress — v14
- ✓ UX-02: Session deletion — v12
- ✓ AI-02: Claude analyst with CoT — v7/8
- ✓ SYS-01: 6-hour report caching — v8
- ✓ RAPID-01–04: 12 RapidAPI providers — v15
- ✓ AGENT-RAPID-01/02: Multi-source market/news agents, crypto/gold/forex agents — v16
- ✓ UI-LIVE-01: Live dashboard cards — v16
- ✓ HARDEN-01–04: QStash async pipeline, atomic ledger, Redis rate limit, Sentry — v20
- ✓ UX-04/ERR-01: Error boundaries, loading states — v21
- ✓ RPT-01: InvestmentCard always visible — v22
- ✓ RPT-02: TCMB graceful fallback with backward scan — v22
- ✓ RPT-03: Data freshness timestamps — v22
- ✓ RPT-04: Temel Göstergeler (6 financial ratios) — v22

### Active

- [ ] TA-01: MA20/MA50/MA200 toggle overlays on PriceChart — Phase 23
- [ ] TA-02: RSI (14) panel with overbought/oversold zones — Phase 23
- [ ] TA-03: Volume anomaly detection + BIST100 relative performance — Phase 23
- [ ] PDF-01: Türkçe characters in PDF (ş, ı, ğ, ü, ö, ç) — Phase 24
- [ ] PDF-02: 12-section professional PDF (kapak, yönetici özeti, AL/SAT/TUT, etc.) — Phase 24
- [ ] PDF-03: Markdown → formatted PDF (no raw `#`, `**` visible) — Phase 24

### Out of Scope

- TÜİK full data portal (only TCMB EVDS used — TÜİK endpoints are unreliable)
- Mobile app — web-first; PWA acceptable
- Offline mode — real-time pipeline is core value
- Phase 6 SaaS token system — merged into Phase 11 multi-agent architecture
- Phase 9 pipeline hardening — folded into Phase 10 and later phases

## Key Decisions

| Decision | Outcome | Milestone |
|----------|---------|-----------|
| Puppeteer → HTTP API for KAP | Eliminated Chromium dependency; Vercel-compatible | v12 |
| Supabase `agent_runs` table for multi-agent logging | Open-closed architecture: new agents without schema changes | v11 |
| `token_ledger` for atomic billing | No race conditions on concurrent requests | v11/v20 |
| QStash for async pipeline | Bypasses Vercel 60s timeout; pipeline runs to completion | v20 |
| `@react-pdf/renderer` for PDF | Solved Türkçe character corruption from jsPDF/Puppeteer | v24 |
| Wave 0 TDD: inline contracts in test files | Documents expected behavior before implementation; Wave 1 imports replace stubs | v22 |
| Inline gap closure at milestone | 3-line fixes don't warrant a formal phase; audit + commit is sufficient | v22 |

## Context

**Team size:** Solo developer  
**Deployment:** Vercel + Supabase (production)  
**Languages:** TypeScript (Next.js, ~15K LOC)  
**Test coverage:** 34 vitest tests (Phase 22 scope; broader coverage TBD)  
**Known issues:** Phase 18 admin fixes listed as "Not Started" in progress table but commits suggest partial work; Phase 13 dashboard extensions never started

---
*Last updated: 2026-05-20 after v22 milestone*
