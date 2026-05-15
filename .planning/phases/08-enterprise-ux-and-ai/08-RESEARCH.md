# Phase 08: Enterprise UX & Scaling - Research

**Researched:** 2024-05
**Domain:** SaaS UX, Realtime DB, AI Prompt Engineering, App Scaling
**Confidence:** HIGH

## CEO / Senior Architect Directive

"Bir finansal SaaS ürününde kullanıcı 'bekleme' hissinden nefret eder. 15-20 saniyelik bir analiz sürecinde, ekranda dönen bir tekerlek yerine 'KAP verileri çekiliyor...', 'Haberler taranıyor...', 'Yapay Zeka Sentezliyor...' gibi aşamaları %10, %40, %80 şeklinde canlı görmelidir. Supabase Realtime ile bu çok kolay.
İkincisi, AI analizi basit bir özet olamaz. 'Chain of Thought' prompt mühendisliği kullanarak modeli 'Önce finansal tabloları düşün, sonra riskleri kategorize et' şeklinde yönlendirmeli ve Markdown tabanlı, okunaklı, profesyonel bir PDF basmalıyız.
Üçüncüsü, aynı hisse (örn. THYAO) aynı gün içinde 100 kere aranırsa 100 kere KAP'a istek atmak bizi banlatır. Basit bir Caching (Önbellekleme) mekanizması şart. Veri 6 saat taze kabul edilmeli.
Dördüncüsü, kullanıcı raporlarını silebilmeli (veri mahremiyeti ve ekran kirliliği).
Son olarak, PDF'ler sıradan bir HTML değil, kurumsal antetli kağıt formatında olmalı."

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Realtime Progress | Supabase Realtime | Next.js Client | Backend updates DB, Supabase broadcasts changes to the subscribed frontend. |
| Report Deletion | Next.js API | Supabase DB | A dedicated DELETE route must be created. |
| Caching | Next.js API | Supabase DB | Before starting scrapers, query `research_history` for completed identical queries within the last 6 hours. |
| Advanced Prompting | Analyst Agent | Anthropic Claude | Utilize `<thought>` tags and structured system prompts for deep financial evaluation. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | ^2.x | Realtime | Built-in WebSocket functionality to subscribe to row changes. |
| `marked` | latest | Markdown to HTML | For rendering AI markdown outputs into the PDF generator. |

## Architecture Patterns

### Pattern 1: Supabase Realtime Subscriptions
**What:** Listening to database updates without polling.
**When to use:** In the `ActivePipeline` component.
**Example:**
```typescript
const channel = supabase.channel('schema-db-changes')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'research_history', filter: `id=eq.${recordId}` }, (payload) => {
    setProgress(payload.new.progress);
    setStep(payload.new.current_step);
  })
  .subscribe();
```

### Pattern 2: Database as Cache
**What:** Using `research_history` as a cache layer.
**When to use:** In `/api/research/route.ts` before starting child processes.
**Example:**
```typescript
const { data: cached } = await supabase
  .from('research_history')
  .select('*')
  .eq('query', ticker)
  .eq('status', 'completed')
  .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
  .single();

if (cached) {
  // Clone record for current user or just return cached data.
}
```

## Security & Privacy
- Users must only be able to delete their *own* records. The API must verify `userId` against the record owner before issuing the Supabase `delete()` command.

## Next Steps
1. Add `progress` and `current_step` columns to Supabase.
2. Update the API route to emit progress and check the cache.
3. Overhaul the Anthropic prompt.
4. Refactor `ActivePipeline.tsx` to use WebSockets.
