import { getQuotes as getYahooRealtimeQuotes } from '../../rapidapi/yahoorealtime';
import { getQuotes as getYhFinanceQuotes } from '../../rapidapi/yhfinance';
import { getQuotes as getRealtimeFinanceQuotes } from '../../rapidapi/realtimefinance';
import { MarketData } from '../../../types/market';
import { RapidApiError } from '../../rapidapi/types';

type MarketProviderName = 'yahoo_realtime' | 'yh_finance' | 'realtime_finance';

interface RapidQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
}

function toSafeNumericString(value: number | undefined): string {
  return Number.isFinite(value) ? String(value) : '0';
}

function mapQuoteToMarketData(quote: RapidQuote, provider: MarketProviderName): MarketData {
  return {
    quote: {
      symbol: quote.symbol,
      open: 'N/A',
      high: 'N/A',
      low: 'N/A',
      price: toSafeNumericString(quote.regularMarketPrice),
      volume: toSafeNumericString(quote.regularMarketVolume),
      latestTradingDay: new Date().toISOString(),
      previousClose: 'N/A',
      change: toSafeNumericString(quote.regularMarketChange),
      changePercent: toSafeNumericString(quote.regularMarketChangePercent),
    },
    overview: null,
    monthlySeries: {},
    source: { provider, fetched_at: Date.now(), ttl_remaining: 3600 },
  };
}

export async function fetchYahooMarketData(ticker: string): Promise<MarketData | null> {
  const providers = [
    { name: 'yahoo_realtime' as const, fetcher: getYahooRealtimeQuotes },
    { name: 'yh_finance' as const, fetcher: getYhFinanceQuotes },
    { name: 'realtime_finance' as const, fetcher: getRealtimeFinanceQuotes },
  ];

  for (const { name, fetcher } of providers) {
    const result = await fetcher([ticker]);
    if (result instanceof RapidApiError) {
      continue;
    }

    const quote = result.quoteResponse.result[0];
    if (!quote) {
      continue;
    }

    return mapQuoteToMarketData(quote, name);
  }

  return null;
}

export async function fetchYahooRealtimeOnly(ticker: string): Promise<MarketData | null> {
  const result = await getYahooRealtimeQuotes([ticker]);
  if (result instanceof RapidApiError || !result.quoteResponse.result.length) {
    return null;
  }

  return mapQuoteToMarketData(result.quoteResponse.result[0], 'yahoo_realtime');
}
