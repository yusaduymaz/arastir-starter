# Phase 03: High-Risk Data Integration KAP - Research

**Researched:** 2024-06
**Domain:** Web Scraping, Bot Bypassing, Next.js SPA
**Confidence:** HIGH

## Summary

The Public Disclosure Platform (KAP) has been entirely rewritten as a Next.js App Router application. The old Vue.js SPA endpoints (like `/api/bildirimSorgu`) are deprecated and return 404s. KAP now heavily utilizes client-side data fetching coupled with strong client fingerprinting and bot protection mechanisms. Attempting to scrape the site with standard `fetch`, `cheerio`, or default headless `puppeteer` fails immediately because the site detects the bot, returns a `{"bot_response":"!!!!"}` payload from a hashed endpoint, and leaves the page in a perpetual skeleton-loading state. 

**Primary recommendation:** Use `puppeteer-extra` with `puppeteer-extra-plugin-stealth` to bypass KAP's bot protection, and rely on DOM extraction rather than intercepting internal React/Next.js data streams.

## Project Constraints (from GEMINI.md)
- TypeScript strict mode
- Every agent handles its own errors
- Research results must be saved as JSON to `research/`
- KAP data MUST be fetched from `https://www.kap.org.tr` (no 3rd party parsed APIs)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Data Scraping | Agent (Backend) | Headless Browser | Direct fetch fails due to bot protection; a full browser is required to execute JS and bypass fingerprinting. |
| Search Logic | Agent (Backend) | Database | The search agent coordinates the Puppeteer instance and formats the output into standard JSON. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `puppeteer-extra` | latest | Headless browser wrapper | Allows adding plugins to standard Puppeteer to mask bot signatures. |
| `puppeteer-extra-plugin-stealth` | latest | Bot evasion | Crucial for bypassing KAP's new fingerprinting and bot-detection measures. |
| `zod` | ^3.23.8 | Validation | For parsing and validating the extracted JSON data to match the `KAPDisclosure` interface. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `puppeteer` | ^22.11.2 | Base browser | Already in `package.json`. Required by `puppeteer-extra`. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `puppeteer` | `cheerio` / `fetch` | Fails because KAP data is fetched client-side and blocked by bot-protection. Initial HTML only contains loading skeletons. |
| Custom Scraping | Paid APIs (e.g. Fintables) | Violates the project constraint to fetch directly from `kap.org.tr`. |

**Installation:**
```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── agents/
│   └── search-agent.ts      # Orchestrates the KAP scraper and formats output
├── lib/
│   └── kap/
│       ├── client.ts        # The stealth Puppeteer scraper implementation
│       └── parsers.ts       # DOM parsing helpers to extract dates, titles, URLs
└── types/
    └── kap.ts               # KAPDisclosure interface definitions
```

### Pattern 1: Stealth Browser Initialization
**What:** Masking Puppeteer to look like a real user browser.
**When to use:** Whenever interacting with `kap.org.tr`.
**Example:**
```typescript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
```

### Anti-Patterns to Avoid
- **Anti-pattern:** Relying on internal KAP APIs (like `/api/search/combined`).
  *Why it's bad:* These endpoints are highly volatile, change their hashed URLs frequently, and have tight CORS/fingerprint checks. Relying on DOM selectors of the rendered page is more robust.
- **Anti-pattern:** Not waiting for the loading spinner.
  *Why it's bad:* KAP shows a `<img src="/images/gifload.gif" />` while fetching data. Trying to extract elements before this spinner disappears will yield empty arrays.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bot Evasion | Custom User-Agent/Headers injection | `puppeteer-extra-plugin-stealth` | Fingerprinting involves Canvas, WebGL, plugins array, and WebDriver checks. Hand-rolling bypasses for these is incredibly difficult. |

## Common Pitfalls

### Pitfall 1: Perpetual Loading State
**What goes wrong:** The browser opens KAP, but the disclosures list never populates.
**Why it happens:** The site's bot protection intercepted the request and returned `{"bot_response":"!!!!"}`, halting the React state update.
**How to avoid:** Ensure StealthPlugin is active and perhaps add random cursor movements or `setUserAgent` if Stealth alone fails.

### Pitfall 2: Modal Intercepts
**What goes wrong:** Clicks on search results fail.
**Why it happens:** Cookie consent banners or announcements pop up over the search UI.
**How to avoid:** Check for and close any modals or overlays before typing in inputs or clicking result links.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | TypeScript / ts-node |
| Config file | `tsconfig.json` |
| Quick run command | `npx ts-node src/lib/kap/test.ts` |
| Full suite command | `npm run typecheck` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCRAPE-01 | Bypass bot check and extract disclosures | integration | `npx ts-node src/lib/kap/test.ts` | ✅ |
| AGENT-02 | Accept ticker and output JSON | unit/integration | `npx ts-node src/agents/run-search.ts` | ❌ |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | `zod` to ensure ticker symbols match `/^[A-Z0-9]+$/` before passing to browser. |

### Known Threat Patterns for Web Scraping

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unbounded Navigation | Denial of Service | Set strict timeouts on `page.goto` and `page.waitForSelector`. |
| Unsanitized Input to Browser | Tampering | Validate that `stockCode` does not contain malicious characters before typing it into search fields. |

## Sources

### Primary (HIGH confidence)
- Verified via active network interception and shell scripts testing `kap.org.tr`.

### Secondary (MEDIUM confidence)
- `puppeteer-extra-plugin-stealth` documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - tested directly against the target.
- Architecture: HIGH - straightforward agent-to-scraper flow.
- Pitfalls: HIGH - observed the bot response and loading skeletons directly.
