import { describe, it, expect } from 'vitest';
import { getRsi } from './index';
import { RapidApiError } from '../types';

describe('Crypto RSI API Client', () => {
  if (process.env.RAPIDAPI_LIVE_TESTS === '1') {
    it('should get RSI', async () => {
      // This test requires a valid RAPIDAPI_CRYPTORSI_KEY environment variable
      const result = await getRsi('BTCUSDT', '15');
      if (result instanceof RapidApiError) {
        throw result;
      }
      expect(result).toHaveProperty('symbol');
      expect(result.symbol).toBe('BTCUSDT');
      expect(result).toHaveProperty('interval');
      expect(result.interval).toBe('15');
      expect(result).toHaveProperty('indicator');
      expect(result.indicator).toBe('rsi');
      expect(result).toHaveProperty('value');
      expect(typeof result.value).toBe('number');
    });
  } else {
    it('should skip live tests', () => {
      console.log('Skipping live Crypto RSI API client tests. Set RAPIDAPI_LIVE_TESTS=1 to run them.');
      expect(true).toBe(true);
    });
  }
});
