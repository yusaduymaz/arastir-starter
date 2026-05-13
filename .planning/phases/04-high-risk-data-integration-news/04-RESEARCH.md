# Phase 04: High-Risk Data Integration - News - Research

**Researched:** 2024-05-28
**Domain:** Web Scraping (Puppeteer) & Basic NLP (Dictionary-based Sentiment)
**Confidence:** HIGH

## Summary

This phase expands the data sources by scraping dynamic news content from financial outlets (e.g., Bloomberg HT) and introduces a zero-dependency sentiment analysis for these articles. The research confirms that Bloomberg HT can be scraped efficiently using its search URL (`/arama/[TICKER]`) via Puppeteer, and articles can be stripped of ads and boilerplate text using standard DOM classes like `.article-content`. For sentiment analysis, a lightweight, dictionary-based keyword matcher in TypeScript will serve as an excellent placeholder until an LLM is integrated.

**Primary recommendation:** Use `puppeteer-extra` with `StealthPlugin` to scrape Bloomberg HT's search page, extract article links, then visit them to extract the inner text of `.article-content`, and evaluate sentiment via a custom positive/negative Turkish word list.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Search Scraping | API / Backend (Agent) | — | Headless browsing requires server environment. |
| Article Scraping | API / Backend (Agent) | — | Fetching dynamic pages requires a Node runtime (Puppeteer). |
| Text Extraction | API / Backend (Agent) | — | DOM parsing and cleanup to be done immediately after fetch. |
| Sentiment Analysis | API / Backend (Agent) | — | Business logic processing on extracted text. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `puppeteer-extra` | ^3.3.6 | Web Scraping | Standard in the project; supports plugins to avoid bot detection. |
| `puppeteer-extra-plugin-stealth` | ^2.11.2 | Bot Evasion | Essential for scraping news sites that block standard headless browsers. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native `fetch` | built-in | API Calls | If a news site offers a JSON search API, prefer this over Puppeteer for speed. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom Dictionary | `SWNetTR++` | Requires loading a massive 49k word dictionary into memory, overkill for basic sentiment before LLM. |
| Puppeteer | Cheerio | Cheerio is much faster but fails on client-side rendered websites or sites with strict bot protection. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── agents/
│   └── news-agent.ts        # Coordinates scraping and sentiment
├── lib/
│   └── news/
│       ├── bloomberg.ts     # Bloomberg-specific DOM selectors and scraper
│       └── sentiment.ts     # Custom dictionary and scoring logic
```

### Pattern 1: Stealth Headless Scraping
**What:** Using `puppeteer-extra` with stealth plugin to avoid 403 Forbidden errors on financial news sites.
**When to use:** Scraping public news sites like Bloomberg HT that employ WAFs (Web Application Firewalls) or Cloudflare.

### Pattern 2: Dictionary-based Sentiment Scoring
**What:** A zero-dependency function mapping Turkish financial keywords to positive (+1) and negative (-1) scores.
**When to use:** When a basic heuristic is needed to classify articles before passing them to a more expensive/slower LLM agent.

### Anti-Patterns to Avoid
- **Regex for DOM parsing:** Do not use regex to find article content. Always use Puppeteer's `page.evaluate()` or Cheerio to traverse the DOM safely.
- **Scraping everything:** Avoid scraping video elements, ads, and scripts. Always sanitize `document.querySelector('.article-content')` by calling `.remove()` on irrelevant tags before extracting `innerText`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bot Evasion | Custom User-Agent rotation | `puppeteer-extra-plugin-stealth` | Modern WAFs check navigator properties, canvas fingerprints, and WebGL, which the plugin automatically spoofes. |

## Common Pitfalls

### Pitfall 1: Dynamic Content Loading
**What goes wrong:** `page.content()` is evaluated before the news articles are fully rendered on the client side.
**Why it happens:** Single Page Applications (SPAs) load content via API after the initial HTML is parsed.
**How to avoid:** Use `waitUntil: 'networkidle2'` in `page.goto()` and wait for a specific selector (e.g., `await page.waitForSelector('article')`).

### Pitfall 2: Modal and Cookie Banners Blocking Interactions
**What goes wrong:** Attempts to click or scroll fail because of an overlay.
**Why it happens:** GDPR/KVKK cookie consent forms block the page.
**How to avoid:** For simple scraping, you usually don't need to click anything, just use `page.evaluate()` to extract text directly from the DOM, bypassing the overlay.

## Code Examples

### 1. Scraping Bloomberg HT Search Page
```typescript
// Verified pattern using Puppeteer Stealth
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://www.bloomberght.com/arama/THYAO', { waitUntil: 'networkidle2' });

