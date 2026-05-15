import { z } from 'zod';
import { NewsArticle } from './api_client'; // We can reuse the same output type

// NewsData.io response schema
const NewsDataArticleSchema = z.object({
  article_id: z.string(),
  title: z.string(),
  description: z.string().nullable().default(''),
  link: z.string(),
  creator: z.array(z.string()).nullable().default([]),
  image_url: z.string().nullable().default('None'),
  language: z.string().default(''),
  category: z.array(z.string()).default([]),
  pubDate: z.string(), // e.g. "2026-05-14 23:07:00"
});

const NewsDataApiResponseSchema = z.object({
  status: z.string(),
  totalResults: z.number().optional(),
  results: z.array(NewsDataArticleSchema).default([]),
});

const API_BASE_URL = 'https://newsdata.io/api/1/news';

/**
 * Searches for news using NewsData.io API.
 */
export const searchNewsData = async (keywords: string): Promise<NewsArticle[]> => {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    console.warn('NEWSDATA_API_KEY is not defined in your .env.local file. Skipping NewsData.io.');
    return [];
  }

  const params = new URLSearchParams({
    q: keywords,
    language: 'tr,en', // We can fetch Turkish and English
    apikey: apiKey,
  });

  const url = `${API_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`NewsData API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: unknown = await response.json();
    const validationResult = NewsDataApiResponseSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('NewsData API response validation failed:', validationResult.error);
      throw new Error('Invalid data structure received from NewsData API.');
    }

    if (validationResult.data.status !== 'success') {
        throw new Error(`NewsData API returned status: ${validationResult.data.status}`);
    }

    // Map to the internal NewsArticle format
    return validationResult.data.results.map((article) => ({
      id: article.article_id,
      title: article.title,
      description: article.description || '',
      url: article.link,
      author: article.creator && article.creator.length > 0 ? article.creator.join(', ') : 'Unknown',
      image: article.image_url || 'None',
      language: article.language,
      category: article.category,
      published: article.pubDate,
    }));

  } catch (error) {
    console.error('Error fetching data from NewsData API:', error);
    // Don't throw, just return empty array so it doesn't break the main flow if this API fails
    return [];
  }
};
