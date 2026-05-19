// @react-pdf/renderer requires Node.js runtime (not Edge Runtime)
export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { verifySignature } from '@upstash/qstash/nextjs'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import * as path from 'path'
import { TickerExtractionResult } from '@/lib/ticker-extractor'
import { AgentLogEntry } from '@/types/research'

import { runSearchAgent } from '@/agents/search-agent'
import { runNewsAgent } from '@/agents/news-agent'
import { runMarketAgent } from '@/agents/market-agent'
import { runMacroAgent } from '@/agents/macro-agent'

async function appendAgentLog(
  supabase: any,
  recordId: string,
  entry: Omit<AgentLogEntry, 'timestamp'>
) {
  const logEntry: AgentLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }

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

    const agentSuccessCount = [searchResult, newsResult, marketResult, macroResult]
      .filter(r => r.status === 'fulfilled' && r.value).length;
    const dataProgress = 10 + Math.round((agentSuccessCount / 4) * 30); // 10-40%

    await supabase.from('research_sessions').update({
      progress: dataProgress,
      current_step: 'Veriler ayristiriliyor...',
    }).eq('id', recordId);

    const kapData = searchResult.status === 'fulfilled' ? searchResult.value : [];
    const newsData = newsResult.status === 'fulfilled' ? newsResult.value : [];
    const marketData = marketResult.status === 'fulfilled' ? marketResult.value : null;
    const macroData = macroResult.status === 'fulfilled' ? macroResult.value : [];

    if (searchResult.status === 'rejected') {
      const reason = String(searchResult.reason).slice(0, 300);
      throw new Error(`KAP bildirimleri cekileemedi (${ticker}). Hata: ${reason}`);
    }

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

    let insights: {
      executiveSummary: string;
      risks: string;
      opportunities: string;
      macroContext: string;
      investmentRecommendation?: {
        action: 'AL' | 'TUT' | 'SAT';
        score: number;
        confidence: 'düşük' | 'orta' | 'yüksek';
        shortTermOutlook: string;
        longTermOutlook: string;
        keyFactors: string[];
      };
    } = {
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
      // New enriched fields for professional PDF report
      investmentRecommendation: insights.investmentRecommendation,
      newsArticles: newsData.slice(0, 8).map((article: any) => ({
        title: article.title || '',
        source: article.source || 'Bilinmeyen',
        date: article.date || new Date().toISOString(),
        sentiment: article.sentiment,
        content: article.content,
      })),
      kapDisclosures: kapData.slice(0, 10).map((kap: any) => ({
        title: kap.title || kap.baslik || '',
        date: kap.date || kap.tarih || new Date().toISOString(),
        summary: kap.summary || kap.ozet,
      })),
      marketData: marketData ? {
        price: marketData.quote?.price,
        changePercent: marketData.quote?.changePercent,
        volume: marketData.quote?.volume,
        marketCap: marketData.overview?.MarketCapitalization,
        peRatio: marketData.overview?.PERatio,
        eps: marketData.overview?.EPS,
        week52High: marketData.overview?.['52WeekHigh'],
        week52Low: marketData.overview?.['52WeekLow'],
        sector: marketData.overview?.Sector,
      } : undefined,
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
    Sentry.captureException(error);

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

async function handler(request: Request) {
  try {
    const body = await request.json()
    const { ticker, recordId, extraction } = body

    if (!ticker || !recordId || !extraction) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Await the pipeline since this is a background job handler now
    await executeResearchPipeline(ticker, recordId, supabase, extraction)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('QStash worker error:', err)
    Sentry.captureException(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// verifySignature handles QStash authentication automatically
export const POST = process.env.NODE_ENV === 'development' ? handler : verifySignature(handler)
