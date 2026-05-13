## ISSUES FOUND

**Phase:** 03-high-risk-data-integration-kap
**Plans checked:** 3
**Issues:** 1 blocker(s), 5 warning(s), 0 info

### Blockers (must fix)

**1. [nyquist_compliance] VALIDATION.md not found for phase 03**
- Plan: null
- Fix: Re-run /gsd:plan-phase 03 --research to regenerate.

### Warnings (should fix)

**1. [verification_derivation] Plan 01 must_haves.truths are implementation-focused**
- Plan: 01
- Fix: Reframe as user-observable: "Bot detection measures are successfully bypassed", "Data conforms to expected format"

**2. [pattern_compliance] Plan 01 creates src/types/kap.ts but does not reference analog src/types/research.ts from PATTERNS.md**
- Plan: 01
- Fix: Add analog reference and pattern excerpts to plan action section

**3. [pattern_compliance] Plan 01 creates src/lib/kap/client.ts but does not reference analog src/lib/tcmb/client.ts from PATTERNS.md**
- Plan: 01
- Fix: Add analog reference and pattern excerpts to plan action section

**4. [pattern_compliance] Plan 02 creates src/lib/kap/test.ts but does not reference analog src/agents/test-tcmb-agent.ts from PATTERNS.md**
- Plan: 02
- Fix: Add analog reference and pattern excerpts to plan action section

**5. [pattern_compliance] Plan 03 creates src/agents/search-agent.ts but does not reference analog src/agents/run-writer.ts from PATTERNS.md**
- Plan: 03
- Fix: Add analog reference and pattern excerpts to plan action section

### Structured Issues

`yaml
issues:
  - issue:
      plan: null
      dimension: nyquist_compliance
      severity: blocker
      description: "VALIDATION.md not found for phase 03"
      fix_hint: "Re-run /gsd:plan-phase 03 --research to regenerate."
  - issue:
      plan: "01"
      dimension: verification_derivation
      severity: warning
      description: "Plan 01 must_haves.truths are implementation-focused"
      problematic_truths:
        - "Stealth Puppeteer dependencies are installed to avoid bot detection."
        - "KAP data models are defined using strict TypeScript interfaces."
      fix_hint: "Reframe as user-observable: 'Bot detection measures are successfully bypassed', 'Data conforms to expected format'"
  - issue:
      plan: "01"
      dimension: pattern_compliance
      severity: warning
      description: "Plan 01 creates src/types/kap.ts but does not reference analog src/types/research.ts from PATTERNS.md"
      file: "03-01-PLAN.md"
      expected_analog: "src/types/research.ts"
      fix_hint: "Add analog reference and pattern excerpts to plan action section"
  - issue:
      plan: "01"
      dimension: pattern_compliance
      severity: warning
      description: "Plan 01 creates src/lib/kap/client.ts but does not reference analog src/lib/tcmb/client.ts from PATTERNS.md"
      file: "03-01-PLAN.md"
      expected_analog: "src/lib/tcmb/client.ts"
      fix_hint: "Add analog reference and pattern excerpts to plan action section"
  - issue:
      plan: "02"
      dimension: pattern_compliance
      severity: warning
      description: "Plan 02 creates src/lib/kap/test.ts but does not reference analog src/agents/test-tcmb-agent.ts from PATTERNS.md"
      file: "03-02-PLAN.md"
      expected_analog: "src/agents/test-tcmb-agent.ts"
      fix_hint: "Add analog reference and pattern excerpts to plan action section"
  - issue:
      plan: "03"
      dimension: pattern_compliance
      severity: warning
      description: "Plan 03 creates src/agents/search-agent.ts but does not reference analog src/agents/run-writer.ts from PATTERNS.md"
      file: "03-03-PLAN.md"
      expected_analog: "src/agents/run-writer.ts"
      fix_hint: "Add analog reference and pattern excerpts to plan action section"
`

### Recommendation

1 blocker(s) require revision. Returning to planner with feedback.
