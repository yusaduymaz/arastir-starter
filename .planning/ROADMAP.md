# Araştır — Project Roadmap

This roadmap outlines the development phases for the Araştır project. It is designed to tackle low-risk, high-value tasks first to build a functioning core, while isolating high-risk dependencies (like web scraping) into later, dedicated phases.

## Phases
- [ ] **Phase 1: Foundation & Stable Data** - Establish the core project structure and integrate with reliable, official APIs (TCMB, TÜİK).
- [ ] **Phase 2: Core Reporting Engine** - Build the capability to generate PDF and PPTX reports from the stable data collected in Phase 1.
- [ ] **Phase 3: High-Risk Data Integration - KAP** - Focus exclusively on the critical and challenging task of scraping data from kap.org.tr.
- [ ] **Phase 4: High-Risk Data Integration - News** - Expand scraping capabilities to include dynamic financial news websites.
- [ ] **Phase 5: User-Facing Application** - Develop the web interface for user interaction, including authentication, query submission, and results management.

## Phase Details

### Phase 1: Foundation & Stable Data
**Goal**: Establish the project's technical foundation and build a data pipeline using reliable, low-risk, official APIs to prove the data-gathering concept.
**Depends on**: Nothing
**Requirements**: SETUP-01, SETUP-02, SETUP-03, DATA-01, DATA-02
**Success Criteria** (what must be TRUE):
  1. The Next.js application runs locally and connects to the Supabase database.
  2. The project has the documented folder structure for agents, libraries, and components.
  3. A script or agent can successfully fetch and store macroeconomic data from the TCMB's EVDS API.
  4. A script or agent can successfully fetch and store statistical data from the TÜİK data portal.
**Plans**: TBD

### Phase 2: Core Reporting Engine
**Goal**: Create the full reporting pipeline by generating PDF and PPTX outputs from the stable data gathered in the previous phase. This delivers the first end-to-end value.
**Depends on**: Phase 1
**Requirements**: REPORT-01, REPORT-02, AGENT-01
**Success Criteria** (what must be TRUE):
  1. An agent can take a structured JSON file of TCMB/TÜİK data and trigger a PDF report generation.
  2. The generated PDF contains correctly formatted text and charts based on the input data.
  3. An agent can trigger a PPTX presentation generation from the same JSON data.
  4. The generated PPTX contains a title slide and at least one data slide with a chart.
**Plans**: 3 plans
Plans:
- [ ] 02-01-PLAN.md — Implement PDF Generator Module
- [ ] 02-02-PLAN.md — Implement PPTX Generator Module
- [ ] 02-03-PLAN.md — Implement Writer Agent and CLI Runner

### Phase 3: High-Risk Data Integration - KAP
**Goal**: Isolate and tackle the single most critical and fragile dependency: scraping official company disclosures from the Public Disclosure Platform (KAP).
**Depends on**: Phase 1
**Requirements**: SCRAPE-01, AGENT-02
**Success Criteria** (what must be TRUE):
  1. The system can retrieve the 5 most recent disclosures for a given BIST ticker (e.g., "THYAO") from kap.org.tr.
  2. The content of the disclosures is successfully extracted and saved into a structured JSON format.
  3. The scraping process can run on a schedule without being blocked for at least three consecutive attempts.
  4. The fetched KAP data can be manually fed into the reporting engine from Phase 2 to produce a basic report.
**Plans**: 3 plans
Plans:
- [ ] 03-01-PLAN.md — Setup KAP Data Models and Stealth Scraper Foundation
- [ ] 03-02-PLAN.md — Implement the KAP DOM extraction logic
- [ ] 03-03-PLAN.md — Create the 'search' agent and integrate it with the KAP scraper module

### Phase 4: High-Risk Data Integration - News
**Goal**: Expand data sources by scraping less-structured, dynamic news content from major financial news outlets.
**Depends on**: Phase 1
**Requirements**: SCRAPE-02, AGENT-03
**Success Criteria** (what must be TRUE):
  1. The system can retrieve the 3 most recent articles about a specific company from Bloomberg HT.
  2. The main text content of the articles is extracted, cleaned of ads/boilerplate, and stored.
  3. A basic sentiment (positive, negative, neutral) can be assigned to each retrieved article.
**Plans**: 3 plans
Plans:
- [ ] 04-01-PLAN.md — Setup News Data Models and Sentiment Analysis
- [ ] 04-02-PLAN.md — Implement News Scraper
- [ ] 04-03-PLAN.md — Create News Agent

### Phase 5: User-Facing Application
**Goal**: Build the complete user experience, allowing users to sign up, request research, and receive their generated reports through a web interface.
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. A new user can create an account and log in.
  2. An authenticated user can submit a research query from a web form.
  3. When a report is ready, the user can see it on their dashboard and download the PDF and PPTX files.
  4. A user's dashboard displays a list of their past and current research requests.
**Plans**: 3 plans
Plans:
- [ ] 05-01-PLAN.md — Setup Supabase SSR Auth
- [ ] 05-02-PLAN.md — Build Dashboard and Research API
- [ ] 05-03-PLAN.md — Build History View and Results

### Phase 6: SaaS & Token System
**Goal**: Transition the app into a SaaS product by managing user tokens, limits, and pricing tiers.
**Depends on**: Phase 5
**Requirements**: SAAS-01, SAAS-02, SAAS-03
**Success Criteria** (what must be TRUE):
  1. Users are saved in the `users` table automatically via Clerk webhooks.
  2. Users start on the 'free' tier with a default token balance.
  3. Research queries deduct tokens. Insufficient tokens block the request.
  4. The UI displays the current tier and remaining token balance.
