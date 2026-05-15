# Phase 13: Dashboard Extensions - Research

**Researched:** 2024-05-16
**Domain:** Next.js App Router Page Implementation, State Management, and MagicUI Integration
**Confidence:** HIGH

## Summary

The phase requires implementing `Data Sources` and `Settings` pages in the existing Terminal V1.0 Dashboard aesthetic. The current dashboard relies on Server Components for data fetching (Supabase) and Client Components for interactivity (MagicUI, framer-motion). The implementation will require extending this pattern, maintaining the `bg-[#050505]`/`#22c55e` dark terminal theme, and introducing new client-side state management for form handling and MagicUI component integration without cluttering the global state.

**Primary recommendation:** Use Next.js Server Components for initial data load (Supabase), coupled with React Server Actions for mutations (`saveSettings`, `testDataSource`), while relying on local component state (`useState`) and framer-motion for the interactive UI layer.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Settings Persistence | API / Backend | Database | Supabase `user_settings` table (to be created) owns the source of truth for user preferences. |
| Form Validation | API / Backend | Browser / Client | Zod handles schema validation on both client (UX) and server (Security/Data Integrity). |
| MagicUI Effects | Browser / Client | — | `framer-motion` animations, `AnimatedBeam`, and glows require `'use client'` to manipulate DOM/CSS based on user interaction. |
| Data Source Testing | API / Backend | — | API keys/secrets for Data Sources should only be evaluated and tested on the server. Client only receives success/fail signals. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14.2.5 | Routing & Server State | Project standard for data fetching & layouts. |
| Supabase SSR | ^0.3.0 | Database Access | Project's existing persistence layer. |
| Zod | ^3.25.76 | Schema Validation | Used for validating settings objects before DB insertion. |
| Framer Motion | ^12.38.0 | Animations | Required dependency for `magicui` (e.g., AnimatedBeam, MagicCard). |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^1.14.0 | Iconography | Used alongside `material-symbols-outlined` for MagicUI specific needs if necessary, though project prefers material symbols. |
| clsx / tailwind-merge | ^2.1.1 / ^2.6.1 | Utility styling | Dynamic class management for terminal UI components. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Next.js Server Actions | SWR / React Query | SWR adds client bundle size and caching complexity, whereas Server Actions perfectly integrate with the Next.js `revalidatePath` paradigm for a simple settings page. |
| Zustand / Redux | React `useState` | The state on these pages is isolated (form inputs, toggle states). Global state is overkill. |

**Installation:**
```bash
npm install zod clsx tailwind-merge framer-motion
```

## Architecture Patterns

### System Architecture Diagram
```
Client Request -> Next.js Middleware (Clerk Auth) -> App Router (/dashboard/settings)
  |-> Server Component Fetches initial settings from Supabase
  |-> Renders Client Component (<SettingsForm />) with default values
User Interacts -> MagicUI animations trigger (framer-motion, use client)
User Submits -> Server Action (saveUserSettings) -> Zod Validation -> Supabase Update -> revalidatePath
```

### Recommended Project Structure
```
src/
├── app/
│   ├── dashboard/
│   │   ├── data-sources/
│   │   │   └── page.tsx        # Server component (Fetches source status)
│   │   └── settings/
│   │       └── page.tsx        # Server component (Fetches user settings)
├── components/
│   ├── dashboard/
│   │   ├── DataSourceCard.tsx  # Client component (MagicCard + Ping)
│   │   ├── SettingsForm.tsx    # Client component (Handles Server Action)
│   │   └── ConnectionBeam.tsx  # Client component (AnimatedBeam wrapper)
└── lib/
    ├── actions/
    │   └── settings.ts         # Server actions for mutations
    └── validations/
        └── settings.ts         # Zod schemas
```

### Pattern 1: Server Actions for Settings Mutation
**What:** Using Next.js Server Actions for form submissions instead of creating explicit API routes.
**When to use:** Saving user preferences or testing a data source connection.
**Example:**
```typescript
// lib/actions/settings.ts
'use server'
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveUserSettings(prevState: any, formData: FormData) {
  const supabase = createClient();
  const theme = formData.get('theme');
  
  const { error } = await supabase.from('user_settings').upsert({ theme });
  if (error) return { message: 'Failed to save' };
  
  revalidatePath('/dashboard/settings');
  return { message: 'Success' };
}
```

