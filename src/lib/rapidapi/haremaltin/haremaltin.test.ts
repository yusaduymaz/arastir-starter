import { describe, it, expect } from 'vitest';
import { getGoldPrices } from './index';
import { RapidApiError } from '../types';

describe('Harem Altin Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get gold prices', async () => {
      // This test requires a valid RAPIDAPI_HAREMALTIN_KEY environment variable
      const result = await getGoldPrices();
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('result');
      expect(Array.isArray(result.result)).toBe(true);
      if (result.result.length > 0) {
        expect(result.result[0]).toHaveProperty('name');
        expect(result.result[0]).toHaveProperty('buying');
        expect(result.result[0]).toHaveProperty('selling');
        expect(result.result[0]).toHaveProperty('change');
        expect(result.result[0]).toHaveProperty('time');
      }
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Harem Altin client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
