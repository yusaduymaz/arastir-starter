// src/lib/market/client.ts
// Alpha Vantage API İstemcisi — BIST hisse ve piyasa verileri
// BIST hisseleri için sembol formatı: "THYAO.IS" (Istanbul Stock Exchange suffix)
import { z } from 'zod';
import {
  StockQuoteSchema,
  CompanyOverviewSchema,
  MonthlySeriesEntrySchema,
  type StockQuote,
  type CompanyOverview,
  type MarketData,
  type MonthlySeriesEntry,
} from '../../types/market';
import { getYahooMarketData } from './yahoo-client';

// In-process cache to avoid hammering providers when the same ticker is re-queried.
// 15-minute TTL — short enough to keep BIST data fresh, long enough to deflect retry loops.
const CACHE_TTL_MS = 15 * 60 * 1000;
const marketCache = new Map<string, { data: MarketData; ts: number }>();

const BASE_URL = 'https://www.alphavantage.co/query';

const getApiKey = (): string => {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) {
    throw new Error('ALPHA_VANTAGE_API_KEY is not defined in .env.local');
  }
  return key;
};

// BIST ticker'ını Alpha Vantage formatına çevirir: "THYAO" → "THYAO.IS"
const toBistSymbol = (ticker: string): string => {
  const upper = ticker.toUpperCase().trim();
  return upper.endsWith('.IS') ? upper : `${upper}.IS`;
};

const fetchAlphaVantage = async (params: Record<string, string>): Promise<unknown> => {
  const apikey = getApiKey();
  const url = new URL(BASE_URL);
  url.searchParams.set('apikey', apikey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Alpha Vantage request failed (${response.status}): ${body.substring(0, 200)}`);
  }

  const data: unknown = await response.json();

  // Alpha Vantage, hata durumunda JSON içinde "Note" veya "Information" alanı döner
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (obj['Note']) throw new Error(`Alpha Vantage rate limit: ${obj['Note']}`);
    if (obj['Information']) throw new Error(`Alpha Vantage error: ${obj['Information']}`);
  }

  return data;
};

/**
 * Bir BIST hissesinin anlık fiyat verisini getirir.
 * @param ticker Hisse kodu (örn: "THYAO" veya "THYAO.IS")
 */
export const getStockQuote = async (ticker: string): Promise<StockQuote> => {
  const symbol = toBistSymbol(ticker);
  const data = await fetchAlphaVantage({ function: 'GLOBAL_QUOTE', symbol });

  const obj = data as Record<string, unknown>;
  const raw = obj['Global Quote'];
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Alpha Vantage returned no quote data for ${symbol}`);
  }

  const mapped = {
    symbol: (raw as any)['01. symbol'] ?? symbol,
    open: (raw as any)['02. open'] ?? '0',
    high: (raw as any)['03. high'] ?? '0',
    low: (raw as any)['04. low'] ?? '0',
    price: (raw as any)['05. price'] ?? '0',
    volume: (raw as any)['06. volume'] ?? '0',
    latestTradingDay: (raw as any)['07. latest trading day'] ?? '',
    previousClose: (raw as any)['08. previous close'] ?? '0',
    change: (raw as any)['09. change'] ?? '0',
    changePercent: (raw as any)['10. change percent'] ?? '0%',
  };

  const result = StockQuoteSchema.safeParse(mapped);
  if (!result.success) {
    throw new Error(`Invalid quote data for ${symbol}: ${result.error.message}`);
  }
  return result.data;
};

/**
 * Bir şirketin genel bilgilerini (sektör, piyasa değeri, F/K vb.) getirir.
 * @param ticker Hisse kodu (örn: "THYAO")
 */