### Pattern 2: MagicCard Terminal Styling
**What:** Adapting MagicUI components to the Terminal V1.0 aesthetic.
**When to use:** Wrapping Data Source connection statuses.
**Example:**
```tsx
import { MagicCard } from "@/components/ui/MagicCard";

<MagicCard 
  className="bg-[#080808] border border-[#22c55e]/12"
  gradientColor="rgba(34,197,94,0.1)"
>
  {/* Card Content with JetBrains Mono typography */}
</MagicCard>
```

### Anti-Patterns to Avoid
- **Anti-pattern: Client-Side Initial Fetching:** Using client-side fetching (`useEffect` + `fetch`) for initial settings load. Causes layout shifts and "flash of unstyled content" which breaks the premium terminal feel. Use Server Components instead.
- **Anti-pattern: LocalStorage for Secrets:** Storing sensitive Data Source credentials in browser `localStorage`. Always store in DB and fetch via secure server environments.
- **Anti-pattern: Default Tailwind Palette:** Using generic Tailwind colors. Stick to the established Terminal V1.0 palette: `#050505` (bg), `#080808` (cards), `#22c55e` (success/primary text), `#facc15` (warning/active).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG Path Animations | Custom `requestAnimationFrame` hooks | `AnimatedBeam` (MagicUI) | Handles responsive resizing and path calculations for connecting UI nodes out of the box. |
| Form Data Parsing | Manual `formData.get()` with type casting | Zod + `z.formData()` / `z.parse()` | Safely validates and casts strings to booleans/numbers from native forms. |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | No `user_settings` table exists in Supabase. | Add Supabase migration to create `user_settings` (user_id, preferences JSONB). |
| Live service config | Next.js Cache | Must trigger `revalidatePath('/dashboard')` when settings change. |
| OS-registered state | None — verified | none |
| Secrets/env vars | None — verified | none |
| Build artifacts | None — verified | none |

## Common Pitfalls

### Pitfall 1: Server Actions Silent Failures
**What goes wrong:** User clicks "Save Settings", nothing happens visually, but server threw an error.
**Why it happens:** Server action returns error object instead of throwing, but client UI (`useFormStatus`) doesn't render the error state.
**How to avoid:** Always use React's `useFormState` (or `useActionState` in React 19) to capture the returned `{ message, error }` object and display it in a Terminal-style `<div className="text-[#ef4444] font-['JetBrains_Mono']">...</div>`.

### Pitfall 2: Framer Motion Hydration Mismatch
**What goes wrong:** Page load shows React hydration errors.
**Why it happens:** `framer-motion` initial states calculated on server don't match browser measurements (especially common with `AnimatedBeam` which depends on ref bounding boxes).
**How to avoid:** Ensure dynamic MagicUI components that rely on DOM measurements are wrapped in dynamic imports or `useEffect` mounts to only render after initial hydration.

## Code Examples

### Form Handling with Server Actions
```tsx
'use client'
import { useFormState } from 'react-dom';
import { saveUserSettings } from '@/lib/actions/settings';

const initialState = { message: null };

export function SettingsForm() {
  const [state, formAction] = useFormState(saveUserSettings, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* ... inputs ... */}
      <button type="submit" className="border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 px-4 py-2 font-['JetBrains_Mono'] text-sm">
        // DEĞİŞİKLİKLERİ KAYDET
      </button>
      {state?.message && <p className="text-[#facc15] font-['JetBrains_Mono'] text-xs">{state.message}</p>}
    </form>
  )
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase | User Settings persistence | ✓ | ^2.105.4 | — |
| Next.js App Router | Page components | ✓ | 14.2.5 | — |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Clerk (already configured in middleware) |
| V4 Access Control | yes | Server Action user_id verification + Row Level Security (RLS) on `user_settings` table |
| V5 Input Validation | yes | Zod schemas |

### Known Threat Patterns for Next.js App Router

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Server Action IDOR | Spoofing/Tampering | Always read `auth().userId` inside the Server Action. Never trust a `userId` passed from the client payload. |
| CSRF in Server Actions | Tampering | Next.js 14 implements built-in CSRF protection for Server Actions. |

## Sources

### Primary (HIGH confidence)
- Existing Codebase: `src/app/dashboard/layout.tsx`, `page.tsx`, `package.json`
- Next.js Documentation (App Router Data Fetching)
- [CITED: nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations] - Server Actions verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified via `package.json` and existing dashboard implementation.
- Architecture: HIGH - Matches Next.js 14 App Router best practices.
- Pitfalls: HIGH - Common issues with React Server Actions and Framer Motion.

**Research date:** 2024-05-16
**Valid until:** 2024-06-16