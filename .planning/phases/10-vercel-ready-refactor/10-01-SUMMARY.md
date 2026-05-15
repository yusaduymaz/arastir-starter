---
phase: "10"
plan: "01"
subsystem: pipeline-architecture
tags: [refactor, vercel, in-process, agents, supabase]
dependency_graph:
  requires: []
  provides: [in-process-agents, market-data-column, macro-data-column]
  affects: [src/agents/*, src/app/api/research/route.ts, src/types/research.ts]
tech_stack:
  added: []
  patterns: [in-process-function-calls, promise-allsettled-data-extraction]
key_files:
  created: []
  modified:
    - src/agents/search-agent.ts
    - src/agents/news-agent.ts
    - src/agents/market-agent.ts
    - src/agents/macro-agent.ts
    - src/app/api/research/route.ts
    - src/types/research.ts
    - .gitignore
decisions:
  - "Kept writer-agent and analyst-agent as require() calls (already in-process, no refactor needed)"
  - "macro-agent no longer takes a ticker parameter (macro data is global, not ticker-specific)"
  - "market-agent returns null on failure (non-critical) instead of throwing"
  - "Fixed .gitignore to scope research/ and outputs/ to repo root only (was blocking api/research path)"
metrics:
  duration: "5m 4s"
  completed: "2026-05-15"
  tasks_completed: 6
  tasks_total: 6
  files_changed: 7
---

# Phase 10 Plan 01: In-Process Agent Architecture + DB Storage Summary

Eliminated child-process + filesystem architecture from the research pipeline, converting all 4 data agents into direct async function calls that return typed data in memory, making the pipeline Vercel-deployable and fixing the 5% stuck progress bug.

## Completed Tasks

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Refactor search-agent to return data directly | b613c11 | Return KAPDisclosure[] instead of file path; remove fs/path/CLI |
| 2 | Refactor news-agent to return data directly | 5dec34f | Return NewsArticle[] instead of file path; remove fs/path/CLI |
| 3 | Refactor market-agent to return data directly | c0df9e4 | Return MarketData or null instead of file path; remove fs/path/CLI |
| 4 | Refactor macro-agent to return data directly | 25aaeee | Return EvdsDataPoint[] instead of file path; remove fs/path/CLI and unused ticker param |
| 5 | Rewrite orchestrator to call agents in-process | 8edff13 | Remove child_process/exec/execAsync; import agents directly; extract data from settled promises in memory; add market_data/macro_data to Supabase; fix .gitignore |
| 6 | Add market_data and macro_data columns to DB schema | bdc26be | Add market_data/macro_data to ResearchSession TypeScript type |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed .gitignore blocking src/app/api/research/route.ts**
- **Found during:** Task 5
- **Issue:** The `.gitignore` pattern `research/` matched any path containing `research/`, including `src/app/api/research/`. Git refused to add `route.ts`.
- **Fix:** Changed `research/` to `/research/` and `outputs/` to `/outputs/` to scope patterns to repo root only.
- **Files modified:** `.gitignore`
- **Commit:** 8edff13

## Verification Results

1. `npx tsc --noEmit` -- Only pre-existing Clerk Variables type error (not introduced by this plan). PASS.
2. No `import * as fs from 'fs'` in search-agent, news-agent, market-agent, or macro-agent. PASS.
3. No `child_process` import in route.ts. PASS.
4. No `research/` file-I/O references in route.ts or data agents. PASS.
5. All agent functions have typed return signatures (KAPDisclosure[], NewsArticle[], MarketData | null, EvdsDataPoint[]). PASS.

## Architecture Before/After

**Before:**
```
route.ts -> execAsync("npx tsx src/agents/search-agent.ts THYAO")
         -> agent writes research/1234-thyao-kap.json
         -> route.ts reads file with fs.readdirSync + fs.readFileSync
```

**After:**
```
route.ts -> const kapData = await runSearchAgent(ticker)
         -> data returned directly as typed KAPDisclosure[] in memory
         -> saved to Supabase columns (kap_data, news_data, market_data, macro_data)
```

## Migration Note

Users must run the following SQL in their Supabase dashboard before using the updated pipeline:

```sql
ALTER TABLE research_history ADD COLUMN IF NOT EXISTS market_data jsonb;
ALTER TABLE research_history ADD COLUMN IF NOT EXISTS macro_data jsonb;
```

## Self-Check: PASSED

All 8 files verified as existing. All 6 commit hashes verified in git log.
