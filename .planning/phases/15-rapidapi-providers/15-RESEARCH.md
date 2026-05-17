<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Scope split: Phase 15 = infrastructure, Phase 16 = agents + UI.** Plan-checker must enforce that Phase 15 does NOT modify files in `src/agents/`, `src/app/dashboard/`, or other consumer paths.
- **Per-provider key model.** Each provider gets its own env var of the form `RAPIDAPI_<PROVIDER>_KEY`. There is no single shared key.
- **Folder layout:** `src/lib/rapidapi/<provider>/` per provider, with: `client.ts`, `types.ts`, `endpoints.ts`, `__tests__/smoke.test.ts`.
- **Shared infrastructure** lives at `src/lib/rapidapi/_shared/`: `fetcher.ts`, `cache.ts`, `rate-limiter.ts`, `errors.ts`, `env.ts`.
- **No agent or UI imports** of `src/lib/rapidapi/*` in this phase.
- Missing key = **graceful degrade**, never a crash. The client returns `RapidApiError { kind: 'missing_key', provider }` and callers (in Phase 16) decide whether to skip the source or fail loudly.
- 429 from a provider → respect `Retry-After` if present; otherwise exponential backoff capped by the rate-limiter config.
- All errors funnel through the single `RapidApiError` type.
- **Default CI runs offline.** Live smoke tests are gated by `RAPIDAPI_LIVE_TESTS=1` and only execute when keys are present in the environment.
- **Unit tests** mock the fetcher and verify: param construction, response normalization, cache hit/miss behavior, rate-limiter enforcement, error mapping.
- Each provider needs **at least one** smoke test against a stable endpoint.
- Per-provider config (rate limit, default cache TTL, base URL) lives in `src/lib/rapidapi/_shared/config.ts`.
- `.env.example` updated with all 12 `RAPIDAPI_<PROVIDER>_KEY` entries + the `RAPIDAPI_LIVE_TESTS` flag.

### the agent's Discretion
- Exact rate-limit values per provider.
- Exact endpoint chosen for each smoke test.
- Whether to use fetch-based or undici-based HTTP (pick native `fetch`).
- LRU cache library choice vs. hand-rolled (prefer Map+TTL).

### Deferred Ideas (OUT OF SCOPE)
- Wiring providers into `market-agent`, `news-agent`.
- Three new agents: `crypto_agent`, `gold_agent`, `forex_agent`.
- Dashboard live cards (Altın, USD/EUR/TRY, BTC/ETH, BIST top movers).
- `token_ledger` per-call debit logic.
- Persistent (Supabase-backed) cache — Phase 15 ships in-memory only.
- Realtime push of provider data to clients — Phase 16.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RAPID-01 | Implement typed TS client for each of 12 providers. | Normalized DTOs, native `fetch` pattern identified. |
| RAPID-02 | Validate env vars at boot via `env-check.ts` (degraded). | Extends existing `DEGRADED_KEYS` mechanism. |
| RAPID-03 | Shared rate-limiter and in-memory cache (TTL per provider). | Hand-rolled Map+TTL and Token Bucket implementations. |
| RAPID-04 | `RapidApiError` type and offline-by-default smoke tests. | `RapidApiError` mapped, Vitest selected for tests. |
</phase_requirements>

# Phase 15: External Market Data APIs (RapidAPI Providers) - Research

**Researched:** 2026-05-16
**Domain:** External API Integration & Infrastructure
**Confidence:** HIGH

## Summary

This phase establishes a robust, shared infrastructure layer for 12 distinct RapidAPI financial data providers. Because each provider uses a separate API key and has different rate limits, a unified client architecture is necessary to prevent 429 errors and abstract away provider-specific response anomalies. The architecture relies on Next.js 14 native `fetch` combined with a hand-rolled in-memory caching and token-bucket rate-limiting mechanism. 

**Primary recommendation:** Use native Node.js/Next.js `fetch` with a custom `Map`-based TTL cache and Token Bucket rate limiter in `_shared/`. Introduce `vitest` for reliable, ESM-compatible testing of the smoke tests and offline mocking.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| External Fetch | API / Backend | — | API calls require secret keys which must never leak to the client. |
| Rate Limiting | API / Backend | — | Centralized token bucket per provider across all Next.js API/agent workers. |
| In-Memory Cache | API / Backend | — | Reduces external network round-trips and cost per provider. |
| Error Normalization | API / Backend | — | Standardizes disparate provider errors into a single `RapidApiError`. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `fetch` | built-in | HTTP Client | Next.js 14 natively optimizes `fetch`; no extra dependencies required. |
| Vitest | ^1.6.0 | Test Framework | Native ESM support for Next.js backend code. Jest requires heavy Babel configuration. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Map (built-in) | built-in | LRU/TTL Cache | Simple hand-rolled cache `Map<string, {data: any, expires: number}>` is sufficient. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `fetch` | `axios` | Unnecessary dependency addition when `fetch` works natively in modern Node/Next. |
| Hand-rolled Cache | `lru-cache` | Avoids a dependency footprint, but requires explicit size culling implementation to prevent memory leaks if key space grows large. |

**Installation:**
```bash
npm install -D vitest @vitest/coverage-v8
```

## Architecture Patterns

### Recommended Project Structure
```text
src/lib/rapidapi/
├── _shared/
│   ├── fetcher.ts       # Shared native fetch wrapper with Retry-After handling
│   ├── cache.ts         # In-memory Map<string, any> TTL cache
│   ├── rate-limiter.ts  # Token bucket algorithm
│   ├── errors.ts        # RapidApiError definition
│   ├── env.ts           # Env key aggregators (if needed beyond env-check.ts)
│   └── config.ts        # Per-provider TTL and limits
├── cnbc/
│   ├── client.ts
│   ├── types.ts
│   ├── endpoints.ts
│   └── __tests__/
│       └── smoke.test.ts
├── harem_altin/
│   └── ...
└── (10 other providers)/
```

