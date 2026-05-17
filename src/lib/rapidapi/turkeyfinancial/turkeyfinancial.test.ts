import { describe, it, expect } from 'vitest';
import { getBist100 } from './index';
import { RapidApiError } from '../types';

describe('Turkey Financial API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get BIST100 stock data', async () => {
      // This test requires a valid RAPIDAPI_TURKEYFINANCIAL_KEY environment variable
      const result = await getBist100();
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('code');
        expect(result[0]).toHaveProperty('last');
        expect(result[0]).toHaveProperty('change');
        expect(result[0]).toHaveProperty('change_percent');
        expect(result[0]).toHaveProperty('high');
        expect(result[0]).toHaveProperty('low');
        expect(result[0]).toHaveProperty('open');
        expect(result[0]).toHaveProperty('volume');
        expect(result[0]).toHaveProperty('time');
      }
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Turkey Financial API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
