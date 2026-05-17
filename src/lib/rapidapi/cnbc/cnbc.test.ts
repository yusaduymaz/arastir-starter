import { describe, it, expect } from 'vitest';
import { translateSymbol } from './index';
import { RapidApiError } from '../types';

describe('CNBC Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should translate a symbol', async () => {
      // This test requires a valid RAPIDAPI_CNBC_KEY environment variable
      const result = await translateSymbol('TSLA');
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('symbol');
      expect(result).toHaveProperty('name');
      expect(result.symbol).toBe('TSLA');
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live CNBC client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
