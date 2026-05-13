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

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Stable Data | 5/5 | Completed | Yes |
| 2. Core Reporting Engine | 3/3 | Completed | Yes |
| 3. High-Risk Data Integration - KAP | 3/3 | Completed | Yes |
| 4. High-Risk Data Integration - News | 3/3 | Completed | Yes |
| 5. User-Facing Application | 3/3 | Completed | Yes |
