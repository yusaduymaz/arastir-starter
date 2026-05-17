# Phase 15: External Market Data APIs (RapidAPI Providers) — Context

**Gathered:** 2026-05-16
**Status:** Ready for planning
**Source:** Inline gathering via /gsd-plan-phase (user answers, no discuss-phase)

<domain>
## Phase Boundary

This phase ships **infrastructure only** for 12 RapidAPI-hosted financial data
providers. The deliverable is a unified, typed client layer with shared
auth, caching, rate-limiting, and error handling — **no agent or UI changes
land in this phase**. Agent wiring and dashboard live cards are deferred to
Phase 16, which depends on Phase 15.

Providers in scope (canonical list — IDs derived from these names):
1. CNBC — global financial news
2. Harem Altın Live Gold Price Data — TR gold (gram/çeyrek/yarım/tam) feed
3. Finance API — generic finance endpoints (TBD: exact provider on RapidAPI)
4. Exchange Rates — fiat FX rates
5. Crypto News — crypto-specific news feed
6. YH Finance — Yahoo Finance via Apidojo/YHFinance RapidAPI
7. Yahoo Finance Real Time — separate provider, real-time quotes/streaming
8. Crypto Trading Indicators API-RSI — RSI / TA indicators for crypto pairs
9. Forex API — forex pair quotes + history
10. Turkey Financial Data API — TR equities / BIST data
11. Real-time Finance Data — multi-asset real-time quotes
12. Turkey News Live — TR news streaming feed

Each provider has its own RapidAPI subscription (per user statement:
"hepsi için ayrı ayrı key var"). The plan must therefore treat keys as
independent secrets, not a single shared key.

</domain>

<decisions>
## Implementation Decisions (locked by user)

### Architecture
- **Scope split: Phase 15 = infrastructure, Phase 16 = agents + UI.**
  Plan-checker must enforce that Phase 15 does NOT modify files in
  `src/agents/`, `src/app/dashboard/`, or other consumer paths.
- **Per-provider key model.** Each provider gets its own env var of the
  form `RAPIDAPI_<PROVIDER>_KEY`. There is no single shared key.
- **Folder layout:** `src/lib/rapidapi/<provider>/` per provider, with:
  - `client.ts` — the typed fetch wrapper
  - `types.ts` — normalized DTOs (decoupled from raw provider shapes)
  - `endpoints.ts` — endpoint constants + path builders
  - `__tests__/smoke.test.ts` — live smoke test gated by env flag
- **Shared infrastructure** lives at `src/lib/rapidapi/_shared/`:
  - `fetcher.ts` — base fetch wrapper with retry + rate-limit awareness
  - `cache.ts` — in-memory LRU/TTL cache, keyed by `provider:endpoint:paramHash`
  - `rate-limiter.ts` — per-provider token-bucket
  - `errors.ts` — `RapidApiError` type + kinds (`missing_key`, `rate_limited`, `provider_error`, `network`, `parse`)
  - `env.ts` — single source of truth for `RAPIDAPI_<PROVIDER>_KEY` lookup
- **No agent or UI imports** of `src/lib/rapidapi/*` in this phase. Plan
  must include a guard test (e.g., a `grep`-based or AST test) verifying
  no file under `src/agents/**` or `src/app/**` imports from
  `src/lib/rapidapi/` after Phase 15 ships.

### Error handling
- Missing key = **graceful degrade**, never a crash. The client returns
  `RapidApiError { kind: 'missing_key', provider }` and callers (in
  Phase 16) decide whether to skip the source or fail loudly.
- 429 from a provider → respect `Retry-After` if present; otherwise
  exponential backoff capped by the rate-limiter config.
- All errors funnel through the single `RapidApiError` type.

### Testing
- **Default CI runs offline.** Live smoke tests are gated by
  `RAPIDAPI_LIVE_TESTS=1` and only execute when keys are present in the
  environment.
