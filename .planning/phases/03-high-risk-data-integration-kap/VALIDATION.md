# Phase 03 Validation Map

| Requirement | Test File | Test Command | Verification Criteria |
|-------------|-----------|--------------|------------------------|
| SCRAPE-01 | `src/lib/kap/test.ts` | `npx ts-node src/lib/kap/test.ts` | Output contains an array of KAP disclosures with title, date, company, url, and content. |
| AGENT-02 | `src/agents/search-agent.ts` | `npx ts-node src/agents/search-agent.ts THYAO` | Output JSON file is created in `research/` directory containing the parsed data. |