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
import * as path from 'path'
import { extractTicker, TickerExtractionResult } from '@/lib/ticker-extractor'
import { AgentLogEntry } from '@/types/research'
import { validateEnv, EnvValidationError } from '@/lib/env-check'

// Direct agent imports — no child_process spawning
import { runSearchAgent } from '@/agents/search-agent'
import { runNewsAgent } from '@/agents/news-agent'
import { runMarketAgent } from '@/agents/market-agent'
import { runMacroAgent } from '@/agents/macro-agent'

// ── Helper: Agent log ekleme ──
async function appendAgentLog(
  supabase: any,
  recordId: string,
  entry: Omit<AgentLogEntry, 'timestamp'>
) {
  const logEntry: AgentLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }

  // Fetch current logs, append, update
  const { data } = await supabase
    .from('research_sessions')
    .select('agent_logs')
    .eq('id', recordId)
    .single()

  const currentLogs: AgentLogEntry[] = data?.agent_logs || []
  currentLogs.push(logEntry)

  await supabase
    .from('research_sessions')
    .update({ agent_logs: currentLogs })
    .eq('id', recordId)
}

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

    // Check Tokens
    const { data: userRow } = await supabase
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single()

    const { data: balanceRow } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .single()

    let finalUserRecord = null;
    if (userRow && balanceRow) {
      finalUserRecord = { tier: userRow.tier, balance: balanceRow.balance }
    }

    // Webhook lokalde calismadigy icin kullanici yoksa otomatik olustur (Lazy Creation)
    if (!finalUserRecord) {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress || 'local-dev@example.com';

      await supabase
        .from('users')
        .upsert({ id: userId, email, tier: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

      await supabase
        .from('token_ledger')
        .insert({ user_id: userId, amount: 5, transaction_type: 'grant', description: 'Lazy creation bonus' })

      const { data: fetchedUser } = await supabase
        .from('users')
        .select('tier')
        .eq('id', userId)
        .single()

      const { data: fetchedBalance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (!fetchedUser || !fetchedBalance) {
        return NextResponse.json({ error: 'Kullanici profili olusturulamadi.' }, { status: 500 })
      }
      finalUserRecord = { tier: fetchedUser.tier, balance: fetchedBalance.balance };
    }

    if (!finalUserRecord || finalUserRecord.balance <= 0) {
      return NextResponse.json({ error: 'Yetersiz token. Lutfen planinizi yukseltin.' }, { status: 403 })
    }

    // Deduct 1 token
    const { error: deductError } = await supabase
      .from('token_ledger')
      .insert({ user_id: userId, amount: -1, transaction_type: 'usage', description: `Research query for ${ticker}` })

    if (deductError) {
      console.error('Token deduction error:', deductError)
      return NextResponse.json({ error: 'Token dusuleemdi' }, { status: 500 })
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

    // 2. Fire and forget in-process agent execution
    executeResearchPipeline(ticker, record.id, supabase, extraction).catch(err => {
      console.error(`Pipeline error for ${record.id}:`, err)
    })

    // 3. Return immediately WITH the extracted ticker so frontend can show it
    return NextResponse.json({ success: true, id: record.id, ticker }, { status: 202 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// In-process pipeline — all agents called as direct async functions
async function executeResearchPipeline(ticker: string, recordId: string, supabase: any, extraction: TickerExtractionResult) {
  const { queryType, topicKeywords } = extraction;
  const isTicker = queryType === 'ticker';

  console.log(`[Pipeline] Starting in-process pipeline for ${ticker} (ID: ${recordId}, queryType: ${queryType})`);

  try {
    // ── STEP 1: Veri Toplama (Paralel) — 5% ──
    await supabase.from('research_sessions').update({
      progress: 5,
      current_step: 'Veri ajanlari baslatiliyor...',
    }).eq('id', recordId);

    const agentList = isTicker
      ? 'KAP, Haberler, Piyasa, Makro'
      : 'KAP, Haberler, Makro (Piyasa atlandi — konu sorgusu)';

    await appendAgentLog(supabase, recordId, {
      agent: 'orchestrator',
      status: 'running',
      message: `Veri ajanlari baslatiliyor: ${agentList}`,
    });

    // Create agent runs in DB for all agents (pre-initialize the visibility)
    const searchRunId = crypto.randomUUID();
    const newsRunId = crypto.randomUUID();
    const marketRunId = crypto.randomUUID();
    const macroRunId = crypto.randomUUID();
    const analystRunId = crypto.randomUUID();
    const writerRunId = crypto.randomUUID();

    await supabase.from('agent_runs').insert([
      { id: searchRunId, session_id: recordId, agent_name: 'search', status: 'pending' },
      { id: newsRunId, session_id: recordId, agent_name: 'news', status: 'pending' },
      { id: marketRunId, session_id: recordId, agent_name: 'market', status: isTicker ? 'pending' : 'skipped' },
      { id: macroRunId, session_id: recordId, agent_name: 'macro', status: 'pending' },
      { id: analystRunId, session_id: recordId, agent_name: 'analyst', status: 'pending' },
      { id: writerRunId, session_id: recordId, agent_name: 'writer', status: 'pending' }
    ]);

    const searchStartTime = Date.now();
    const newsStartTime = Date.now();
    const marketStartTime = Date.now();
    const macroStartTime = Date.now();

    // ── 10% — All agents launched ──
    await supabase.from('research_sessions').update({
      progress: 10,
      current_step: isTicker
        ? 'KAP, Haberler, Piyasa ve Makro Verisi Cekiliyor...'
        : 'KAP, Haberler ve Makro Verisi Cekiliyor (Konu Sorgusu)...',
    }).eq('id', recordId);

    console.log(`[Pipeline] Calling data agents in-process for ${ticker} (queryType: ${queryType})...`);

    // Direct in-process calls — no child_process, no file I/O
    // Topic queries skip market agent (no valid ticker for stock data)
    const agentStart = Date.now();
    const [searchResult, newsResult, marketResult, macroResult] = await Promise.allSettled([
      runSearchAgent(supabase, recordId, searchRunId, ticker),
      runNewsAgent(supabase, recordId, newsRunId, ticker, queryType, topicKeywords),
      isTicker ? runMarketAgent(supabase, recordId, marketRunId, ticker) : Promise.resolve(null),
      runMacroAgent(supabase, recordId, macroRunId),
    ]);
    console.log(`[Pipeline] Data agents completed in ${Date.now() - agentStart}ms`);

    // Log search agent result
    if (searchResult.status === 'fulfilled') {
      await appendAgentLog(supabase, recordId, {
        agent: 'search',
        status: 'completed',
        message: `KAP bildirimleri basariyla toplandi (${searchResult.value.length} bildirim)`,
        duration_ms: Date.now() - searchStartTime,
      });
    } else {
      console.warn(`[Pipeline] Search Agent failed: ${searchResult.reason?.message || searchResult.reason}`);
      await appendAgentLog(supabase, recordId, {
        agent: 'search',
        status: 'failed',
        message: `KAP Tarayici basarisiz oldu`,
        duration_ms: Date.now() - searchStartTime,
        details: String(searchResult.reason).slice(0, 200),
      });
    }

    // Log news agent result
    if (newsResult.status === 'fulfilled') {
      await appendAgentLog(supabase, recordId, {
        agent: 'news',
        status: 'completed',
        message: `Haber analizi tamamlandi (${newsResult.value.length} makale)`,
        duration_ms: Date.now() - newsStartTime,
      });
    } else {
      console.warn(`[Pipeline] News Agent failed: ${newsResult.reason?.message || newsResult.reason}`);
      await appendAgentLog(supabase, recordId, {
        agent: 'news',
        status: 'failed',
        message: `Haber Ajani basarisiz oldu`,
        duration_ms: Date.now() - newsStartTime,
        details: String(newsResult.reason).slice(0, 200),
      });
    }

    // Log market agent result
    if (!isTicker) {
      // Topic queries — market agent was skipped intentionally
      await appendAgentLog(supabase, recordId, {
        agent: 'market',
        status: 'skipped',
        message: `Piyasa Ajani atlandi — konu sorgusu icin gecerli ticker yok`,
        duration_ms: 0,
      });
    } else if (marketResult.status === 'fulfilled') {
      const marketStatus = marketResult.value ? 'completed' : 'failed';
      await appendAgentLog(supabase, recordId, {
        agent: 'market',
        status: marketStatus,
        message: marketResult.value
          ? `Piyasa verileri basariyla cekildi`
          : `Piyasa Ajani veri donduremedi (non-blocking)`,
        duration_ms: Date.now() - marketStartTime,
      });
    } else {
      console.warn(`[Pipeline] Market Agent failed (non-blocking): ${marketResult.reason?.message || marketResult.reason}`);
      await appendAgentLog(supabase, recordId, {
        agent: 'market',
        status: 'failed',
        message: `Piyasa Ajani basarisiz oldu (non-blocking)`,
        duration_ms: Date.now() - marketStartTime,
        details: String(marketResult.reason).slice(0, 200),
      });
    }

    // Log macro agent result
    if (macroResult.status === 'fulfilled') {
      await appendAgentLog(supabase, recordId, {
        agent: 'macro',
        status: 'completed',
        message: `Makro veriler (TCMB EVDS) basariyla cekildi (${macroResult.value.length} ay)`,
        duration_ms: Date.now() - macroStartTime,
      });
    } else {
      console.warn(`[Pipeline] Macro Agent failed (non-blocking): ${macroResult.reason?.message || macroResult.reason}`);
      await appendAgentLog(supabase, recordId, {
        agent: 'macro',
        status: 'failed',
        message: `Makro Ajani basarisiz oldu (non-blocking)`,
        duration_ms: Date.now() - macroStartTime,
        details: String(macroResult.reason).slice(0, 200),
      });
    }

    // ── Dynamic progress based on agent success ──
    const agentSuccessCount = [searchResult, newsResult, marketResult, macroResult]
      .filter(r => r.status === 'fulfilled' && r.value).length;
    const dataProgress = 10 + Math.round((agentSuccessCount / 4) * 30); // 10-40%

    await supabase.from('research_sessions').update({
      progress: dataProgress,
      current_step: 'Veriler ayristiriliyor...',
    }).eq('id', recordId);

    // Extract results from settled promises — data flows in memory, no file reads
    const kapData = searchResult.status === 'fulfilled' ? searchResult.value : [];
    const newsData = newsResult.status === 'fulfilled' ? newsResult.value : [];
    const marketData = marketResult.status === 'fulfilled' ? marketResult.value : null;
    const macroData = macroResult.status === 'fulfilled' ? macroResult.value : [];

    // KAP is critical — if it failed, surface the error
    if (searchResult.status === 'rejected') {
      const reason = String(searchResult.reason).slice(0, 300);
      throw new Error(`KAP bildirimleri cekileemedi (${ticker}). Hata: ${reason}`);
    }

    // Log degraded mode if any non-critical agents failed
    const failedAgents: string[] = [];
    if (newsResult.status === 'rejected') failedAgents.push('News');
    if (marketResult.status === 'rejected' || (marketResult.status === 'fulfilled' && !marketResult.value)) failedAgents.push('Market');
    if (macroResult.status === 'rejected') failedAgents.push('Macro');

    if (failedAgents.length > 0) {
      await appendAgentLog(supabase, recordId, {
        agent: 'orchestrator',
        status: 'running',
        message: `Degraded mode: ${failedAgents.join(', ')} ajanlari basarisiz oldu`,
      });
    }

    await appendAgentLog(supabase, recordId, {
      agent: 'orchestrator',
      status: 'running',
      message: `Veri toplama tamamlandi -- KAP: ${kapData.length} bildirim, Haberler: ${newsData.length} makale${marketData ? ', Piyasa: OK' : ', Piyasa: FAIL'}${macroData.length > 0 ? `, Makro: ${macroData.length} ay` : ', Makro: FAIL'}`,
    });

    // ── STEP 2: AI Sentezi — 60% ──
    await supabase.from('research_sessions').update({
      progress: 60,
      current_step: 'Yapay Zeka Sentezliyor...',
    }).eq('id', recordId);

    const analystStartTime = Date.now();
    await appendAgentLog(supabase, recordId, {
      agent: 'analyst',
      status: 'started',
      message: `AI Analist ${ticker} verilerini sentezliyor...`,
    });

    console.log(`[Pipeline] Running AI Analyst Agent...`);
    const { runAnalystAgent } = require('@/agents/analyst-agent');

    let insights = {
      executiveSummary: "Analiz edilemedi.",
      risks: "Belirlenemedi.",
      opportunities: "Belirlenemedi.",
      macroContext: "",
    };

    try {
      insights = await runAnalystAgent(supabase, recordId, analystRunId, ticker);
      await appendAgentLog(supabase, recordId, {
        agent: 'analyst',
        status: 'completed',
        message: `AI sentezi tamamlandi -- Ozet, riskler ve firsatlar olusturuldu`,
        duration_ms: Date.now() - analystStartTime,
      });
    } catch (e) {
      console.error('[Pipeline] Analyst Agent failed, using fallback.', e);
      await appendAgentLog(supabase, recordId, {
        agent: 'analyst',
        status: 'failed',
        message: `AI Analist basarisiz oldu -- varsayilan sentez kullaniliyor`,
        duration_ms: Date.now() - analystStartTime,
        details: String(e).slice(0, 200),
      });
    }

    // ── STEP 3: Rapor Uretimi — 85% ──
    await supabase.from('research_sessions').update({
      progress: 85,
      current_step: 'PDF ve PPTX Hazirlaniyor...',
    }).eq('id', recordId);

    const writerStartTime = Date.now();
    await appendAgentLog(supabase, recordId, {
      agent: 'writer',
      status: 'started',
      message: `Rapor Uretici baslatildi -- PDF ve PPTX olusturuluyor...`,
    });

    const reportData = {
      title: `${ticker} Sektorel Analiz Raporu`,
      source: 'KAP, Currents API, Yahoo Finance & TCMB EVDS',
      dateGenerated: new Date().toISOString(),
      executiveSummary: insights.executiveSummary,
      macroContext: insights.macroContext || undefined,
      risks: insights.risks,
      opportunities: insights.opportunities,
      data: [
        { label: 'Son KAP Bildirimleri', value: kapData.length },
        { label: 'Incelenen Haber Sayisi', value: newsData.length },
        { label: 'Guncel Fiyat (TL)', value: marketData?.quote?.price ?? 'N/A' },
        { label: 'Gunluk Degisim', value: marketData?.quote?.changePercent ?? 'N/A' },
      ]
    };

    const timestamp = Date.now();
    const slug = ticker.toLowerCase();
    const outputDir = path.resolve(process.cwd(), 'public', 'outputs', `${timestamp}-${slug}`);

    const { runWriterAgent } = require('@/agents/writer-agent');

    console.log(`[Pipeline] Generating PDF and PPTX documents...`);
    try {
      await runWriterAgent(supabase, recordId, writerRunId, reportData, outputDir);
    } catch (e: any) {
      throw e;
    }

    await appendAgentLog(supabase, recordId, {
      agent: 'writer',
      status: 'completed',
      message: `PDF ve PPTX basariyla olusturuldu`,
      duration_ms: Date.now() - writerStartTime,
    });

    console.log(`[Pipeline] Completed successfully for ${ticker}.`);

    // ── STEP 4: Tamamla — 100% ──
    await appendAgentLog(supabase, recordId, {
      agent: 'orchestrator',
      status: 'completed',
      message: `${ticker} analizi basariyla tamamlandi! Rapor hazir.`,
    });

    // Critical: update status FIRST so the session transitions to 'completed'
    // even if the data column update fails (e.g. missing columns)
    const { error: statusError } = await supabase
      .from('research_sessions')
      .update({
        status: 'completed',
        progress: 100,
        current_step: 'Tamamlandi',
        result_url: `/outputs/${timestamp}-${slug}`,
      })
      .eq('id', recordId);

    if (statusError) {
      console.error('[Pipeline] Critical status update failed:', statusError);
    }

    // Save detailed data columns (non-critical — report is still accessible via result_url)
    const { error: dataError } = await supabase
      .from('research_sessions')
      .update({
        kap_data: kapData,
        news_data: newsData,
        market_data: marketData,
        macro_data: macroData,
        synthesis_data: {
          executiveSummary: insights.executiveSummary,
          risks: insights.risks,
          opportunities: insights.opportunities,
          macroContext: insights.macroContext,
          data: reportData.data
        }
      })
      .eq('id', recordId);

    if (dataError) console.error('[Pipeline] Data columns update failed (run migration 20260516000005):', dataError);

  } catch (error: any) {
    console.error(`[Pipeline Error]`, error);

    await appendAgentLog(supabase, recordId, {
      agent: 'orchestrator',
      status: 'failed',
      message: `Pipeline hatasi: ${error.message || 'Bilinmeyen hata'}`,
      details: String(error).slice(0, 300),
    });

    await supabase
      .from('research_sessions')
      .update({
        status: 'failed',
        error_message: error.message || 'Ajanlar calistirilirken bir hata olustu.'
      })
      .eq('id', recordId);
  }
}
