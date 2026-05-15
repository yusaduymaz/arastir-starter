---
phase: "11-multi-agent-saas-redesign"
plan: "11-03"
subsystem: "Agents"
tags: ["refactoring", "state-machine", "database"]
dependency_graph:
  requires: ["11-02"]
  provides: ["11-04"]
  affects: ["src/agents/news-agent.ts", "src/agents/market-agent.ts", "src/agents/macro-agent.ts", "src/agents/analyst-agent.ts", "src/app/api/research/route.ts"]
tech_stack:
  added: []
  patterns: ["In-process agent execution with DB state"]
key_files:
  modified:
    - "src/agents/news-agent.ts"
    - "src/agents/market-agent.ts"
    - "src/agents/macro-agent.ts"
    - "src/agents/analyst-agent.ts"
    - "src/app/api/research/route.ts"
    - "src/agents/search-agent.ts"
decisions:
  - "Agents receive supabase client and runId to update their own state directly"
  - "Pipeline orchestrator creates the agent_runs rows before triggering them"
  - "Analyst agent reads input from agent_runs table instead of arguments"
metrics:
  tasks_completed: 1
  tasks_total: 1
  start_time: "2024-05-24T00:00:00Z"
  end_time: "2024-05-24T00:10:00Z"
---

# Phase 11 Plan 11-03: Agent Runs Refactoring Summary

Refactored the data gathering agents (news, market, macro) and analyst agent to use the new `agent_runs` table schema.

## Key Changes
1. Updated `runNewsAgent`, `runMarketAgent`, `runMacroAgent`, and `runSearchAgent` to accept `supabase`, `sessionId`, and `runId`.
2. These agents now update their corresponding row in the `agent_runs` table when they start, complete, or fail.
3. Updated `runAnalystAgent` to fetch data inputs from the `agent_runs` table (based on preceding completed agents) instead of relying on function arguments.
4. Updated `executeResearchPipeline` in `src/app/api/research/route.ts` to create `agent_runs` rows and orchestrate the agents using the new architecture.

## Deviations from Plan
None.

## Known Stubs
None.

## Threat Flags
None.