const articles = await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('a'));
  return items
    .map(a => ({ title: a.textContent?.trim(), href: a.href }))
    // Filter to valid article paths
    .filter(a => a.href.includes('bloomberght.com/haberler') || a.href.match(/-\d+$/))
    .slice(0, 10); // Take top 10 recent
});
```

### 2. Extracting Article Content
```typescript
await page.goto(article.href, { waitUntil: 'networkidle2' });
const content = await page.evaluate(() => {
  const articleBody = document.querySelector('.article-content') || document.querySelector('article');
  if (articleBody) {
    // Sanitize
    const noise = articleBody.querySelectorAll('script, style, iframe, .ad, .advertisement');
    noise.forEach(el => el.remove());
    return articleBody.textContent?.trim();
  }
  return null;
});
```

### 3. Basic Turkish Sentiment Dictionary (Zero-Dependency)
```typescript
const positiveWords = ["kâr", "büyüme", "artış", "olumlu", "rekor", "yükseliş", "beklentiyi aştı", "potansiyel"];
const negativeWords = ["zarar", "düşüş", "küçülme", "olumsuz", "risk", "gerileme", "beklentinin altında"];

export function analyzeSentiment(text: string): { sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL', score: number } {
  const lowerText = text.toLocaleLowerCase('tr-TR');
  let score = 0;

  positiveWords.forEach(word => {
    // Count occurrences simply
    if (lowerText.includes(word)) score += 1;
  });

  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });

  let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
  if (score > 0) sentiment = 'POSITIVE';
  if (score < 0) sentiment = 'NEGATIVE';

  return { sentiment, score };
}
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Bloomberg HT classes like `.article-content` are stable | Code Examples | [ASSUMED] The scraper might return `null` if the site redesigns its DOM. We should include fallback tags like `main` or `article`. |
| A2 | Bot protection doesn't escalate | Core Stack | [ASSUMED] If Bloomberg implements Cloudflare Turnstile, stealth plugin alone might not be enough, requiring residential proxies. |

## Open Questions (RESOLVED)

1. **How many articles should we analyze per ticker?**
   - **RESOLVED**: Limit scraping to the top 5 most recent articles per ticker (per source) to ensure reasonable execution time.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Puppeteer | News Scraping | ✓ | ^22.15.0 | — |
| Node.js | Agent Runtime | ✓ | ^20 | — |

## Sources

### Primary (HIGH confidence)
- `package.json` - Confirmed availability of `puppeteer`, `puppeteer-extra`, and `puppeteer-extra-plugin-stealth` natively in the project stack.
- Runtime DOM evaluation on `https://www.bloomberght.com` confirming viable selectors (`a`, `.article-content`).

### Secondary (MEDIUM confidence)
- WebSearch for "Turkish sentiment analysis": Confirmed that small lexicons (like `dwicak/TurkishSentiment-Words`) are standard practice for lightweight NLP. A mapped array approach is a valid alternative before adopting full LLM embedding models.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Directly aligned with the project's current tooling (Puppeteer).
- Architecture: HIGH - Zero dependency sentiment analysis avoids bloated node modules, DOM scraping strategy was verified live.
- Pitfalls: HIGH - Documented issues are standard occurrences with headless web scraping.

**Research date:** 2024-05-28
**Valid until:** 30 days (Web DOM structures are subject to sudden unannounced changes)
