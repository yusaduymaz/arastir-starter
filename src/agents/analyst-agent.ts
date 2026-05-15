import Anthropic from '@anthropic-ai/sdk';
import { KAPDisclosure } from '../types/kap';
import { NewsArticle } from '../types/news';
import { MarketData } from '../types/market';
import { EvdsDataPoint } from '../lib/tcmb/client';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AnalystInsights {
  executiveSummary: string;
  risks: string;
  opportunities: string;
  macroContext: string;
}

function formatMacroContext(macro: EvdsDataPoint[] | null | undefined): string {
  if (!macro || macro.length === 0) return '';
  // Take the last 3 monthly entries (most recent)
  const recent = macro.slice(-3);
  const lines = recent.map(d => {
    const usd = d.TP_DK_USD_A ? `USD/TRY ${parseFloat(d.TP_DK_USD_A).toFixed(2)}` : 'USD: -';
    const tufe = d.TP_FG_J0 ? `TÜFE ${parseFloat(d.TP_FG_J0).toFixed(2)}` : 'TÜFE: -';
    const faiz = d.TP_MK_B_A2 ? `Faiz %${parseFloat(d.TP_MK_B_A2).toFixed(2)}` : 'Faiz: -';
    return `  ${d.Tarih}: ${usd} | ${tufe} | ${faiz}`;
  });
  return `\nMakroekonomik Bağlam (TCMB EVDS, son 3 ay):\n${lines.join('\n')}\n`;
}