- **Unit tests** mock the fetcher and verify: param construction,
  response normalization, cache hit/miss behavior, rate-limiter
  enforcement, error mapping.
- Each provider needs **at least one** smoke test against a stable
  endpoint (provider-dependent — researcher must surface candidates).

### Configuration
- Per-provider config (rate limit, default cache TTL, base URL) lives in
  `src/lib/rapidapi/_shared/config.ts` so the planner doesn't have to
  hard-code values in 12 separate client files.
- `.env.example` updated with all 12 `RAPIDAPI_<PROVIDER>_KEY` entries +
  the `RAPIDAPI_LIVE_TESTS` flag.

### Claude's Discretion
- Exact rate-limit values per provider (research output should propose
  conservative defaults based on RapidAPI plan docs).
- Exact endpoint chosen for each smoke test (researcher will name
  candidates).
- Whether to use `fetch`-based or `undici`-based HTTP — pick whichever
  is already in the project's dependency tree.
- LRU cache library choice vs. hand-rolled — prefer no new dependency
  if a simple Map+TTL suffices.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project conventions
- `GEMINI.md` — folder structure and conventions
- `src/lib/env-check.ts` — existing env-var validation pattern (extend, don't replace)
- `.env.example` — existing env layout

### Existing analogues to follow
- `src/lib/market/yahoo-client.ts` — current Yahoo client; new Yahoo Real-Time / YH Finance clients should be **separate files** in `src/lib/rapidapi/`, NOT a replacement
- `src/lib/news/api_client.ts` and `src/lib/news/newsdata_client.ts` — existing news client pattern
- `src/lib/kap/` — example of a self-contained provider module
- `src/lib/tcmb/`, `src/lib/tuik/` — additional provider module analogues

### Architecture references
- `.planning/phases/11-multi-agent-saas-redesign/` — `agent_runs` /
  `token_ledger` model (relevant for Phase 16, but Phase 15 must not
  break assumptions there)

</canonical_refs>

<specifics>
## Specific Ideas

- **Smoke test gating pattern:**
  ```ts
  const LIVE = process.env.RAPIDAPI_LIVE_TESTS === '1';
  (LIVE ? describe : describe.skip)('cnbc client (live)', () => { ... });
  ```
- **Env var naming examples** (final list locked by planner):
  - `RAPIDAPI_CNBC_KEY`
  - `RAPIDAPI_HAREM_ALTIN_KEY`
  - `RAPIDAPI_YH_FINANCE_KEY`
  - `RAPIDAPI_YAHOO_REALTIME_KEY`
  - `RAPIDAPI_CRYPTO_NEWS_KEY`
  - `RAPIDAPI_CRYPTO_RSI_KEY`
  - `RAPIDAPI_FOREX_KEY`
  - `RAPIDAPI_EXCHANGE_RATES_KEY`
  - `RAPIDAPI_REALTIME_FINANCE_KEY`
  - `RAPIDAPI_TURKEY_FINANCIAL_KEY`
  - `RAPIDAPI_TURKEY_NEWS_KEY`
  - `RAPIDAPI_FINANCE_API_KEY`
- **Provenance tagging.** Each normalized DTO should include
  `source: { provider, fetched_at, ttl_remaining }` so Phase 16's merge
  step can reason about freshness.

</specifics>

<deferred>
## Deferred Ideas (Phase 16 and beyond)

- Wiring providers into `market-agent`, `news-agent`.
- Three new agents: `crypto_agent`, `gold_agent`, `forex_agent`.
- Dashboard live cards (Altın, USD/EUR/TRY, BTC/ETH, BIST top movers).
- `token_ledger` per-call debit logic.
- Persistent (Supabase-backed) cache — Phase 15 ships in-memory only.
- Realtime push of provider data to clients — Phase 16.

</deferred>

---

*Phase: 15-rapidapi-providers*
*Context gathered: 2026-05-16 via /gsd-plan-phase inline Q&A*
