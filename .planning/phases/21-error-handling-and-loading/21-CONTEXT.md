# Phase 21: Error Handling & Loading States - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

The user requested comprehensive error handling and loading states across the application. 
Specifically, page transitions (like moving from the landing page to the dashboard) appear instant but hang while loading data, leading to a poor UX. Adding `loading.tsx` files and robust `error.tsx` boundaries will improve resilience and perceived performance.
</domain>

<decisions>
## Implementation Decisions

### Loading States
- Utilize Next.js App Router conventions (`loading.tsx`) to implement suspense-based loading screens.
- Add `loading.tsx` to `src/app/`, `src/app/dashboard/`, and `src/app/admin/`.
- Ensure the loading design aligns with the "dark terminal" / premium aesthetic of the project (e.g., using a spinner, pulse animation, or skeleton loader).

### Error Boundaries
- Implement Next.js `error.tsx` boundaries at the root level and within key layouts (`dashboard`, `admin`).
- Ensure `error.tsx` files provide a user-friendly error message, a "Try Again" button, and log errors securely (via Sentry, which is already integrated in Phase 20).

</decisions>

<canonical_refs>
## Canonical References

### Next.js Documentation
- App Router Error Handling (`error.tsx`, `global-error.tsx`)
- App Router Loading UI and Suspense (`loading.tsx`)
</canonical_refs>
