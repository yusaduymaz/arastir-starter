---
phase: 11
plan: 02
subsystem: "SaaS Billing"
tags: ["billing", "ledger", "refactor"]
requires: ["11-01"]
provides: ["core-saas-services"]
affects: ["src/app/api/webhooks/clerk/route.ts", "src/app/api/research/route.ts", "src/components/dashboard/TokenDisplay.tsx"]
decisions:
  - "Updated Clerk webhook to insert initial 5 tokens into token_ledger upon user creation."
  - "Refactored TokenDisplay and research API to use user_balances view for checking current balance instead of tokens_balance in users table."
  - "Replaced tokens_balance decrement in research API with an insert into token_ledger for usages."
metrics:
  tasks_completed: 1
  tasks_total: 1
  files_modified: 3
  duration_seconds: 60
  completion_date: 2026-05-15T12:45:00Z
---

# Phase 11 Plan 02: Core SaaS Services (Ledger Refactoring) Summary

Refactored the backend authentication and SaaS services to utilize the new `token_ledger` and `user_balances` view instead of mutating the `tokens_balance` column directly on the `users` table.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None found.

## Self-Check: PASSED
- `src/app/api/webhooks/clerk/route.ts` updated.
- `src/app/api/research/route.ts` updated.
- `src/components/dashboard/TokenDisplay.tsx` updated.
- Commit `1af08e8` found.
