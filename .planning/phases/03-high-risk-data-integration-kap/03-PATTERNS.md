# Phase 03: High-Risk Data Integration - KAP - Pattern Map

**Mapped:** 2024-05-18
**Files analyzed:** 4
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/kap.ts` | model | model | `src/types/research.ts` | exact |
| `src/lib/kap/client.ts` | service | request-response | `src/lib/tcmb/client.ts` | exact |
| `src/lib/kap/test.ts` | test | script | `src/agents/test-tcmb-agent.ts` | role-match |
| `src/agents/search-agent.ts` | agent | script/file I/O | `src/agents/run-writer.ts` | role-match |

## Pattern Assignments

### `src/types/kap.ts` (model, model)

**Analog:** `src/types/research.ts`

**Exports pattern** (lines 1-10):
```typescript
export interface DataPoint {
  label: string;
  value: number | string; // Allow string for more flexibility
}

export interface ReportData {
  title: string;
  source: string;
  dateGenerated: string;
  data: DataPoint[];
}
```

---

### `src/lib/kap/client.ts` (service, request-response)

**Analog:** `src/lib/tcmb/client.ts`

**Imports pattern** (lines 1-1):
```typescript
import { z } from 'zod';
```

**Core Fetch/Scrape Pattern** (lines 16-24):
```typescript
export async function getTcmbData(
  series: string,
  startDate: string,
  endDate: string
): Promise<TcmbData> {
  const apiKey = process.env.TCMB_API_KEY;
  if (!apiKey) {
    throw new Error('TCMB_API_KEY is not set in environment variables');
  }
```

**Error Handling Pattern** (lines 35-43, 53-58):
```typescript
    if (!response.ok || responseText.includes('<!doctype html>')) {
      console.error('API Response was not OK or returned HTML:');
      console.error('Status:', response.status);
      console.error('Headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      throw new Error(`API Error: ${response.status} ${response.statusText} - Body: ${responseText.substring(0, 500)}...`);
    }
```
```typescript
  } catch (error: any) {
    if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse response as JSON. The server returned:\n---\n${responseText}\n---`);
    }
    console.error('Error in getTcmbData:');
    if (error.message) console.error('Message:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    throw error;
  }
```

---

### `src/lib/kap/test.ts` (test, script)

**Analog:** `src/agents/test-tcmb-agent.ts`

**Core Script Execution Pattern** (lines 1-22):
```typescript
import { config } from 'dotenv';
config({ path: '.env.local' });
import { getTcmbData } from '../lib/tcmb/client';

async function testTcmb() {
  console.log('Fetching TCMB data...');
  try {
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

---

### `src/agents/search-agent.ts` (agent, script/file I/O)

**Analog:** `src/agents/run-writer.ts`

**Imports and Path handling pattern** (lines 1-4):
```typescript
import * as fs from 'fs';
import * as path from 'path';
import { runWriterAgent } from './writer-agent';
```

**Core Agent Script Pattern** (lines 6-27):
```typescript
async function main() {
  try {
    const timestamp = Date.now();
    const slug = reportData.title.replace(/\s+/g, '-').toLowerCase();
    const outputDir = path.resolve(__dirname, '../../outputs', `${timestamp}-${slug}`);

    await runWriterAgent(reportData, outputDir);
    console.log(`Output directory: ${outputDir}`);
  } catch (error) {
    console.error('Error in run-writer:', error);
    process.exit(1);
  }
}

main();
```

## Shared Patterns

### Error Logging and Process Exit
**Source:** `src/agents/run-writer.ts` / `src/agents/test-tcmb-agent.ts`
**Apply to:** All executable scripts (`src/lib/kap/test.ts`, `src/agents/search-agent.ts`)
```typescript
  } catch (error) {
    console.error('Error in <process>:', error);
    process.exit(1);
  }
```

## Metadata

**Analog search scope:** `src/**/*.ts`
**Files scanned:** 15
**Pattern extraction date:** 2024-05-18