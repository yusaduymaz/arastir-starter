import { getNews as getTurkeyNews } from '../../rapidapi/turkeynews';
import { getNews as getCryptoNews } from '../../rapidapi/cryptonews';
import { RapidApiError } from '../../rapidapi/types';

export interface NewsProviderArticle {
  title: string;
  description: string;
  url: string;
  published: string;
  author: string;
}

export async function fetchNewsFromRapidApi(keywords: string): Promise<NewsProviderArticle[]> {
  const loweredKeywords = keywords.toLowerCase();
  const shouldFetchCrypto = /(crypto|btc|bitcoin|eth|ethereum)/.test(loweredKeywords);

  const [turkeyResult, cryptoResult] = await Promise.all([
    getTurkeyNews(keywords),
    shouldFetchCrypto ? getCryptoNews() : Promise.resolve(null),
  ]);

  const articles: NewsProviderArticle[] = [];

  if (!(turkeyResult instanceof RapidApiError)) {
    articles.push(
      ...turkeyResult.value.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        published: article.datePublished,
        author: article.provider.name || 'Turkey News Live',
      })),
    );
  }

  if (cryptoResult && !(cryptoResult instanceof RapidApiError)) {
    articles.push(
      ...cryptoResult.data.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        published: article.createdAt,
        author: article.source || 'Crypto News',
      })),
    );
  }

  return articles;
}
