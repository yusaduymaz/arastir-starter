import { describe, it, expect } from 'vitest';
import { getQuotes } from './index';
import { RapidApiError } from '../types';

describe('YH Finance API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get quotes', async () => {
      // This test requires a valid RAPIDAPI_YFINANCE_KEY environment variable
      const result = await getQuotes(['AAPL', 'GOOG']);
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('quoteResponse');
      expect(result.quoteResponse).toHaveProperty('result');
      expect(Array.isArray(result.quoteResponse.result)).toBe(true);
      if (result.quoteResponse.result.length > 0) {
        expect(result.quoteResponse.result[0]).toHaveProperty('symbol');
        expect(result.quoteResponse.result[0]).toHaveProperty('regularMarketPrice');
      }
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live YH Finance API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
