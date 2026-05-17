// src/lib/market/yahoo-client.ts
// Yahoo Finance client — primary source for BIST tickers.
// yahoo-finance2 handles `.IS` suffix natively and has no daily quota.
// Maps Yahoo's response into the existing MarketData shape used by analyst-agent + reports.

import yf from './yahoo-instance';
import type { MarketData, StockQuote, CompanyOverview, MonthlySeriesEntry } from '../../types/market';

const toBistSymbol = (ticker: string): string => {
  const upper = ticker.toUpperCase().trim();
  return upper.endsWith('.IS') ? upper : `${upper}.IS`;
};

const fmt = (n: unknown): string => {
  if (n === null || n === undefined) return '';
  if (typeof n === 'number' && Number.isFinite(n)) return String(n);
  return String(n);
};

/**
 * Fetch full market data from Yahoo Finance for a BIST ticker.
 * Returns null on any failure so the caller can fall back to Alpha Vantage.
 */
export async function getYahooMarketData(ticker: string): Promise<MarketData | null> {
  const symbol = toBistSymbol(ticker);

  try {
    // 1. Quote — price/volume/change
    const quoteRaw: any = await yf.quote(symbol, {}, { validateResult: false });
    if (!quoteRaw || !quoteRaw.regularMarketPrice) {
      console.warn(`[Yahoo] No quote data for ${symbol}`);
      return null;
    }

    const quote: StockQuote = {
      symbol: quoteRaw.symbol || symbol,
      open: fmt(quoteRaw.regularMarketOpen),
      high: fmt(quoteRaw.regularMarketDayHigh),
      low: fmt(quoteRaw.regularMarketDayLow),
      price: fmt(quoteRaw.regularMarketPrice),
      volume: fmt(quoteRaw.regularMarketVolume),
      latestTradingDay: quoteRaw.regularMarketTime
        ? new Date(quoteRaw.regularMarketTime * 1000 || quoteRaw.regularMarketTime).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      previousClose: fmt(quoteRaw.regularMarketPreviousClose),
      change: fmt(quoteRaw.regularMarketChange),
      changePercent: quoteRaw.regularMarketChangePercent != null
        ? `${Number(quoteRaw.regularMarketChangePercent).toFixed(2)}%`
        : '0%',
    };

    // 2. Quote summary — sector, market cap, ratios
    let overview: CompanyOverview | null = null;
    try {
      const summary: any = await yf.quoteSummary(
        symbol,
        { modules: ['summaryDetail', 'price', 'assetProfile', 'defaultKeyStatistics'] },
        { validateResult: false }
      );

      const profile = summary?.assetProfile || {};
      const price = summary?.price || {};
      const detail = summary?.summaryDetail || {};
      const stats = summary?.defaultKeyStatistics || {};

      overview = {
        Symbol: symbol,
        Name: price.longName || price.shortName || '',
        Description: profile.longBusinessSummary || '',
        Exchange: price.exchangeName || 'BIST',
        Currency: price.currency || 'TRY',
        Country: profile.country || 'Turkey',
        Sector: profile.sector || '',
        Industry: profile.industry || '',
        MarketCapitalization: fmt(price.marketCap?.raw ?? price.marketCap),
        PERatio: fmt(detail.trailingPE?.raw ?? detail.trailingPE),
        EPS: fmt(stats.trailingEps?.raw ?? stats.trailingEps),
        DividendYield: fmt(detail.dividendYield?.raw ?? detail.dividendYield),
        '52WeekHigh': fmt(detail.fiftyTwoWeekHigh?.raw ?? detail.fiftyTwoWeekHigh),
        '52WeekLow': fmt(detail.fiftyTwoWeekLow?.raw ?? detail.fiftyTwoWeekLow),
      } as CompanyOverview;
    } catch (err) {
      console.warn(`[Yahoo] quoteSummary failed for ${symbol}:`, (err as Error).message);
    }

    // 3. Monthly series — last 12 months via chart
    const monthlySeries: Record<string, MonthlySeriesEntry> = {};
    try {
      const period2 = new Date();
      const period1 = new Date();
      period1.setFullYear(period2.getFullYear() - 1);

      const chart: any = await yf.chart(
        symbol,
        { period1, period2, interval: '1mo' },
        { validateResult: false }
      );
      const quotes = chart?.quotes || [];
      for (const q of quotes) {
        if (!q?.date) continue;
        const dateKey = new Date(q.date).toISOString().slice(0, 10);
        monthlySeries[dateKey] = {
          '1. open': fmt(q.open),
          '2. high': fmt(q.high),
          '3. low': fmt(q.low),
          '4. close': fmt(q.close),
          '5. volume': fmt(q.volume),
        };
      }
    } catch (err) {
      console.warn(`[Yahoo] chart failed for ${symbol}:`, (err as Error).message);
    }

    return { 
      quote, 
      overview, 
      monthlySeries, 
      source: { provider: 'yahoo_finance', fetched_at: Date.now(), ttl_remaining: 3600 } 
    };
  } catch (err) {
    console.warn(`[Yahoo] getYahooMarketData failed for ${symbol}:`, (err as Error).message);
    return null;
  }
}
