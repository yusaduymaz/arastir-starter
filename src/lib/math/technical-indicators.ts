// src/lib/math/technical-indicators.ts

/**
 * Calculates Simple Moving Average (SMA) for a given array of numbers.
 * Returns an array of the same length, filled with nulls where indices are less than period - 1.
 */
export function calculateSMA(data: number[], period: number): (number | null)[] {
  if (!data || data.length === 0 || period <= 0) return [];
  return data.map((_, idx, arr) => {
    if (idx < period - 1) return null;
    const slice = arr.slice(idx - period + 1, idx + 1);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    return sum / period;
  });
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's smoothing.
 * Returns an array of the same length, filled with nulls where indices are less than or equal to period.
 */
export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  if (!data || data.length === 0 || period <= 0) return [];
  const rsi: (number | null)[] = new Array(data.length).fill(null);
  if (data.length <= period) return rsi;

  let avgGain = 0;
  let avgLoss = 0;

  // First RSI value calculation
  let sumGain = 0;
  let sumLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      sumGain += change;
    } else {
      sumLoss += Math.abs(change);
    }
  }

  avgGain = sumGain / period;
  avgLoss = sumLoss / period;

  if (avgLoss === 0) {
    rsi[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsi[period] = 100 - 100 / (1 + rs);
  }

  // Subsequent RSI calculations using Wilder's smoothing
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }

  return rsi;
}

/**
 * Calculates simple moving average specifically for volume series.
 */
export function calculateVolumeSMA(data: number[], period: number = 20): (number | null)[] {
  return calculateSMA(data, period);
}
