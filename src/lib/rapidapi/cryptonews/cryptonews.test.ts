import { describe, it, expect } from 'vitest';
import { getNews } from './index';
import { RapidApiError } from '../types';

describe('Crypto News API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get news', async () => {
      // This test requires a valid RAPIDAPI_CRYPTONEWS_KEY environment variable
      const result = await getNews();
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data.length > 0) {
        expect(result.data[0]).toHaveProperty('title');
        expect(result.data[0]).toHaveProperty('description');
        expect(result.data[0]).toHaveProperty('url');
        expect(result.data[0]).toHaveProperty('thumbnail');
        expect(result.data[0]).toHaveProperty('createdAt');
        expect(result.data[0]).toHaveProperty('source');
      }
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Crypto News API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
