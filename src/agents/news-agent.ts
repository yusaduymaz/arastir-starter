import { z } from 'zod';
import { searchNews } from '../lib/news/api_client';
import { NewsArticle, NewsArticleSchema } from '../types/news';
import { analyzeSentiment } from '../lib/news/sentiment';

export async function runNewsAgent(topic: string): Promise<NewsArticle[]> {
  console.log(`[News Agent] Starting news search and analysis for: ${topic}`);

  try {
    // 1. Fetch data via Currents API
    const rawData = await searchNews(topic);

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

    console.log(`[News Agent] Successfully validated ${validatedData.length} news articles for ${topic}`);

    return validatedData;
  } catch (error) {
    console.error(`[News Agent] Failed to process news for ${topic}:`, error);
    throw error;
  }
}
