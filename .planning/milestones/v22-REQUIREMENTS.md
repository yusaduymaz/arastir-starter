# Requirements Archive — v22

**Archived:** 2026-05-20  
**Milestone:** v22 — Rapor Kalitesi & Veri Zenginleştirme

This file archives the REQUIREMENTS.md as it existed at the close of milestone v22.
A fresh REQUIREMENTS.md will be created for the next milestone.

---

## Phase 22 Requirements (RPT series)

These requirements were defined in ROADMAP.md Phase 22 but were NOT included in the
REQUIREMENTS.md traceability table — a documentation gap identified during the milestone audit.

| Requirement | Description | Phase | Final Status |
|-------------|-------------|-------|-------------|
| RPT-01 | InvestmentCard (AL/TUT/SAT) always visible on report page with confidence score | 22 | ✅ satisfied |
| RPT-02 | TCMB endpoint shows last known value or "Veri henüz yayınlanmadı" instead of "N/A" when TÜFE/rate delayed | 22 | ✅ satisfied |
| RPT-03 | Price, macro, and news blocks each show "X dakika önce güncellendi" timestamp | 22 | ✅ satisfied |
| RPT-04 | P/B, ROE, ROA, Beta, Net Margin, Free Float shown in Temel Göstergeler card; missing fields show "-" | 22 | ✅ satisfied |

---

## Original REQUIREMENTS.md Content

### v1

#### SETUP - Project Foundation
- **SETUP-01**: Initialize a new Next.js 14 project with TypeScript and strict mode enabled.
- **SETUP-02**: Configure Supabase for database storage (research history) and user authentication.
- **SETUP-03**: Establish the core folder structure as defined in `GEMINI.md` (`src/app`, `src/agents`, `src/lib`, etc.).

#### DATA - Stable Data Integration
- **DATA-01**: Integrate with the TCMB (Central Bank) EVDS API to fetch macroeconomic data (e.g., inflation, interest rates).
- **DATA-02**: Integrate with the TÜİK (Turkish Statistical Institute) data portal to fetch statistical data (e.g., GDP, sector-specific metrics).

#### REPORT - Reporting Engine
- **REPORT-01**: Implement a PDF generation module using Puppeteer to create structured reports from JSON data.
- **REPORT-02**: Implement a PPTX generation module using `pptxgenjs` to create presentation slides from JSON data.
- **AGENT-01**: Create a basic "writer" agent that takes structured JSON data and formats it for the PDF and PPTX generators.

#### SCRAPE - High-Risk Data Scraping
- **SCRAPE-01**: Build a robust scraper for kap.org.tr to fetch company disclosures, handling potential anti-scraping measures.
- **SCRAPE-02**: Build scrapers for at least two financial news websites (e.g., Bloomberg HT, Dünya) to gather news articles.
- **AGENT-02**: Create a "search" agent to find relevant KAP documents and news articles for a given topic.
- **AGENT-03**: Create an "analyst" agent that can perform basic synthesis or sentiment analysis on scraped text.

#### UI - User Interface
- **UI-01**: Develop a main dashboard page where users can submit new research queries.
- **UI-02**: Develop a results page where users can view, manage, and download their completed reports (PDF/PPTX).
- **UI-03**: Implement user registration and login functionality using Supabase Auth.
- **UI-04**: Display a history of past research requests for authenticated users.

### v2 (PRO Grade Features)

#### UX & SCALE - Real-time & Performance
- **UX-01**: Implement real-time WebSocket progress updates for running agents so users see active percentages and current steps.
- **UX-02**: Allow users to delete their past research reports from the database and UI.
- **AI-02**: Upgrade the Analyst Agent to use "Chain of Thought" prompting for deep, professional financial analysis, producing Markdown.
- **SYS-01**: Implement a Caching mechanism. If a ticker was researched within the last 6 hours, return the cached result to save tokens, API costs, and scraping bans.

### v3 (External Market Data Expansion)

