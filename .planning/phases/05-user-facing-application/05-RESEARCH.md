# Phase 05: User-Facing Application - Research

**Researched:** 2024-05-28
**Domain:** Next.js 14 App Router, Supabase Auth SSR, Server Actions
**Confidence:** HIGH

## Summary

This phase focuses on building the frontend User Interface (UI) to allow users to interact with the backend agents built in Phases 2-4. The core technologies will be Next.js 14 App Router, Supabase Auth (using `@supabase/ssr`), and Tailwind CSS. The interface will provide authentication, a dashboard to submit research queries (tickers), and a history view to download generated PDF/PPTX reports.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | ^14.2.5 | Full-stack framework | Already installed, standard for React applications. |
| `@supabase/ssr` | latest | Authentication | Recommended by Supabase for Next.js App Router to handle secure cookie-based auth. |
| `@supabase/supabase-js` | ^2.x | DB Access | Core client for interacting with the Supabase database. |
| `lucide-react` | latest | Icons | Clean, standard SVG icons for UI elements. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx       # Login page
│   │   └── register/page.tsx    # Registration page
│   ├── dashboard/
│   │   ├── page.tsx             # Main dashboard (UI-01)
│   │   └── history/page.tsx     # Research history (UI-04)
│   └── api/
│       └── research/route.ts    # Route handler to trigger agents asynchronously
├── components/
│   ├── ui/                      # Reusable basic UI components (Buttons, Inputs)
│   └── dashboard/               # Dashboard-specific components (Sidebar, QueryForm)
└── lib/
    └── supabase/
        ├── server.ts            # Server-side Supabase client
        ├── client.ts            # Client-side Supabase client
        └── middleware.ts        # Next.js middleware for route protection
```

### Pattern 1: Supabase SSR Authentication
**What:** Implementing authentication using `@supabase/ssr` to manage cookies securely across Server Components, Client Components, Server Actions, and Route Handlers.
**When to use:** For secure user registration (UI-03) and protecting the `/dashboard` routes. Middleware (`src/middleware.ts`) must be used to refresh sessions and redirect unauthenticated users away from protected routes.

### Pattern 2: Asynchronous Agent Execution
**What:** Triggering the long-running web scraping and PDF generation agents.
**When to use:** When a user submits a query (UI-01). Because Vercel serverless functions have timeouts (typically 10-60 seconds depending on the plan), and Puppeteer scraping can be slow, triggering via Server Actions might block the UI or timeout.
**Recommendation:** Use a Next.js API Route (`src/app/api/research/route.ts`) to accept the request, insert a 'pending' record into the `research_history` Supabase table, and then immediately return a 202 Accepted response. The actual agent execution (fetching news, fetching KAP, generating reports) should ideally run in the background. If true background jobs are not feasible in the current deployment, we will use a "fire-and-forget" approach where the API route starts the Promise chain without awaiting it before sending the HTTP response to the client. The agents will update the Supabase `research_history` row status to 'completed' or 'failed' upon finishing.

### Pattern 3: Optimistic UI Updates
**What:** Updating the UI immediately while the backend request is processing.
**When to use:** When the user clicks "Start Research", the UI should immediately show a loading state or a pending entry in their history list, polling the Supabase database or using Realtime subscriptions to update the status once the PDF/PPTX is ready.

## Code Examples

### 1. Fire-and-Forget API Route for Long-Running Agents
```typescript
// src/app/api/research/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// ... import agents

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ticker } = await request.json();

  // 1. Create pending record
  const { data: record, error } = await supabase
    .from('research_history')
    .insert({ user_id: user.id, query: ticker, status: 'in_progress' })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. Fire and forget agent execution
  executeResearchPipeline(ticker, record.id).catch(console.error);

  // 3. Return immediately
  return NextResponse.json({ success: true, id: record.id }, { status: 202 });
}

async function executeResearchPipeline(ticker: string, recordId: string) {
    // 1. Run KAP Search Agent
    // 2. Run News Agent
    // 3. Run Writer Agent
    // 4. Update Supabase record with status='completed' and file URLs
}
```

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel Serverless timeouts are a risk | Asynchronous Agent Execution | [ASSUMED] If we await the entire Puppeteer pipeline in a Server Action, it will almost certainly timeout on standard Vercel deployments. The fire-and-forget API pattern is necessary. |

## Open Questions (RESOLVED)

1. **How should we handle file storage for PDFs and PPTXs?**
   - **RESOLVED**: In Phase 2, we wrote them to the local file system (`outputs/`). For a web app, these must be uploaded to a Supabase Storage Bucket so they can be accessed via URL by the frontend. The `executeResearchPipeline` must be updated to upload the generated files and store their URLs in the `research_history` table.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@supabase/ssr` | Auth & DB | Needs Install | latest | `@supabase/auth-helpers-nextjs` |

## Metadata

**Confidence breakdown:**
- Architecture: HIGH - SSR Auth and asynchronous API routes are standard patterns for heavy Next.js applications.
