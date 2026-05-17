import { describe, it, expect } from 'vitest';
import { getLatestRates } from './index';
import { RapidApiError } from '../types';

describe('Exchange Rates API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get latest rates', async () => {
      // This test requires a valid RAPIDAPI_EXCHANGERATES_KEY environment variable
      const result = await getLatestRates('USD');
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('result');
      expect(result.result).toBe('success');
      expect(result).toHaveProperty('base_code');
      expect(result.base_code).toBe('USD');
      expect(result).toHaveProperty('conversion_rates');
      expect(typeof result.conversion_rates.TRY).toBe('number');
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Exchange Rates API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
