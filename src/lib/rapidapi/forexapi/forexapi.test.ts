import { describe, it, expect } from 'vitest';
import { getCurrencyExchangeRate } from './index';
import { RapidApiError } from '../types';

describe('Forex API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get currency exchange rate', async () => {
      // This test requires a valid RAPIDAPI_FOREXAPI_KEY environment variable
      const result = await getCurrencyExchangeRate('USD', 'TRY');
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('Realtime Currency Exchange Rate');
      const exchangeRate = result['Realtime Currency Exchange Rate'];
      expect(exchangeRate).toHaveProperty('1. From_Currency Code');
      expect(exchangeRate['1. From_Currency Code']).toBe('USD');
      expect(exchangeRate).toHaveProperty('3. To_Currency Code');
      expect(exchangeRate['3. To_Currency Code']).toBe('TRY');
      expect(exchangeRate).toHaveProperty('5. Exchange Rate');
      expect(typeof exchangeRate['5. Exchange Rate']).toBe('string');
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Forex API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
