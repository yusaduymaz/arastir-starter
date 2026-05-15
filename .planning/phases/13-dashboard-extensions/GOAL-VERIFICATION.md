## ISSUES FOUND

**Phase:** 13-dashboard-extensions
**Plans checked:** 3
**Issues:** 1 blocker(s), 2 warning(s), 0 info

### Blockers (must fix)

**1. [scope_reduction] Plan uses mock data instead of real data source statuses**
- Plan: 13-03
- Task: 2
- Fix: Implement real connection testing or status fetching for Data Sources instead of using "mock operational statuses". Update 13-03 to fetch real status or use the testing pattern mentioned in RESEARCH.md.

### Warnings (should fix)

**1. [task_completeness] Form and Schema omit external API keys**
- Plan: 13-02
- Task: 1 and 2
- Fix: Add `external_api_keys` to the Zod schema in Task 1 and the SettingsForm component in Task 2 to match the objective and DB schema from 13-01.

**2. [task_completeness] TDD task missing proper test command**
- Plan: 13-02
- Task: 1
- Fix: Task is marked `tdd="true"` but uses `grep` for verification. Change verify command to a proper test runner command (e.g., vitest), add a test file to `<files>`, or change task type to `auto`.

### Structured Issues

```yaml
issues:
  - plan: "13-03"
    dimension: "scope_reduction"
    severity: "blocker"
    description: "Plan reduces Data Sources status display to 'mock operational statuses' (hardcoded) instead of showing actual active integrations."
    task: 2
    decision: "EXT-02: User can access a Data Sources page displaying active integrations (KAP, TCMB, etc.)."
    plan_action: "Define an array of sources with mock operational statuses"
    fix_hint: "Implement real connection testing or status fetching for Data Sources instead of using mock data."

  - plan: "13-02"
    dimension: "task_completeness"
    severity: "warning"
    description: "Tasks omit `external_api_keys` from the Zod schema and Form UI, despite being defined in the objective and 13-01 DB schema."
    task: 1
    fix_hint: "Add `external_api_keys` to Zod schema in Task 1 and SettingsForm in Task 2."

  - plan: "13-02"
    dimension: "task_completeness"
    severity: "warning"
    description: "Task is marked `tdd=\"true\"` but uses `grep` for verification instead of a testing framework command."
    task: 1
    fix_hint: "Change verify command to a proper test runner command, add a test file, or change task type to 'auto'."
```

### Recommendation

1 blocker(s) require revision. Returning to planner with feedback.

