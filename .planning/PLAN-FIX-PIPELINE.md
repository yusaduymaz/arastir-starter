# Implementation Plan - Fixing Pipeline Visibility and History 404

The user is experiencing a 404 on the history page because of a table name mismatch (`research_sessions` vs `research_history`) and progress tracking issues. We also need to ensure the agents are correctly defined and used.

## User Issues
1. **404 Error:** `/dashboard/history/[id]` returns 404 because it queries `research_history` while the orchestrator inserts into `research_sessions`.
2. **Progress Sync:** Progress stays at 5% until refresh because Realtime might be misconfigured or `agent_runs` are not being fully tracked.
3. **Agent Alignment:** The user wants the agents in `.gemini/agents` to be represented correctly in the system.

## Proposed Changes

### 1. Database & Consistency
- Standardize all references to use `research_sessions` (as per the redesign migration).
- Update `src/app/dashboard/history/page.tsx` and `src/app/dashboard/history/[id]/page.tsx` to query `research_sessions`.

### 2. Orchestrator & Agent Runs
- Update `src/app/api/research/route.ts` to:
    - Create `agent_runs` entries for each agent at the start of the pipeline.
    - Pass the `runId` to each agent.
- Update all data agents (`search-agent.ts`, `news-agent.ts`, `market-agent.ts`, `macro-agent.ts`) to update their own `agent_runs` status (started, completed, failed, output_data).
- Update `analyst-agent.ts` and `writer-agent.ts` similarly.

### 3. Agent Definition Alignment
- Read `.gemini/agents/*.md` and ensure the `src/agents/*.ts` logic follows the defined goals and constraints.

### 4. UI/UX Fixes
- Ensure `ActivePipeline.tsx` is correctly listening to the `research_sessions` table (and check if the channel name is correct for Supabase Realtime).

## Proposed Tasks

### Task 1: History Page Table Consolidations
- [ ] Update `src/app/dashboard/history/page.tsx` to use `research_sessions`.
- [ ] Update `src/app/dashboard/history/[id]/page.tsx` to use `research_sessions`.
- [ ] Update `src/types/research.ts` if needed to reflect the table structure.

### Task 2: Orchestrator `agent_runs` Implementation
- [ ] Update `src/app/api/research/route.ts` to insert entries into `agent_runs` for all 6 agents (KAP, News, Market, Macro, Analyst, Writer) at the beginning.
- [ ] Update the `executeResearchPipeline` function to pass `supabase`, `sessionId`, and `runId` to each agent.

### Task 3: Agent Logic Updates (Status Tracking)
- [ ] Update `src/agents/search-agent.ts` to handle `agent_runs` updates.
- [ ] Update `src/agents/news-agent.ts` (finish user's partial change).
- [ ] Update `src/agents/market-agent.ts` to handle `agent_runs` updates.
- [ ] Update `src/agents/macro-agent.ts` to handle `agent_runs` updates.
- [ ] Update `src/agents/analyst-agent.ts` and `src/agents/writer-agent.ts` (or the logic in the orchestrator if they are not separate agents yet).

### Task 4: Realtime Subscription Verification
- [ ] Verify `ActivePipeline.tsx` subscription filters and channel names.

### Task 5: Agent Alignment
- [ ] Read `.gemini/agents/*.md`.
- [ ] Adjust agent prompts or logic in `.ts` files to match instructions.
