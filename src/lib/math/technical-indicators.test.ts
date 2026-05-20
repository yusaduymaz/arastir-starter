// src/lib/math/technical-indicators.test.ts
import { describe, it, expect } from 'vitest';
import { calculateSMA, calculateRSI, calculateVolumeSMA } from './technical-indicators';

describe('technical indicators math helpers', () => {
  describe('calculateSMA', () => {
    it('returns empty array when input is empty', () => {
      expect(calculateSMA([], 5)).toEqual([]);
    });

    it('returns nulls for indices less than period - 1, and correct averages otherwise', () => {
      const data = [10, 20, 30, 40, 50];
      const period = 3;
      const expected = [
        null,
        null,
        (10 + 20 + 30) / 3, // index 2
        (20 + 30 + 40) / 3, // index 3
        (30 + 40 + 50) / 3, // index 4
      ];
      const result = calculateSMA(data, period);
      expect(result.slice(0, 2)).toEqual([null, null]);
      expect(result[2]).toBeCloseTo(20, 5);
      expect(result[3]).toBeCloseTo(30, 5);
      expect(result[4]).toBeCloseTo(40, 5);
    });
  });

  describe('calculateRSI', () => {
    it('returns empty array on empty input', () => {
      expect(calculateRSI([], 14)).toEqual([]);
    });

    it('returns array of nulls when input length is less than or equal to period', () => {
      const data = Array.from({ length: 14 }, (_, idx) => 10 + idx);
      expect(calculateRSI(data, 14)).toEqual(new Array(14).fill(null));
    });

    it('calculates correct RSI values for a simple trend', () => {
      // Mocking 15 values of steady increase (prices going up by 1 each day)
      // Since it only goes up, RSI should be 100 on Wilder's smoothing
      const data = Array.from({ length: 20 }, (_, idx) => 10 + idx);
      const rsi = calculateRSI(data, 14);
      expect(rsi.length).toBe(20);
      expect(rsi.slice(0, 14)).toEqual(new Array(14).fill(null));
      expect(rsi[14]).toBeCloseTo(100, 5);
      expect(rsi[19]).toBeCloseTo(100, 5);
    });

    it('calculates correct RSI values for a steady decline', () => {
      // Prices going down by 1 each day, RSI should be 0
      const data = Array.from({ length: 20 }, (_, idx) => 100 - idx);
      const rsi = calculateRSI(data, 14);
      expect(rsi.slice(0, 14)).toEqual(new Array(14).fill(null));
      expect(rsi[14]).toBeCloseTo(0, 5);
      expect(rsi[19]).toBeCloseTo(0, 5);
    });
  });

  describe('calculateVolumeSMA', () => {
    it('delegates to calculateSMA correctly', () => {
      const data = [100, 200, 300, 400];
      expect(calculateVolumeSMA(data, 2)).toEqual([
        null,
        150,
        250,
        350,
      ]);
    });
  });
});
