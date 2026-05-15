import { z } from 'zod';
import { searchNews } from '../lib/news/api_client';
import { NewsArticle, NewsArticleSchema } from '../types/news';
import { analyzeSentiment } from '../lib/news/sentiment';
import { getCompanyName } from '../lib/ticker-extractor';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * News Agent — Sorgu tipine göre anlamlı anahtar kelimelerle haber arar.
 *
 * Ticker sorguları: "THYAO Türk Hava Yolları" gibi ticker + şirket adı ile arar.
 * Konu sorguları: "Enerji Sektoru karsilastirmali" gibi orijinal konu ile arar.
 */
export async function runNewsAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string,
  ticker: string,
  queryType: 'ticker' | 'topic' = 'ticker',
  topicKeywords?: string,
): Promise<NewsArticle[]> {
  // Sorgu tipine göre anahtar kelime oluştur
  let keywords: string;

  if (queryType === 'ticker') {
    const companyName = getCompanyName(ticker);
    keywords = companyName ? `${ticker} ${companyName}` : ticker;
  } else {
    // Konu sorgusu — orijinal sorgudan temizlenmiş anahtar kelimeleri kullan
    keywords = topicKeywords || ticker;
  }

  console.log(`[News Agent] Starting news search for: "${keywords}" (queryType: ${queryType})`);

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  try {
    // 1. Fetch data via Currents API
    const rawData = await searchNews(keywords);

    // 2. Map Currents API response -> internal NewsArticle format + sentiment
    console.log(`[News Agent] Mapping and analyzing sentiment for ${rawData.length} articles...`);
    const analyzedData = rawData.map(article => {
      const content = article.description || article.title;
      const { sentiment } = analyzeSentiment(content);
      return {
        title: article.title,
        date: article.published,
        source: article.author || 'Currents API',
        url: article.url,
        content,
        sentiment,
      };
    });

    // 3. Validate data
    console.log('[News Agent] Validating data structure...');
    const validatedData = z.array(NewsArticleSchema).parse(analyzedData);

    console.log(`[News Agent] Successfully validated ${validatedData.length} news articles for "${keywords}"`);

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: validatedData,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return validatedData;
  } catch (error: any) {
    console.error(`[News Agent] Failed to process news for "${keywords}":`, error);
    await supabase.from('agent_runs').update({ 
      status: 'failed', 
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    throw error;
  }
}

