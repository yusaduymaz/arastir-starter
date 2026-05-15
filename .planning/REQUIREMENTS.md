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
NT-02    | 3     | Pending |
| SCRAPE-02   | 4     | Pending |
| AGENT-03    | 4     | Pending |
| UI-01       | 5     | Pending |
| UI-02       | 5     | Pending |
| UI-03       | 5     | Pending |
| UI-04       | 5     | Pending |
