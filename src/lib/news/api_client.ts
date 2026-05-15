// src/lib/news/api_client.ts
import { z } from 'zod';

// Currents API'den gelen haber nesnesi için Zod şeması
const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(''),
  url: z.string(),
  author: z.string().default(''),
  image: z.string().default('None'), // "None" gelebilir
  language: z.string(),
  category: z.array(z.string()),
  published: z.string(), // "2026-05-13 13:34:30 +0000" formatında — ISO 8601 değil
});

// API'nin tam yanıtı için Zod şeması
const CurrentsApiResponseSchema = z.object({
  status: z.string(),
  news: z.array(NewsArticleSchema),
});

// Zod şemasından TypeScript tipini oluşturuyoruz
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

const API_BASE_URL = 'https://api.currentsapi.services/v1/search';

/**
 * Belirtilen anahtar kelimelerle Türkiye'den finans ve iş dünyası haberlerini arar.
 *
 * @param {string} keywords Aranacak anahtar kelimeler (örn: "THYAO", "enflasyon").
 * @returns {Promise<NewsArticle[]>} Bulunan haber makalelerinin bir dizisini döndürür.
 * @throws {Error} API anahtarı eksikse veya API'den başarısız bir yanıt alınırsa hata fırlatır.
 */
export const searchNews = async (keywords: string): Promise<NewsArticle[]> => {
  const apiKey = process.env.CURRENTS_API_KEY;
  if (!apiKey) {
    throw new Error('CURRENTS_API_KEY is not defined in your .env.local file.');
  }

  const params = new URLSearchParams({
    keywords,
    language: 'tr',
    apiKey,
  });

  const url = `${API_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Currents API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: unknown = await response.json();

    // Gelen veriyi Zod şemamızla doğruluyoruz
    const validationResult = CurrentsApiResponseSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('Currents API response validation failed:', validationResult.error);
      throw new Error('Invalid data structure received from Currents API.');
    }

    if (validationResult.data.status !== 'ok') {
        throw new Error(`Currents API returned status: ${validationResult.data.status}`);
    }

    // Doğrulanmış ve temiz veriyi döndürüyoruz
    return validationResult.data.news;

  } catch (error) {
    console.error('Error fetching data from Currents API:', error);
    throw error;
  }
};

/**
 * Currents API bağlantısını test etmek için örnek bir fonksiyon.
 */
export const testCurrentsConnection = async () => {
    console.log('Testing connection to Currents API...');
    try {
        const news = await searchNews('Borsa İstanbul');
        console.log(`Successfully fetched ${news.length} articles about "Borsa İstanbul".`);
        if (news.length > 0) {
            console.log('First article title:', news[0].title);
            console.log('Published date:', news[0].published);
        }
        return news;
    } catch (error) {
        console.error('Currents API connection test failed.');
        return null;
    }
}
