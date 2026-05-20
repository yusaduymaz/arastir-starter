import { z } from 'zod';

export const StockQuoteSchema = z.object({
  symbol: z.string(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  price: z.string(),
  volume: z.string(),
  latestTradingDay: z.string(),
  previousClose: z.string(),
  change: z.string(),
  changePercent: z.string(),
});

export const CompanyOverviewSchema = z.object({
  Symbol: z.string(),
  Name: z.string().default(''),
  Description: z.string().default(''),
  Exchange: z.string().default(''),
  Currency: z.string().default(''),
  Country: z.string().default(''),
  Sector: z.string().default(''),
  Industry: z.string().default(''),
  MarketCapitalization: z.string().default(''),
  PERatio: z.string().default(''),
  EPS: z.string().default(''),
  DividendYield: z.string().default(''),
  '52WeekHigh': z.string().default(''),
  '52WeekLow': z.string().default(''),
  PBRatio: z.string().default(''),
  Beta: z.string().default(''),
  FloatShares: z.string().default(''),
  ROE: z.string().default(''),
  ROA: z.string().default(''),
  NetMargin: z.string().default(''),
}).passthrough();

export const TimeSeriesEntrySchema = z.object({
  '1. open': z.string(),
  '2. high': z.string(),
  '3. low': z.string(),
  '4. close': z.string(),
  '5. volume': z.string(),
});

export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;
export type TimeSeriesEntry = z.infer<typeof TimeSeriesEntrySchema>;

export interface MarketData {
  quote: StockQuote;
  overview: CompanyOverview | null;
  timeSeries: Record<string, TimeSeriesEntry>;
  benchmarkSeries?: Record<string, TimeSeriesEntry>;
  source: {
    provider: string;
    fetched_at: number;
    ttl_remaining: number;
  };
}
