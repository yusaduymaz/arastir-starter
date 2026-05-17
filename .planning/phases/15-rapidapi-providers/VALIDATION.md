# Phase 15: Validation Mapping

This document explicitly maps the tests implemented in this phase to the requirements defined in the roadmap and planning context. It serves as proof that the phase delivers what was requested.

## Requirements

| ID | Description |
|----|-------------|
| RAPID-01 | Implement typed TS client for each of 12 providers. |
| RAPID-02 | Validate env vars at boot via `env-check.ts` (degraded). |
| RAPID-03 | Shared rate-limiter and in-memory cache (TTL per provider). |
| RAPID-04 | `RapidApiError` type and offline-by-default smoke tests. |

## Validation Mapping

### 1. Guard Test (Architectural Safety)
- **Files**: `src/lib/rapidapi/__tests__/guard.test.ts`
- **Purpose**: Enforces that Phase 15 code is strictly infrastructure and does not get imported by any active agents or UI layers (`src/agents/**`, `src/app/**`) during this phase.

### 2. Core Infrastructure (RAPID-02, RAPID-03, RAPID-04)
- **Files**: `src/lib/rapidapi/_shared/__tests__/shared.test.ts`
- **Tests Implemented**:
  - Validates `env-check.ts` degradation pattern, ensuring `RAPIDAPI_*_KEY` missing states return soft `RapidApiError` rather than crashing the system (RAPID-02).
  - Validates the token-bucket rate limiter and `Map`-based TTL cache. Tests prove that repeated calls hit the cache, and excessive calls trigger the `rate_limited` error or respect `Retry-After` (RAPID-03).
  - Validates the unified `RapidApiError` class creation and throwing mechanics from the `fetcher` wrapper (RAPID-04).

### 3. Provider Clients (RAPID-01, RAPID-04)
Each of the 12 providers (CNBC, Harem Altın, Finance API, Exchange Rates, Crypto News, YH Finance, Yahoo Real Time, Crypto RSI, Forex API, Turkey Financial Data, Real-time Finance, Turkey News Live) implements the following test suites:

- **Offline Unit Tests (`__tests__/client.test.ts`)**:
  - Mocks the `_shared/fetcher.ts`.
  - Verifies param construction passed to the fetcher.
  - Verifies cache hit/miss behavior specifically for the provider's endpoint calls.
  - Verifies proper error mapping of mocked provider responses to `RapidApiError`.
  - Asserts that normalized DTOs contain the exact provenance tag: `source: { provider: string, fetched_at: number, ttl_remaining: number }`.

- **Live Smoke Tests (`__tests__/smoke.test.ts`)**:
  - Gated by `process.env.RAPIDAPI_LIVE_TESTS === '1'`.
  - Performs actual HTTP requests against stable endpoints.
  - Asserts that the live provider returns a successful status and parsing works against real schema structures (RAPID-04).
