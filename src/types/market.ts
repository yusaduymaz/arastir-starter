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
}).passthrough();

export const MonthlySeriesEntrySchema = z.object({
  '1. open': z.string(),
  '2. high': z.string(),
  '3. low': z.string(),
  '4. close': z.string(),
  '5. volume': z.string(),
});

export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type CompanyOverview = z.infer<typeof CompanyOverviewSchema>;
export type MonthlySeriesEntry = z.infer<typeof MonthlySeriesEntrySchema>;

export interface MarketData {
  quote: StockQuote;
  overview: CompanyOverview | null;
  monthlySeries: Record<string, MonthlySeriesEntry>;
}