#### RAPID - RapidAPI Provider Infrastructure (Phase 15)
- **RAPID-01**: Implement a typed TypeScript client for each of the 12 RapidAPI providers under `src/lib/rapidapi/<provider>/`.
- **RAPID-02**: Validate `RAPIDAPI_<PROVIDER>_KEY` env vars at boot via `src/lib/env-check.ts`.
- **RAPID-03**: Build a shared rate-limiter and in-memory response cache used by every RapidAPI client.
- **RAPID-04**: Define a single `RapidApiError` type and a smoke test per provider gated by `RAPIDAPI_LIVE_TESTS=1`.

#### AGENT-RAPID - Multi-Source Agents (Phase 16)
- **AGENT-RAPID-01**: Extend `market-agent` and `news-agent` to merge results from RapidAPI providers with existing sources.
- **AGENT-RAPID-02**: Introduce three new agents — `crypto_agent`, `gold_agent`, `forex_agent` — registered in `agent_runs`.

#### UI-LIVE - Live Dashboard Cards (Phase 16)
- **UI-LIVE-01**: Dashboard renders live cards for Altın, USD/EUR/TRY, BTC/ETH, and BIST top movers.

## Traceability (Final Status at v22 Close)

| Requirement | Phase | Status at Close |
|-------------|-------|----------------|
| SETUP-01    | 1     | Delivered (Phase 1 complete) |
| SETUP-02    | 1     | Delivered (Phase 1 complete) |
| SETUP-03    | 1     | Delivered (Phase 1 complete) |
| DATA-01     | 1     | Delivered (Phase 1 complete) |
| DATA-02     | 1     | Delivered (Phase 1 complete) |
| REPORT-01   | 2     | Delivered (Phase 2 complete; later superseded by @react-pdf/renderer in Phase 24) |
| REPORT-02   | 2     | Delivered (Phase 2 complete) |
| AGENT-01    | 2     | Delivered (Phase 2 complete) |
| SCRAPE-01   | 3     | Delivered (Phase 3 complete; Puppeteer later replaced with HTTP API in Phase 12) |
| AGENT-02    | 3     | Delivered (Phase 3 complete) |
| SCRAPE-02   | 4     | Delivered (Phase 4 complete) |
| AGENT-03    | 4     | Delivered (Phase 4 complete) |
| UI-01       | 5     | Delivered (Phase 5 complete) |
| UI-02       | 5     | Delivered (Phase 5 complete) |
| UI-03       | 5     | Delivered (Phase 5 complete; later migrated to Clerk) |
| UI-04       | 5     | Delivered (Phase 5 complete) |
| SAAS-01     | 6     | Delivered (Phase 6 complete) |
| SAAS-02     | 6     | Delivered (Phase 6 complete) |
| SAAS-03     | 6     | Delivered (Phase 6 complete) |
| UX-01       | 8/14  | Delivered (Phase 14: Supabase Realtime agent_runs subscription) |
| UX-02       | 8/12  | Delivered (Phase 12: session deletion API) |
| AI-02       | 8     | Delivered (Phase 7-8: Claude-based analyst agent) |
| SYS-01      | 8     | Delivered (Phase 8: 6-hour report caching) |
| RAPID-01    | 15    | Delivered (Phase 15: 12 RapidAPI clients) |
| RAPID-02    | 15    | Delivered (Phase 15: env-check.ts) |
| RAPID-03    | 15    | Delivered (Phase 15: shared rate-limiter + cache) |
| RAPID-04    | 15    | Delivered (Phase 15: RapidApiError type + smoke tests) |
| AGENT-RAPID-01 | 16 | Delivered (Phase 16: market/news agent multi-source) |
| AGENT-RAPID-02 | 16 | Delivered (Phase 16: crypto/gold/forex agents) |
| UI-LIVE-01  | 16    | Delivered (Phase 16: live dashboard cards) |
| RPT-01      | 22    | ✅ Delivered (Phase 22: InvestmentCard always visible) |
| RPT-02      | 22    | ✅ Delivered (Phase 22: TCMB graceful fallback) |
| RPT-03      | 22    | ✅ Delivered (Phase 22: timeAgo timestamps) |
| RPT-04      | 22    | ✅ Delivered (Phase 22: Temel Göstergeler card) |
