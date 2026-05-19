/**
 * Research Pipeline Orchestrator — In-Process Agent Architecture
 *
 * All data agents are called as direct async functions (no child_process, no fs-based data exchange).
 * This makes the pipeline Vercel-compatible and eliminates the 5% stuck bug.
 *
 * MIGRATION REQUIRED: Run the following SQL in your Supabase dashboard:
 * -----------------------------------------------------------------------
 * ALTER TABLE research_sessions ADD COLUMN IF NOT EXISTS market_data jsonb;
 * ALTER TABLE research_sessions ADD COLUMN IF NOT EXISTS macro_data jsonb;
 * -----------------------------------------------------------------------
 */

import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { extractTicker } from '@/lib/ticker-extractor'
import { validateEnv, EnvValidationError } from '@/lib/env-check'
import { Client } from '@upstash/qstash'
import { ratelimit } from '@/lib/ratelimit'

const qstash = new Client({
  token: process.env.QSTASH_TOKEN || ''
})

export async function POST(request: Request) {
  try {
    // Env validation — fails fast on missing required keys, logs once for missing degraded keys
    try {
      validateEnv()
    } catch (e) {
      if (e instanceof EnvValidationError) {
        return NextResponse.json(
          { error: `Sunucu yapilandirma hatasi: ${e.missing.join(', ')} missing` },
          { status: 500 }
        )
      }
      throw e
    }

    // Authenticate with Clerk
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 })
    }

    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const identifier = userId || ip;
    const { success: rateLimitSuccess } = await ratelimit.limit(identifier);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Cok fazla istek gonderdiniz. Lutfen biraz bekleyip tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await request.json()
    const rawQuery = body.ticker?.trim()

    if (!rawQuery) {
      return NextResponse.json({ error: 'Gecersiz sorgu' }, { status: 400 })
    }

    // ── TICKER EXTRACTION — Dogal dilden ticker cikar ──
    const extraction = extractTicker(rawQuery)
    const ticker = extraction.ticker

    console.log(`[Orchestrator] Raw query: "${rawQuery}" -> Extracted ticker: "${ticker}" (method: ${extraction.method}, queryType: ${extraction.queryType})`)

    // Initialize Supabase Client (Service Role for backend operations)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials missing')
      return NextResponse.json({ error: 'Sunucu yapilandirma hatasi' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 0. Cache Check (Onbellekleme)
    // Son 6 saat icinde ayni hisse icin basariyla tamamlanmis bir rapor var mi kontrol et.
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: cachedRecord } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('extracted_ticker', ticker)
      .eq('status', 'completed')
      .gte('created_at', sixHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedRecord) {
      console.log(`[Cache Hit] Serving cached report for ${ticker}`);

      const { data: clonedRecord, error: cloneError } = await supabase
        .from('research_sessions')
        .insert({
          user_id: userId,
          query: rawQuery,
          extracted_ticker: ticker,
          status: 'completed',
          progress: 100,
          current_step: 'Tamamlandi (Onbellekten)',
          result_url: cachedRecord.result_url,
          kap_data: cachedRecord.kap_data,
          news_data: cachedRecord.news_data,
          market_data: cachedRecord.market_data,
          macro_data: cachedRecord.macro_data,
          synthesis_data: cachedRecord.synthesis_data,
          agent_logs: [
            { agent: 'orchestrator', status: 'completed', message: `Onbellek bulundu -- ${ticker} icin son 6 saat icinde rapor mevcut.`, timestamp: new Date().toISOString() }
          ],
        })
        .select()
        .single();

      if (cloneError) {
        return NextResponse.json({ error: 'Onbellek kaydi kopyalanamadi' }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: clonedRecord.id, cached: true, ticker }, { status: 202 });
    }

    // Ensure User Exists (Lazy Creation for local-dev scenarios where Clerk webhook didn't fire)
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!userRow) {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress || 'local-dev@example.com';

      await supabase
        .from('users')
        .upsert({ id: userId, email, tier: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

      await supabase
        .from('token_ledger')
        .insert({ user_id: userId, amount: 5, transaction_type: 'grant', description: 'Lazy creation bonus' })
    }

    // Attempt to deduct 1 token using the atomic RPC
    const { data: hasTokens, error: deductError } = await supabase.rpc('deduct_token_if_sufficient', {
      p_user_id: userId,
      p_amount: 1,
      p_description: `Research query for ${ticker}`
    });

    if (deductError) {
      console.error('Token deduction RPC error:', deductError);
      return NextResponse.json({ error: 'Token dusulemedi' }, { status: 500 });
    }

    if (!hasTokens) {
      return NextResponse.json({ error: 'Yetersiz token. Lutfen planinizi yukseltin.' }, { status: 403 });
    }

    // 1. Create pending record WITH extracted ticker
    const { data: record, error: dbError } = await supabase
      .from('research_sessions')
      .insert({
        user_id: userId,
        query: rawQuery,
        extracted_ticker: ticker,
        status: 'running',
        progress: 0,
        current_step: 'Baslatiliyor...',
        agent_logs: [
          {
            agent: 'orchestrator',
            status: 'started',
            message: `Sorgu alindi: "${rawQuery}" -> Ticker: ${ticker}`,
            timestamp: new Date().toISOString(),
            details: `Cikarma yontemi: ${extraction.method}${extraction.context ? `, Baglam: ${extraction.context}` : ''}`,
          }
        ],
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: `Veritabani hatasi: ${dbError.message}` }, { status: 500 })
    }

    // 2. Fire and forget by publishing to QStash
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    const webhookUrl = `${protocol}://${host}/api/qstash/research`;

    await qstash.publishJSON({
      url: webhookUrl,
      body: {
        ticker,
        recordId: record.id,
        extraction
      },
    });

    // 3. Return immediately WITH the extracted ticker so frontend can show it
    return NextResponse.json({ success: true, id: record.id, ticker }, { status: 202 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