export const getCompanyOverview = async (ticker: string): Promise<CompanyOverview | null> => {
  const symbol = toBistSymbol(ticker);
  try {
    const data = await fetchAlphaVantage({ function: 'OVERVIEW', symbol });
    const obj = data as Record<string, unknown>;

    // Boş yanıt kontrolü (tanınmayan semboller için Alpha Vantage {} döner)
    if (!obj['Symbol']) {
      console.warn(`[Market] No company overview found for ${symbol}`);
      return null;
    }

    const result = CompanyOverviewSchema.safeParse(obj);
    if (!result.success) {
      console.warn(`[Market] Overview parse warning for ${symbol}:`, result.error.message);
      return null;
    }
    return result.data;
  } catch (err) {
    console.warn(`[Market] getCompanyOverview failed for ${symbol}:`, (err as Error).message);
    return null;
  }
};

/**
 * Aylık kapanış fiyat serisini getirir (son 12 ay için özet çıkarır).
 * @param ticker Hisse kodu
 * @param months Kaç ay geriye gidilsin (varsayılan: 12)
 */
export const getMonthlyPrices = async (
  ticker: string,
  months: number = 12
): Promise<Record<string, MonthlySeriesEntry>> => {
  const symbol = toBistSymbol(ticker);
  const data = await fetchAlphaVantage({ function: 'TIME_SERIES_MONTHLY', symbol });

  const obj = data as Record<string, unknown>;
  const series = obj['Monthly Time Series'] as Record<string, unknown> | undefined;

  if (!series) {
    throw new Error(`No monthly series data returned for ${symbol}`);
  }

  const dates = Object.keys(series).sort().reverse().slice(0, months);
  const result: Record<string, MonthlySeriesEntry> = {};

  for (const date of dates) {
    const entry = MonthlySeriesEntrySchema.safeParse(series[date]);
    if (entry.success) {
      result[date] = entry.data;
    }
  }

  return result;
};

/**
 * Bir hisse için tüm piyasa verisini (fiyat + genel bilgi + aylık seri) tek seferde getirir.
 * Strateji (Plan 09-04):
 *   1. 15dk cache hit ise cache'i döndür.
 *   2. Yahoo Finance primary — BIST için kotasız ve daha kapsamlı.
 *   3. Yahoo başarısız olursa Alpha Vantage fallback (rate-limited, ama tek-istek-yeterli durumlar için).
 * @param ticker Hisse kodu
 */
export const getFullMarketData = async (ticker: string): Promise<MarketData> => {
  const cacheKey = ticker.toUpperCase().trim();
  const cached = marketCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log(`[Market] Cache hit for ${cacheKey} (age: ${Math.round((Date.now() - cached.ts) / 1000)}s)`);
    return cached.data;
  }

  // Primary: Yahoo Finance
  const yahooResult = await getYahooMarketData(ticker);
  if (yahooResult) {
    console.log(`[Market] Source: Yahoo Finance for ${cacheKey}`);
    const data: MarketData = { ...yahooResult, source: { provider: 'yahoo_finance', fetched_at: Date.now(), ttl_remaining: 3600 } };
    marketCache.set(cacheKey, { data, ts: Date.now() });
    return data;
  }

  // Fallback: Alpha Vantage (rate-limited)
  console.warn(`[Market] Yahoo returned null, falling back to Alpha Vantage for ${cacheKey}`);
  const quote = await getStockQuote(ticker);
  await new Promise(r => setTimeout(r, 1200));
  const overview = await getCompanyOverview(ticker);
  await new Promise(r => setTimeout(r, 1200));
  const monthlySeries = await getMonthlyPrices(ticker, 12);

  const data: MarketData = { 
    quote, 
    overview, 
    monthlySeries, 
    source: { provider: 'alpha_vantage', fetched_at: Date.now(), ttl_remaining: 3600 } 
  };
  marketCache.set(cacheKey, { data, ts: Date.now() });
  return data;
};

export const testAlphaVantageConnection = async () => {
  console.log('[Market] Testing Alpha Vantage connection with THYAO...');
  try {
    const quote = await getStockQuote('THYAO');
    console.log(`[Market] ${quote.symbol} — Fiyat: ${quote.price} | Değişim: ${quote.changePercent}`);
    return quote;
  } catch (err) {
    console.error('[Market] Alpha Vantage connection test failed:', (err as Error).message);
    return null;
  }
};
