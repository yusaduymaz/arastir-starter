# Phase 4: High-Risk Data Integration - News - Pattern Map

**Mapped:** 2024-05-28
**Files analyzed:** 3
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/news.ts` | utility | N/A | `src/types/kap.ts` | exact |
| `src/lib/news/client.ts` | utility | scraping | `src/lib/kap/client.ts` | exact |
| `src/agents/news-agent.ts` | agent | batch | `src/agents/search-agent.ts` | exact |

## Pattern Assignments

### `src/types/news.ts` (utility, N/A)

**Analog:** `src/types/kap.ts`

**Imports pattern** (lines 1-1):
```typescript
import { z } from 'zod';
```

**Core pattern** (lines 3-17):
```typescript
export interface NewsArticle {
  title: string;
  date: string;
  source: string;
  url: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export const NewsArticleSchema = z.object({
  title: z.string(),
  date: z.string(),
  source: z.string(),
  url: z.string(),
  content: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
});
```

---

### `src/lib/news/client.ts` (utility, scraping)

**Analog:** `src/lib/kap/client.ts`

**Imports pattern** (lines 1-3):
```typescript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { NewsArticle } from '../../types/news';
```

**Core pattern** (lines 7-18):
```typescript
puppeteer.use(StealthPlugin());

export async function fetchNews(query: string, limit: number = 5): Promise<NewsArticle[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const articles: NewsArticle[] = [];

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
```

**Error handling pattern** (lines 88-93):
```typescript
  } catch (error) {
    console.error(`Error fetching news for ${query}:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
```

---

### `src/agents/news-agent.ts` (agent, batch)

**Analog:** `src/agents/search-agent.ts`

**Imports pattern** (lines 1-5):
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { fetchNews } from '../lib/news/client';
import { NewsArticleSchema } from '../types/news';
```

**Core pattern** (lines 7-29):
```typescript
export async function runNewsAgent(topic: string): Promise<string> {
  console.log(`[News Agent] Starting search for topic: ${topic}`);

  try {
    // 1. Fetch data
    const rawData = await fetchNews(topic, 5);
    
    // 2. Validate data
    console.log(`[News Agent] Validating ${rawData.length} records...`);
    const validatedData = z.array(NewsArticleSchema).parse(rawData);
    
    // 3. Prepare output directory
    const researchDir = path.resolve(__dirname, '../../research');
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }

    // 4. Save to file
    const timestamp = Date.now();
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${timestamp}-${safeTopic}-news.json`;
    const outputPath = path.join(researchDir, fileName);

    fs.writeFileSync(outputPath, JSON.stringify(validatedData, null, 2), 'utf-8');
    console.log(`[News Agent] Successfully saved validated data to: ${outputPath}`);

    return outputPath;
  }
```

**CLI Execution Wrapper pattern** (lines 35-54):
```typescript
// CLI Execution Wrapper
async function main() {
  const args = process.argv.slice(2);
  const topic = args[0];

  if (!topic) {
    console.error('Usage: npx ts-node src/agents/news-agent.ts <TOPIC>');
    process.exit(1);
  }

  try {
    await runNewsAgent(topic);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}
```

## Shared Patterns

### Puppeteer Scraping Setup
**Source:** `src/lib/kap/client.ts`
**Apply to:** `src/lib/news/client.ts`
```typescript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
// Use headless and disable sandboxing for safe execution
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Agent Data Pipeline
**Source:** `src/agents/search-agent.ts`
**Apply to:** `src/agents/news-agent.ts`
1. Fetch data using client
2. Validate using Zod schemas
3. Save to `research/` directory as JSON

## Metadata

**Analog search scope:** `src/lib/**/client.ts`, `src/agents/*.ts`, `src/types/*.ts`
**Files scanned:** 6
**Pattern extraction date:** 2024-05-28
