# Phase 5: User-Facing Application - Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 4
**Analogs found:** 2 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/dashboard/page.tsx` | component (page) | request-response | `src/app/page.tsx` | exact |
| `src/app/results/page.tsx` | component (page) | request-response | `src/app/page.tsx` | exact |
| `src/app/auth/login/page.tsx` | component (page) | request-response | `src/app/page.tsx` | exact |
| `src/components/ResearchHistory.tsx` | component | CRUD | None | no-match |

## Pattern Assignments

### `src/app/dashboard/page.tsx`, `src/app/results/page.tsx`, `src/app/auth/login/page.tsx` (component (page), request-response)

**Analog:** `src/app/page.tsx`

**Imports and Core Page pattern** (lines 1-4):
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
```

**Layout styling pattern** (lines 5-11):
```tsx
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Araştır Projesi
        </p>
      </div>
```

---

## Shared Patterns

### Supabase Client Initialization
**Source:** `src/lib/supabase/client.ts`
**Apply to:** Components/Pages interacting with Auth or database
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/ResearchHistory.tsx` | component | CRUD | No UI components exist yet |

## Metadata

**Analog search scope:** `src/app/**/*.tsx`, `src/components/**/*.tsx`, `src/lib/**/*.ts`
**Files scanned:** 3
**Pattern extraction date:** 2026-05-13
