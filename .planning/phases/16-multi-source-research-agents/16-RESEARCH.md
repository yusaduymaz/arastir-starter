# Phase 16 Research: Pipeline Bug Analysis & Agent-API Mapping

**Date:** 2026-05-17
**Phase:** 16 - Multi-Source Research Agents & Live Data Cards
**Status:** Root causes identified, ready for planning

---

## 1. Pipeline Failure Analysis (BIMAS Test Run — 2026-05-17 20:06)

### Bug 1: Yahoo Finance v3 Breaking Change (CRITICAL)

**Error:** `Call \`const yahooFinance = new YahooFinance()\` first. Upgrading from v2?`

**Root Cause:** Package `yahoo-finance2` upgraded to v3.14.1 but code still uses v2 import pattern.

| File | Line | Issue |
|------|------|-------|
| `src/lib/market/yahoo-client.ts` | 6 | `import yahooFinance from 'yahoo-finance2'` — v2 default export was a ready instance; v3 exports a class constructor |
| `src/lib/market/ticker-data.ts` | 1,29 | `import YahooFinance from 'yahoo-finance2'` then `const yahooFinance = YahooFinance` — same v2 pattern |

**v3 Migration Required:**
```typescript
// v2 (current, broken):
import yahooFinance from 'yahoo-finance2';
yahooFinance.quote(...)

// v3 (correct):
import YahooFinance from 'yahoo-finance2';
const yf = new YahooFinance();
yf.quote(...)
```

**Impact:** Dashboard ticker marquee AND research pipeline market data both completely broken.

---

### Bug 2: Alpha Vantage Fallback Crash (HIGH)

**Error:** `TypeError: Cannot read properties of undefined (reading '01. symbol')`

**Root Cause:** `src/lib/market/client.ts:72` — When Alpha Vantage returns an unexpected response (empty object, rate limit note already stripped), `obj['Global Quote']` is undefined. Line 75 accesses `(raw as any)['01. symbol']` on undefined.

**Fix:** Add null guard before accessing nested fields. Return `null` or throw descriptive error when `Global Quote` is absent.

---

### Bug 3: OpenRouter ByteString Encoding (HIGH)

**Error:** `Cannot convert argument to a ByteString because the character at index 3 has a value of 351 which is greater than 255.`

**Root Cause:** `src/agents/analyst-agent.ts:107` — HTTP header `'X-Title': 'Araştır AI'` contains Turkish character `ş` (U+015F, code point 351). HTTP headers must contain only ASCII characters (0-127) or Latin-1 (0-255). Character 351 exceeds this limit.

**Fix:** ASCII-encode the header value: `'X-Title': 'Arastir AI'` (remove diacritics).

---

### Bug 4: KAP Client Timeout — No Retry (MEDIUM)

**Error:** `DOMException [TimeoutError]: The operation was aborted due to timeout`

**Root Cause:** `src/lib/kap/client.ts:104,139` — Both `fetchViaDisclosureQuery` and `fetchViaRecentDisclosures` use 15s `AbortSignal.timeout()` with zero retry attempts. KAP API is frequently slow during market hours.

**Fix:** Implement 1-2 retries with exponential backoff (2s, 4s wait). Consider reducing initial timeout to 10s per attempt (total max ~30s across retries).

---

### Bug 5: News Agent Returns 0 Articles (MEDIUM)

**Log:** `Mapping and analyzing sentiment for 0 relevant articles (down from 0 unique)`

**Root Cause:** Multiple contributing factors:
1. Currents API may not have Turkish financial news for specific tickers
2. NewsData API similar coverage gaps
3. RapidAPI Turkey News provider may lack `RAPIDAPI_TURKEY_NEWS_KEY`
4. Relevance filter (`news-agent.ts:98-109`) drops articles that don't contain exact ticker/company name — too strict for general coverage

**Fix:** Relax relevance filter for low-result scenarios. If 0 relevant articles after filtering, return unfiltered top-N as fallback.

---

### Bug 6: Market Agent Provider Chain Logic (LOW)

**Location:** `src/agents/market-agent.ts:21-34`

**Issue:** Market agent calls `fetchYahooMarketData` (RapidAPI providers) first, then falls back to `getFullMarketData` (which internally tries Yahoo Finance v3 → Alpha Vantage). The Yahoo Finance v3 call inside `getFullMarketData` fails (Bug 1), causing Alpha Vantage to trigger (Bug 2).

**Correct Chain After Fixes:**
1. RapidAPI Yahoo providers (3 providers in chain) — already working
2. Yahoo Finance v3 direct (after v3 fix)
3. Alpha Vantage (after null guard fix)

---

## 2. Agent-API Mapping (Current vs. Target)

### Current State (Broken)

| Agent | Data Sources | Status |
|-------|-------------|--------|
| **Search Agent** | KAP HTTP API | Timeout, no retry |
| **News Agent** | Currents API, NewsData API, RapidAPI Turkey News | 0 results (API gaps + strict filter) |
| **Market Agent** | RapidAPI Yahoo (3 providers) → Yahoo Finance v3 → Alpha Vantage | All 3 layers broken |
| **Macro Agent** | TCMB EVDS API | Working |
| **Analyst Agent** | OpenRouter → Groq → Gemini → Anthropic | OpenRouter fails (encoding), Groq works |
| **Writer Agent** | PDF (disabled) + PPTX | PDF disabled, PPTX works |
| **Dashboard Ticker** | Yahoo Finance v3 | Broken (v3 issue) |

### Target State (After Phase 16)

| Agent | Primary Source | Fallback 1 | Fallback 2 | Precedence Rule |
|-------|---------------|------------|------------|-----------------|
| **Search Agent** | KAP HTTP API (with retry) | — | — | Single source, retry hardened |
| **News Agent** | RapidAPI Turkey News | Currents API | NewsData API | Merge all, deduplicate by URL, relaxed relevance filter |
| **Market Agent** | RapidAPI Yahoo Real-Time | Yahoo Finance v3 | Alpha Vantage | First non-null wins; provenance tagged |
| **Macro Agent** | TCMB EVDS | — | — | Single source, already working |
| **Analyst Agent** | Groq (llama-3.3-70b) | OpenRouter (fixed) | Gemini → Anthropic | Re-order: Groq primary (proven reliable) |
| **Dashboard Ticker** | Yahoo Finance v3 (fixed) | RapidAPI fallback | — | Direct v3 fix |

---

## 3. Technical Decisions

### D1: Yahoo Finance v3 — Instance Singleton
Create a single `YahooFinance` instance in a shared module. Both `yahoo-client.ts` and `ticker-data.ts` import the same instance. Avoids multiple constructor calls.

### D2: Analyst AI Provider Order
Move Groq to Priority 1 (proven working in production). OpenRouter drops to Priority 2 (after ASCII header fix). Rationale: Groq has been reliable; OpenRouter's free Gemini 2.0 endpoint has encoding edge cases.

### D3: Market Agent Provider Chain
Keep 3-tier chain: RapidAPI → Yahoo v3 → Alpha Vantage. Add null guards at each tier boundary. Tag every `MarketData` result with `source.provider` for provenance.

### D4: News Agent Fallback Strategy
If all 3 news sources return 0 relevant articles after ticker-based filtering, return up to 5 unfiltered Turkish financial news articles as "general context". Mark them with `relevance: 'general'` vs `relevance: 'direct'`.

### D5: KAP Retry Strategy
Max 2 retries per method, exponential backoff (2s, 4s). Total budget: ~30s. If both methods exhaust retries, return empty array (graceful degradation, non-blocking).
