# Phase 2: Core Reporting Engine - Pattern Map

**Mapped:** 2024-05-24
**Files analyzed:** 4
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/pdf/generator.ts` | utility | file-IO | `src/lib/kap/client.ts` | role-match |
| `src/lib/pptx/generator.ts` | utility | file-IO | `src/lib/kap/client.ts` | role-match |
| `src/agents/writer-agent.ts` | service | transform | `src/lib/kap/client.ts` | partial-match |
| `src/agents/run-writer.ts` | utility | execution | `src/agents/test-tcmb-agent.ts` | role-match |

## Pattern Assignments

### `src/lib/pdf/generator.ts` (utility, file-IO)

**Analog:** `src/lib/kap/client.ts`

**Imports pattern** (lines 1-2):
```typescript
import puppeteer from 'puppeteer';
import { KAPDisclosure } from '../../types/kap';
```

**Core Puppeteer pattern** (lines 8-11):
```typescript
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
```

**Error handling pattern** (lines 38-45):
```typescript
  } catch (error) {
    console.error('Failed to fetch KAP disclosures via UI scraping:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
```

---

### `src/lib/pptx/generator.ts` (utility, file-IO)

**Analog:** `src/lib/kap/client.ts`

**Imports pattern** (lines 1-2):
```typescript
import PptxGenJS from 'pptxgenjs';
import type { ReportData, DataPoint } from '../../types/research';
```

**Error handling pattern** (lines 38-45):
```typescript
  } catch (error) {
    console.error('Failed to generate PPTX report:', error);
    throw error;
  }
```
*(No final cleanup block needed for pptxgenjs as opposed to puppeteer)*

---

### `src/agents/writer-agent.ts` (service, transform)

**Analog:** `src/lib/kap/client.ts`

**Logging pattern** (lines 15, 19):
```typescript
    console.log(`Navigating to KAP search page...`);
    console.log(`Searching for stock code: ${stockCode}`);
```

---

### `src/agents/run-writer.ts` (utility, execution)

**Analog:** `src/agents/test-tcmb-agent.ts`

**Imports pattern** (lines 1-4):
```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });
import { getTcmbData } from '../lib/tcmb/client';
import { format } from 'date-fns';
```

**Core execution pattern** (lines 6-23):
```typescript
async function testTcmb() {
  console.log('Fetching TCMB data...');
  try {
    // Data fetching and preparation logic
    const data = await getTcmbData('TP.DK.USD.A.YTL', formattedStartDate, formattedEndDate);
    console.log('Successfully fetched TCMB data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch TCMB data:', error);
    process.exit(1);
  }
}

testTcmb();
```

## Shared Patterns

### Error Handling & Logging
**Source:** `src/lib/kap/client.ts`
**Apply to:** All generation and agent files
```typescript
  try {
    // core logic
  } catch (error) {
    console.error('Failed to perform operation:', error);
    throw error; // Or process.exit(1) in top-level scripts
  }
```

### TypeScript Strictness & Type Definitions
**Source:** `src/types/research.ts`
**Apply to:** All modules interacting with generated files
```typescript
import type { ReportData, DataPoint } from '../../types/research';
```
Ensure data objects follow strict type bindings defined in `src/types/research.ts` when passing data to generators.

## No Analog Found

Files with no close match in the codebase: None

## Metadata

**Analog search scope:** `src/lib/**/*.ts`, `src/agents/**/*.ts`
**Files scanned:** 13
**Pattern extraction date:** 2024-05-24