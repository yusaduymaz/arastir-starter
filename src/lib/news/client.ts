import { NewsArticle } from '../../types/news';
import { fetchBloombergNews } from './bloomberg';
import { fetchEkonomimNews } from './ekonomim';

export async function fetchNews(query: string, limit: number = 3): Promise<NewsArticle[]> {
  try {
    console.log(`[Unified News Client] Starting concurrent fetch for ${query}...`);
    
    // Concurrently fetch from both sources
    const [bloombergArticles, ekonomimArticles] = await Promise.all([
      fetchBloombergNews(query, limit),
      fetchEkonomimNews(query, limit)
    ]);

    // Merge results
    const combinedResults = [...bloombergArticles, ...ekonomimArticles];
    
    console.log(`[Unified News Client] Successfully fetched ${combinedResults.length} articles.`);
    return combinedResults;

  } catch (error) {
    console.error(`[Unified News Client] Error aggregating news for ${query}:`, error);
    throw error;
  }
}
