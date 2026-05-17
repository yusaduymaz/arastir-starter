# Requirements

## v1

### SETUP - Project Foundation
- **SETUP-01**: Initialize a new Next.js 14 project with TypeScript and strict mode enabled.
- **SETUP-02**: Configure Supabase for database storage (research history) and user authentication.
- **SETUP-03**: Establish the core folder structure as defined in `GEMINI.md` (`src/app`, `src/agents`, `src/lib`, etc.).

### DATA - Stable Data Integration
- **DATA-01**: Integrate with the TCMB (Central Bank) EVDS API to fetch macroeconomic data (e.g., inflation, interest rates).
- **DATA-02**: Integrate with the TÜİK (Turkish Statistical Institute) data portal to fetch statistical data (e.g., GDP, sector-specific metrics).

### REPORT - Reporting Engine
- **REPORT-01**: Implement a PDF generation module using Puppeteer to create structured reports from JSON data.
- **REPORT-02**: Implement a PPTX generation module using `pptxgenjs` to create presentation slides from JSON data.
- **AGENT-01**: Create a basic "writer" agent that takes structured JSON data and formats it for the PDF and PPTX generators.

### SCRAPE - High-Risk Data Scraping
- **SCRAPE-01**: Build a robust scraper for kap.org.tr to fetch company disclosures, handling potential anti-scraping measures.
- **SCRAPE-02**: Build scrapers for at least two financial news websites (e.g., Bloomberg HT, Dünya) to gather news articles.
- **AGENT-02**: Create a "search" agent to find relevant KAP documents and news articles for a given topic.
- **AGENT-03**: Create an "analyst" agent that can perform basic synthesis or sentiment analysis on scraped text.

### UI - User Interface
- **UI-01**: Develop a main dashboard page where users can submit new research queries.
- **UI-02**: Develop a results page where users can view, manage, and download their completed reports (PDF/PPTX).
- **UI-03**: Implement user registration and login functionality using Supabase Auth.
- **UI-04**: Display a history of past research requests for authenticated users.

## v2 (PRO Grade Features)
### UX & SCALE - Real-time & Performance
- **UX-01**: Implement real-time WebSocket progress updates for running agents so users see active percentages and current steps.
- **UX-02**: Allow users to delete their past research reports from the database and UI.
- **AI-02**: Upgrade the Analyst Agent to use "Chain of Thought" prompting for deep, professional financial analysis, producing Markdown.
- **SYS-01**: Implement a Caching mechanism. If a ticker was researched within the last 6 hours, return the cached result to save tokens, API costs, and scraping bans.

## v3 (External Market Data Expansion)

### RAPID - RapidAPI Provider Infrastructure (Phase 15)
- **RAPID-01**: Implement a typed TypeScript client for each of the 12 RapidAPI providers under `src/lib/rapidapi/<provider>/`, exposing normalized DTOs decoupled from raw provider response shapes. Providers: CNBC, Harem Altın Live Gold Price, YH Finance, Yahoo Finance Real-Time, Crypto News, Crypto Trading Indicators API-RSI, Forex API, Exchange Rates, Real-time Finance Data, Turkey Financial Data API, Turkey News Live, Finance API.
- **RAPID-02**: Validate `RAPIDAPI_<PROVIDER>_KEY` env vars at boot via `src/lib/env-check.ts`. Missing keys must not crash the app; the corresponding client short-circuits with a typed `RapidApiError` of kind `missing_key`.
- **RAPID-03**: Build a shared rate-limiter and in-memory response cache (TTL configurable per provider) used by every RapidAPI client. Cache keys must include provider, endpoint, and normalized params; TTL must default safely (e.g., 60s for price feeds, 5 min for news).
- **RAPID-04**: Define a single `RapidApiError` type with `provider`, `status`, `code`, and `retry_after` fields and a smoke test per provider gated by `RAPIDAPI_LIVE_TESTS=1` so CI is offline by default.

### AGENT-RAPID - Multi-Source Agents (Phase 16)
- **AGENT-RAPID-01**: Extend `market-agent` and `news-agent` to merge results from the RapidAPI providers with existing sources, with a documented precedence rule and provenance attached to each datum.
- **AGENT-RAPID-02**: Introduce three new agents — `crypto_agent`, `gold_agent`, `forex_agent` — registered in `agent_runs` and dispatchable per query type without altering the orchestrator schema. Each agent must debit the `token_ledger` per call using a per-provider cost table.

### UI-LIVE - Live Dashboard Cards (Phase 16)
- **UI-LIVE-01**: Dashboard renders live cards for Altın (gram/çeyrek), USD/EUR/TRY, BTC/ETH, and BIST top movers, updating via Supabase Realtime or SWR with a configurable refresh interval. Cards must show staleness and degrade gracefully when the underlying provider is unavailable.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01    | 1     | Pending |
| SETUP-02    | 1     | Pending |
| SETUP-03    | 1     | Pending |
| DATA-01     | 1     | Pending |
| DATA-02     | 1     | Pending |
| REPORT-01   | 2     | Pending |
| REPORT-02   | 2     | Pending |
| AGENT-01    | 2     | Pending |
| SCRAPE-01   | 3     | Pending |
| AGENT-02    | 3     | Pending |
| SCRAPE-02   | 4     | Pending |
| AGENT-03    | 4     | Pending |
| UI-01       | 5     | Pending |
| UI-02       | 5     | Pending |
| UI-03       | 5     | Pending |
| UI-04       | 5     | Pending |
| SAAS-01     | 6     | Pending |
| SAAS-02     | 6     | Pending |
| SAAS-03     | 6     | Pending |
| UX-01       | 8     | Pending |
| UX-02       | 8     | Pending |
| AI-02       | 8     | Pending |
| SYS-01      | 8     | Pending |
| RAPID-01    | 15    | Pending |
| RAPID-02    | 15    | Pending |
| RAPID-03    | 15    | Pending |
| RAPID-04    | 15    | Pending |
| AGENT-RAPID-01 | 16 | Pending |
| AGENT-RAPID-02 | 16 | Pending |
| UI-LIVE-01  | 16    | Pending |
