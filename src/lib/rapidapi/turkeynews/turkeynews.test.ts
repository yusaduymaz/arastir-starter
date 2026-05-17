import { describe, it, expect } from 'vitest';
import { getNews } from './index';
import { RapidApiError } from '../types';

describe('Turkey News API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get news', async () => {
      // This test requires a valid RAPIDAPI_TURKEYNEWS_KEY environment variable
      const result = await getNews('Borsa İstanbul');
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('_type');
      expect(result._type).toBe('News');
      expect(result).toHaveProperty('value');
      expect(Array.isArray(result.value)).toBe(true);
      if (result.value.length > 0) {
        expect(result.value[0]).toHaveProperty('title');
        expect(result.value[0]).toHaveProperty('url');
        expect(result.value[0]).toHaveProperty('provider');
        expect(result.value[0].provider).toHaveProperty('name');
      }
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Turkey News API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