### Pattern 1: Token Bucket Rate Limiting
**What:** Controls the number of requests sent to a RapidAPI provider over a time window.
**When to use:** Required for all outbound requests to RapidAPI to respect plan limits (e.g., 5 requests per second).
**Example:**
```typescript
// Shared token bucket state across the process
const buckets = new Map<string, { tokens: number, lastRefill: number }>();

export async function checkRateLimit(provider: string, limitPerSecond: number): Promise<void> {
  const now = Date.now();
  const bucket = buckets.get(provider) || { tokens: limitPerSecond, lastRefill: now };
  
  // Refill tokens
  const timePassed = now - bucket.lastRefill;
  const newTokens = Math.min(limitPerSecond, bucket.tokens + timePassed * (limitPerSecond / 1000));
  
  if (newTokens < 1) {
    throw new RapidApiError({ kind: 'rate_limited', provider, retry_after: 1000 });
  }
  
  bucket.tokens = newTokens - 1;
  bucket.lastRefill = now;
  buckets.set(provider, bucket);
}
```

### Anti-Patterns to Avoid
- **Throwing errors on missing keys:** If a key is missing, `client.ts` should catch and return `RapidApiError { kind: 'missing_key' }` rather than throwing, so Phase 16 agents can degrade gracefully.
- **Exporting Raw DTOs:** Never let the raw RapidAPI response leak from the `client.ts`. Always map it to a normalized internal type defined in `types.ts`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP Client | Custom `http` wrapper | Native `fetch` | Next.js polyfills and handles native `fetch` extremely well. |

**Key insight:** Keeping the `_shared/cache.ts` hand-rolled is safe because the parameter space (queries) is small and bounded per session.

## Common Pitfalls

### Pitfall 1: Leaking Secret Keys to Client
**What goes wrong:** Adding `NEXT_PUBLIC_` to `RAPIDAPI_CNBC_KEY`.
**Why it happens:** Attempting to call the RapidAPI directly from the browser to bypass Vercel serverless function limits.
**How to avoid:** RapidAPI keys MUST remain purely on the backend. No `NEXT_PUBLIC_` prefix.

### Pitfall 2: Silent Rate Limit Dropping
**What goes wrong:** A burst of 10 rapid agent requests triggers a RapidAPI 429, which fails the whole agent workflow.
**Why it happens:** The provider’s token limit was hit without internal queuing or respects for the `Retry-After` header.
**How to avoid:** `fetcher.ts` must inspect `response.status === 429`, read `Retry-After` header (if available), sleep, and retry exactly once before throwing `RapidApiError(rate_limited)`.

## Code Examples

### Smoke Test Gating Pattern
```typescript
import { describe, test, expect } from 'vitest';
import { getTrendingNews } from '../client';

const LIVE = process.env.RAPIDAPI_LIVE_TESTS === '1';

(LIVE ? describe : describe.skip)('CNBC API (live)', () => {
  test('fetches trending news successfully', async () => {
    const data = await getTrendingNews();
    expect(data.source.provider).toBe('cnbc');
    expect(data.items.length).toBeGreaterThan(0);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Axios + interceptors | Native `fetch` + wrappers | Node 18+ / Next 13+ | Removes heavy dependency. Streamlines native async flow. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | None of the providers require WebSocket streams for Phase 15. | Summary | Real-time integrations would require different libraries (e.g., `ws`) instead of `fetch`. |
| A2 | Vitest is the preferred test runner. | Stack | Must install correctly to support testing. |
| A3 | Candidate smoke test endpoints are assumed valid but may need tweaking once live testing begins. | Config | A test might fail if the provider deprecates the endpoint. |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node native fetch | RapidAPI fetcher | ✓ | 24.11.1 | — |

**Missing dependencies with fallback:**
- **Vitest:** Not installed. Fallback is `npm install -D vitest`. 

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` (to be created) |
| Quick run command | `npx vitest run --passWithNoTests` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RAPID-01 | Clients return normalized DTOs | unit | `npx vitest run src/lib/rapidapi` | ❌ |
| RAPID-02 | Missing keys return typed Error | unit | `npx vitest run src/lib/rapidapi/_shared` | ❌ |
| RAPID-03 | Rate limiter + TTL Cache works | unit | `npx vitest run src/lib/rapidapi/_shared` | ❌ |
| RAPID-04 | Smoke tests run if flag=1 | smoke | `RAPIDAPI_LIVE_TESTS=1 npx vitest run` | ❌ |

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Framework setup needed.
- [ ] Framework install: `npm install -D vitest @vitest/coverage-v8`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | RapidAPI API Keys (Headers: `X-RapidAPI-Key`) |
| V5 Input Validation | yes | `zod` for parsing raw API responses |

### Known Threat Patterns for RapidAPI

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret Leakage | Information Disclosure | Keys stored in Vercel Env, loaded in backend only. |
| Denial of Wallet | Denial of Service | Token-bucket rate limiter prevents runaway agent loops from exhausting API quotas. |

## Sources

### Primary (HIGH confidence)
- `15-CONTEXT.md` - Locked architectural layout and split scope.
- `src/lib/env-check.ts` - Existing pattern for graceful key degradation.
- Next.js 14 documentation regarding native fetch and app router caching semantics.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native fetch is the ecosystem standard for Next.js.
- Architecture: HIGH - Dictated strongly by CONTEXT.md decisions.
- Pitfalls: HIGH - Known issues with serverless server-side fetch calls (rate limiting and error suppression).

**Research date:** 2026-05-16
**Valid until:** Stable