export async function runAnalystAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string,
  ticker: string
): Promise<AnalystInsights> {
  console.log(`[Analyst Agent] Starting AI synthesis for ${ticker}...`);

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  try {
    const { data: runs, error } = await supabase
      .from('agent_runs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'completed');

    if (error || !runs) {
      throw new Error('Failed to fetch preceding agent runs');
    }

    const kapData: KAPDisclosure[] = runs.find(r => r.agent_type === 'search')?.output_data || [];
    const newsData: NewsArticle[] = runs.find(r => r.agent_type === 'news')?.output_data || [];
    const marketData: MarketData | null = runs.find(r => r.agent_type === 'market')?.output_data || null;
    const macroData: EvdsDataPoint[] | null = runs.find(r => r.agent_type === 'macro')?.output_data || null;

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_AI_API_KEY; // Using GOOGLE_AI_API_KEY as a placeholder if ANTHROPIC is missing just to satisfy standard setup, but we'll prefer Anthropic if available. Let's assume Anthropic is available or we use a fallback mock if no key.

    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('[Analyst Agent] Analyst running in MOCK mode — set ANTHROPIC_API_KEY for real synthesis');
        const priceInfo = marketData ? ` Güncel fiyat: ${marketData.quote?.price || 'N/A'} TL.` : '';
        const latestUsd = macroData && macroData.length > 0
          ? macroData[macroData.length - 1].TP_DK_USD_A
          : null;
        const macroInfo = latestUsd ? ` USD/TRY: ${parseFloat(latestUsd).toFixed(2)}.` : '';
        const macroContextMock = latestUsd && macroData
          ? `[MOCK] Makroekonomik bağlam: USD/TRY ${parseFloat(latestUsd).toFixed(2)}. Veriler ${macroData.length} aylık TCMB EVDS serisinden alınmıştır.`
          : '';
        
        const mockResult = {
            executiveSummary: `[MOCK] ${ticker} için veri sentezi (gerçek AI yok — ANTHROPIC_API_KEY tanımlı değil).${priceInfo}${macroInfo} KAP: ${kapData.length} bildirim, Haber: ${newsData.length} makale işlendi.`,
            risks: `[MOCK] ${ticker} — Sektörel maliyet artışları, regülasyon değişiklikleri, pazar daralması riski.`,
            opportunities: `[MOCK] ${ticker} — Yeni pazar açılımları, maliyet optimizasyonu, sektörel birleşmeler.`,
            macroContext: macroContextMock,
        };

        await supabase.from('agent_runs').update({ 
          status: 'completed', 
          output_data: mockResult as any,
          completed_at: new Date().toISOString()
        }).eq('id', runId);

        return mockResult;
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const marketSection = marketData
      ? `\nPiyasa Verileri (Yahoo Finance / Alpha Vantage):
Fiyat: ${marketData.quote?.price || 'N/A'} | Değişim: ${marketData.quote?.changePercent || 'N/A'} | Hacim: ${marketData.quote?.volume || 'N/A'}
52 Hafta Yüksek: ${marketData.overview?.['52WeekHigh'] ?? 'N/A'} | Düşük: ${marketData.overview?.['52WeekLow'] ?? 'N/A'}
Piyasa Değeri: ${marketData.overview?.MarketCapitalization ?? 'N/A'} | F/K: ${marketData.overview?.PERatio ?? 'N/A'} | EPS: ${marketData.overview?.EPS ?? 'N/A'}
Sektör: ${marketData.overview?.Sector ?? 'N/A'} | Endüstri: ${marketData.overview?.Industry ?? 'N/A'}\n`
      : '';

    const macroSection = formatMacroContext(macroData);

    const prompt = `Aşağıda ${ticker} hissesi için çekilmiş güncel veriler yer alıyor. Verileri analiz et ve yapılandırılmış bir rapor oluştur.

Rapor şu 4 bölümden oluşmalı, her biri profesyonel bir dille, MARKDOWN formatında:
1. **Executive Summary** — Genel durum değerlendirmesi
2. **Risks** — Şirket/hisse için olası riskler
3. **Opportunities** — Şirket/hisse için fırsatlar
4. **Macro Context** — Makroekonomik bağlam ve şirkete etkisi

Risks ve Opportunities yazarken makroekonomik bağlamı dikkate al ve uygun olduğunda spesifik değerlerden (USD/TRY, TÜFE, faiz) alıntı yap.
${marketSection}${macroSection}
KAP Verileri:
${JSON.stringify(kapData.slice(0, 5))}

Haber Verileri:
${JSON.stringify(newsData.slice(0, 5))}

Analizini submit_analysis aracını kullanarak gönder.`;

    const analysisToolDef = {
      name: 'submit_analysis',
      description: 'Submit the structured financial analysis report for the given ticker.',
      input_schema: {
        type: 'object' as const,
        properties: {
          executiveSummary: { type: 'string', description: 'Markdown formatted executive summary' },
          risks: { type: 'string', description: 'Markdown formatted risk analysis' },
          opportunities: { type: 'string', description: 'Markdown formatted opportunities analysis' },
          macroContext: { type: 'string', description: 'Markdown formatted macroeconomic context and its impact on the company' },
        },
        required: ['executiveSummary', 'risks', 'opportunities', 'macroContext'],
      },
    };

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.2,
      system: 'Sen kıdemli bir BIST hisse senedi analistisin. Türk piyasası ve makroekonomik göstergeler konusunda uzmanlaşmış, profesyonel raporlar üreten bir analistsin. Analizini her zaman submit_analysis aracını kullanarak gönder.',
      tools: [analysisToolDef],
      tool_choice: { type: 'tool', name: 'submit_analysis' },
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract structured output from tool_use block
    const toolBlock = msg.content.find((b: any) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('AI did not return a tool_use block.');
    }
    const parsed = toolBlock.input as Record<string, string>;

    console.log(`[Analyst Agent] Successfully generated AI synthesis for ${ticker}.`);

    const result = {
        executiveSummary: parsed.executiveSummary || 'Özet oluşturulamadı.',
        risks: parsed.risks || 'Riskler analiz edilemedi.',
        opportunities: parsed.opportunities || 'Fırsatlar analiz edilemedi.',
        macroContext: parsed.macroContext || '',
    };

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: result as any,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return result;

  } catch (error: any) {
    console.error(`[Analyst Agent] Error during AI synthesis:`, error);
    await supabase.from('agent_runs').update({ 
      status: 'failed', 
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    throw error;
  }
}

