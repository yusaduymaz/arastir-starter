import { z } from 'zod';
import { searchNews } from '../lib/news/api_client';
import { searchNewsData } from '../lib/news/newsdata_client';
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
    // Use OR operator and quotes for exact matching if company name is available
    keywords = companyName ? `${ticker} OR "${companyName}"` : ticker;
  } else {
    // Konu sorgusu — orijinal sorgudan temizlenmiş anahtar kelimeleri kullan
    keywords = topicKeywords || ticker;
  }

  console.log(`[News Agent] Starting news search for: "${keywords}" (queryType: ${queryType})`);

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  try {
    // 1. Check Cache
    // Look for recent runs (within the last 60 minutes) for the same ticker
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Simple caching: checking fetched_news table directly to see if we have fresh data
    const { data: cachedNews, error: cacheError } = await supabase
      .from('fetched_news')
      .select('title, url, source, published_at, content, sentiment')
      .eq('ticker', ticker)
      .gte('created_at', oneHourAgo);
      
    if (!cacheError && cachedNews && cachedNews.length > 0) {
      console.log(`[News Agent] Found ${cachedNews.length} cached articles for "${ticker}". Skipping APIs.`);
      
      const formattedCached = cachedNews.map(item => ({
        title: item.title,
        date: item.published_at || new Date().toISOString(),
        source: item.source || 'Unknown',
        url: item.url,
        content: item.content || '',
        sentiment: item.sentiment || 'neutral'
      }));

      // Update run status but only save a metadata block to output_data to avoid bloat
      await supabase.from('agent_runs').update({ 
        status: 'completed', 
        output_data: { cached: true, count: formattedCached.length },
        completed_at: new Date().toISOString()
      }).eq('id', runId);

      // Still return the full array internally for immediate downstream logic
      return formattedCached;
    }

    // 2. Fetch data via both Currents API and NewsData API in parallel
    const [currentsData, newsData] = await Promise.all([
      searchNews(keywords).catch(err => {
        console.error(`[News Agent] Currents API failed:`, err);
        return [];
      }),
      searchNewsData(keywords).catch(err => {
        console.error(`[News Agent] NewsData API failed:`, err);
        return [];
      })
    ]);

    // Combine results from both APIs
    const rawData = [...currentsData, ...newsData];
    
    // Deduplicate by URL or title (simple deduplication by URL)
    const uniqueRawData = Array.from(new Map(rawData.map(item => [item.url, item])).values());

    // 2.5 Relevance Filter
    const filteredRawData = uniqueRawData.filter(article => {
      if (queryType !== 'ticker') return true;
      // Search in title and description
      const content = `${article.title || ''} ${article.description || ''}`.toLowerCase();
      const tickerLower = ticker.toLowerCase();
      const companyName = getCompanyName(ticker);
      
      const hasTicker = content.includes(tickerLower);
      const hasCompanyName = companyName ? content.includes(companyName.toLowerCase()) : false;
      
      return hasTicker || hasCompanyName;
    });

    // 3. Map API response -> internal NewsArticle format + sentiment
    console.log(`[News Agent] Mapping and analyzing sentiment for ${filteredRawData.length} relevant articles (down from ${uniqueRawData.length} unique)...`);
    const analyzedData = filteredRawData.map(article => {
      const content = article.description || article.title;
      const { sentiment } = analyzeSentiment(content);
      return {
        title: article.title,
        date: article.published,
        source: article.author || 'Currents API / NewsData',
        url: article.url,
        content,
        sentiment,
      };
    });

    // 4. Validate data
    console.log('[News Agent] Validating data structure...');
    const validatedData = z.array(NewsArticleSchema).parse(analyzedData);
    
    // 5. Store relational data into fetched_news table instead of massive JSON bloat
    if (validatedData.length > 0) {
      const newsRows = validatedData.map(article => ({
        agent_run_id: runId,
        session_id: sessionId,
        ticker: ticker,
        title: article.title,
        url: article.url,
        source: article.source,
        published_at: article.date,
        content: article.content,
        sentiment: article.sentiment
      }));
      
      const { error: insertError } = await supabase.from('fetched_news').insert(newsRows);
      if (insertError) {
        console.error(`[News Agent] Failed to insert relational news:`, insertError);
      }
    }

    console.log(`[News Agent] Successfully validated and saved ${validatedData.length} news articles for "${keywords}"`);

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: { cached: false, count: validatedData.length },
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

