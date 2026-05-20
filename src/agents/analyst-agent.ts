import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { KAPDisclosure } from '../types/kap';
import { NewsArticle } from '../types/news';
import { MarketData } from '../types/market';
import { EvdsDataPoint } from '../lib/tcmb/client';
import { SupabaseClient } from '@supabase/supabase-js';

export interface InvestmentRecommendation {
  action: 'AL' | 'TUT' | 'SAT';
  score: number; // 1-10
  confidence: 'düşük' | 'orta' | 'yüksek';
  shortTermOutlook: string;
  longTermOutlook: string;
  keyFactors: string[];
}

export interface AnalystInsights {
  executiveSummary: string;
  risks: string;
  opportunities: string;
  macroContext: string;
  investmentRecommendation?: InvestmentRecommendation;
}

function safeParseJSON(raw: string): AnalystInsights {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as AnalystInsights;
}

function formatMacroContext(macro: EvdsDataPoint[] | null | undefined): string {
  if (!macro || macro.length === 0) return '';
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

    if (error) {
      console.error('[Analyst Agent] Failed to fetch agent_runs:', error.message, error.details, error.hint);
      throw new Error(`Failed to fetch preceding agent runs: ${error.message}`);
    }

    const completedRuns = runs ?? [];

    const kapData: KAPDisclosure[] = completedRuns.find(r => r.agent_name === 'search')?.output_data || [];

    const { data: fetchedNewsRecords, error: newsError } = await supabase
      .from('fetched_news')
      .select('*')
      .eq('session_id', sessionId);

    let newsData: NewsArticle[] = [];
    if (!newsError && fetchedNewsRecords) {
      newsData = fetchedNewsRecords.map(record => ({
        title: record.title,
        date: record.published_at || new Date().toISOString(),
        source: record.source || 'Unknown',
        url: record.url,
        content: record.content || '',
        sentiment: record.sentiment || 'neutral'
      }));
    }

    const marketData: MarketData | null = completedRuns.find(r => r.agent_name === 'market')?.output_data || null;
    const macroData: EvdsDataPoint[] | null = completedRuns.find(r => r.agent_name === 'macro')?.output_data || null;

    const marketSection = marketData
      ? `\nPiyasa Verileri:
Fiyat: ${marketData.quote?.price || 'N/A'} | Değişim: ${marketData.quote?.changePercent || 'N/A'} | Hacim: ${marketData.quote?.volume || 'N/A'}
52 Hafta Yüksek: ${marketData.overview?.['52WeekHigh'] ?? 'N/A'} | Düşük: ${marketData.overview?.['52WeekLow'] ?? 'N/A'}
Piyasa Değeri: ${marketData.overview?.MarketCapitalization ?? 'N/A'} | F/K: ${marketData.overview?.PERatio ?? 'N/A'} | EPS: ${marketData.overview?.EPS ?? 'N/A'}
Sektör: ${marketData.overview?.Sector ?? 'N/A'} | Endüstri: ${marketData.overview?.Industry ?? 'N/A'}\n`
      : '';

    const macroSection = formatMacroContext(macroData);

    const promptText = `Aşağıda ${ticker} hissesi için çekilmiş güncel veriler yer alıyor. Verileri analiz et ve profesyonel bir yatırım raporu oluştur.
Rapor şu 5 bölümden oluşmalı ve JSON formatında dönmelidir:
1. executiveSummary (Markdown) — 3-5 cümlelik profesyonel yönetici özeti
2. risks (Markdown) — Madde işaretli risk faktörleri
3. opportunities (Markdown) — Madde işaretli fırsat alanları
4. macroContext (Markdown) — Makroekonomik bağlam ve etkisi
5. investmentRecommendation (JSON object) — Yatırım tavsiyesi:
   - action: "AL", "TUT" veya "SAT" (mevcut verilere dayalı)
   - score: 1-10 arası puan (1=çok kötü, 10=mükemmel)
   - confidence: "düşük", "orta" veya "yüksek" (veri kalitesine göre)
   - shortTermOutlook: Kısa vadeli (1-3 ay) beklenti, 1-2 cümle
   - longTermOutlook: Uzun vadeli (6-12 ay) beklenti, 1-2 cümle
   - keyFactors: En önemli 3-5 faktör dizisi (string array)

Önemli: Yatırım tavsiyesini mevcut piyasa verileri, haberler, KAP bildirimleri ve makro göstergelere dayandır. Genel ifadelerden kaçın, somut verilere referans ver.

${marketSection}${macroSection}
KAP Verileri: ${JSON.stringify(kapData.slice(0, 5))}
Haber Verileri: ${JSON.stringify(newsData.slice(0, 5))}`;

    const systemInstruction = 'Sen kıdemli bir BIST hisse senedi analistisin. Türk piyasası konusunda uzmansın. Analizlerini her zaman JSON formatında sunarsın.';

    let result: AnalystInsights | null = null;

    // --- 1. Groq (Priority 1) ---
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('[Analyst Agent] Trying Groq (Priority 1)...');
        const start = Date.now();
        const openai = new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
        });

        const response = await openai.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptText }
          ],
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (content) {
          result = safeParseJSON(content);
          console.log(`[Analyst Agent] Successfully generated with Groq. (${Date.now() - start}ms)`);
        }
      } catch (err: any) {
        console.warn(`[Analyst Agent] Groq failed: ${err.message}`);
      }
    }

    // --- 2. OpenRouter (Priority 2) ---
    if (!result && process.env.OPENROUTER_API_KEY) {
      try {
        console.log('[Analyst Agent] Trying OpenRouter (Priority 2)...');
        const start = Date.now();
        const openai = new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'https://arastir.ai',
            'X-Title': 'Arastir AI',
          },
        });

        const response = await openai.chat.completions.create({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: promptText }
          ],
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (content) {
          result = safeParseJSON(content);
          console.log(`[Analyst Agent] Successfully generated with OpenRouter. (${Date.now() - start}ms)`);
        }
      } catch (err: any) {
        console.warn(`[Analyst Agent] OpenRouter failed: ${err.message}`);
      }
    }

    // --- 3. Gemini (Fallback 1) ---
    if (!result && process.env.GOOGLE_AI_API_KEY) {
      try {
        console.log('[Analyst Agent] Trying Gemini (Fallback 1)...');
        const start = Date.now();
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          systemInstruction,
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        });
        const response = await model.generateContent(promptText);
        result = safeParseJSON(response.response.text());
        console.log(`[Analyst Agent] Successfully generated with Gemini. (${Date.now() - start}ms)`);
      } catch (err: any) {
        console.warn(`[Analyst Agent] Gemini failed: ${err.message}`);
      }
    }

    // --- 4. Anthropic (Fallback 2) ---
    if (!result && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('[Analyst Agent] Trying Anthropic (Fallback 2)...');
        const start = Date.now();
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const msg = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          system: systemInstruction + ' Return JSON only.',
          messages: [{ role: 'user', content: promptText }],
        });
        const text = (msg.content[0] as any).text;
        result = safeParseJSON(text);
        console.log(`[Analyst Agent] Successfully generated with Anthropic. (${Date.now() - start}ms)`);
      } catch (err: any) {
        console.warn(`[Analyst Agent] Anthropic failed: ${err.message}`);
      }
    }

    if (!result) {
      throw new Error('All AI providers failed to generate analysis.');
    }

    await supabase.from('agent_runs').update({
      status: 'completed',
      output_data: result as any,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return result;

  } catch (error: any) {
    console.error(`[Analyst Agent] Final error:`, error);
    await supabase.from('agent_runs').update({
      status: 'failed',
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    throw error;
  }
}