**Plans**: 3 plans
Plans:
- [ ] 06-01-PLAN.md — Setup Database Schema for Users and Tokens
- [ ] 06-02-PLAN.md — Implement Clerk Webhooks for User Sync
- [ ] 06-03-PLAN.md — Enforce Token Consumption & Update UI

### Phase 7: Refactoring & AI Synthesis
**Goal**: Address core stability issues by refactoring web scrapers, replacing hardcoded dummy data with actual AI-driven synthesis, and fixing the dashboard UX.
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5
**Requirements**: REFACTOR-01, AI-01, UI-05
**Success Criteria** (what must be TRUE):
  1. The KAP and News scrapers successfully retrieve data without failing silently.
  2. An LLM agent (e.g., Anthropic) is used to read scraped data and generate a real qualitative analysis report instead of a hardcoded table.
  3. The PDF and PPTX outputs contain this newly generated AI analysis.
  4. The Dashboard accurately reflects pipeline status and errors without UI glitches.
**Plans**: 3 plans
Plans:
- [ ] 07-01-PLAN.md — Refactor Scrapers for Reliability
- [ ] 07-02-PLAN.md — Implement True AI Analyst Agent
- [ ] 07-03-PLAN.md — Polish Dashboard UX and Pipeline Integration

### Phase 8: Enterprise UX & Scaling
**Goal**: Elevate the prototype into a production-ready SaaS product with live tracking, resource caching, and deep, professional AI synthesis.
**Depends on**: Phase 7
**Requirements**: UX-01, UX-02, AI-02, SYS-01
**Success Criteria** (what must be TRUE):
  1. Supabase Realtime pushes progress updates (e.g., 25%, 50%, 75%) to the frontend dashboard.
  2. Users can delete their completed or failed reports.
  3. The API checks for recent (<= 6 hours) reports for the same ticker and returns them instantly to save scraper load and LLM costs.
  4. The AI Analysis output is professional, deep, and formatted nicely in the final PDFs.
**Plans**: 4 plans
Plans:
- [ ] 08-01-PLAN.md — Supabase Progress Columns & Deletion API
- [ ] 08-02-PLAN.md — Backend Real-Time Progress Emitters & Caching
- [ ] 08-03-PLAN.md — Advanced AI Prompting & Report Polish
- [ ] 08-04-PLAN.md — Dashboard Live Tracking & UI Interactivity

### Phase 10: Vercel-Ready Pipeline Refactor
**Goal**: Fix the broken pipeline architecture — eliminate child-process/file-system dependency, replace Puppeteer KAP scraper with HTTP API, fix news search relevance, and store all data in Supabase for Vercel deployment.
**Depends on**: Phase 9
**Requirements**: VERCEL-01, PIPELINE-01, KAP-01, NEWS-01
**Success Criteria** (what must be TRUE):
  1. No agent writes to or reads from the local filesystem — all data flows through Supabase.
  2. KAP disclosures are fetched via HTTP API (no Puppeteer) and filtered by company.
  3. News results are relevant to the specific query (not generic Turkish business news).
  4. Pipeline progress updates in real-time (no more 5% stuck).
  5. The application is deployable to Vercel (no child_process, no puppeteer-extra, no fs-based data exchange).
**Plans**: 4 plans
Plans:
- [x] 10-01-PLAN.md — In-Process Agent Architecture + DB Storage (Wave 1)
- [ ] 10-02-PLAN.md — Replace Puppeteer KAP with HTTP API (Wave 2)
- [ ] 10-03-PLAN.md — Fix News Search Relevance + Query Type Awareness (Wave 2)
- [ ] 10-04-PLAN.md — Frontend: Market & Macro Data Display + Skipped Agent UX (Wave 3)

### Phase 11: Multi-Agent SaaS Architecture Redesign
**Goal**: Completely overhaul the database architecture and orchestrator to support an open-closed multi-agent system and professional SaaS ledger-based billing. Move away from monolithic 'god tables' and hardcoded agent lists towards an event-driven, scalable model.
**Depends on**: Phase 10
**Requirements**: ARCH-01, SAAS-04, DB-01
**Success Criteria** (what must be TRUE):
  1. The database utilizes a `token_ledger` for robust token auditing (no race conditions).
  2. The `research_sessions` table is clean and holds no agent-specific output columns.
  3. Individual agents log their state, inputs, and outputs to an `agent_runs` table, allowing for dynamic addition of new agents without altering the main session schema.
  4. Real-time frontend updates are driven by subscribing to `agent_runs` and `agent_logs` rather than a single progress integer.
**Plans**: 4 plans
Plans:
- [ ] 11-01-PLAN.md — Database Architecture Overhaul (Supabase Migrations)
- [ ] 11-02-PLAN.md — Core SaaS Services (Ledger & User Types Refactoring)
- [ ] 11-03-PLAN.md — Agent Orchestrator Refactor (Run-based Execution)
- [ ] 11-04-PLAN.md — Frontend Dashboard Refactor (Realtime Subscriptions)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Stable Data | 5/5 | Completed | Yes |
| 2. Core Reporting Engine | 3/3 | Completed | Yes |
| 3. High-Risk Data Integration - KAP | 3/3 | Completed | Yes |
| 4. High-Risk Data Integration - News | 3/3 | Completed | Yes |
| 5. User-Facing Application | 3/3 | Completed | Yes |
| 10. Vercel-Ready Pipeline Refactor | 1/4 | In Progress | No |
| 11. Multi-Agent SaaS Architecture | 0/4 | Planned | No |
