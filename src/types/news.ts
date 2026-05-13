import { z } from 'zod';

export interface NewsArticle {
  title: string;
  date: string;
  source: string;
  url: string;
  content: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export const NewsArticleSchema = z.object({
  title: z.string(),
  date: z.string(),
  source: z.string(),
  url: z.string(),
  content: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
});
