import YahooFinance from 'yahoo-finance2';

export interface TickerQuote {
  symbol: string;
  price: string;
  change: string;
  changePercent: number;
  up: boolean;
}

const BIST_SYMBOLS = [
  'THYAO.IS', 'EREGL.IS', 'SASA.IS', 'ASELS.IS', 'GARAN.IS',
  'AKBNK.IS', 'KCHOL.IS', 'TUPRS.IS', 'BIMAS.IS', 'FROTO.IS',
  'PGSUS.IS', 'TOASO.IS', 'VESTL.IS'
];

const FX_COMMODITY_SYMBOLS = [
  'TRY=X',     // USD/TRY
  'EURTRY=X',  // EUR/TRY
  'GLDTR.IS'   // Istanbul Gold ETF
];

const ALL_SYMBOLS = [...BIST_SYMBOLS, ...FX_COMMODITY_SYMBOLS];

const CACHE_TTL_MS = 10 * 60 * 1000;
const tickerCache = new Map<string, { data: TickerQuote[]; ts: number }>();

// Reusing YahooFinance default export which acts as a singleton
const yahooFinance = YahooFinance; 

async function fetchTickerData(): Promise<TickerQuote[]> {
  try {
    const results = await yahooFinance.quote(ALL_SYMBOLS, {}, { validateResult: false });
    
    // results is any[], we need to map to TickerQuote[]
    const validResults = (results as any[]).filter(q => q && q.regularMarketPrice != null);
    
    return validResults.map(q => {
      let displaySymbol = q.symbol.replace('.IS', '');
      if (displaySymbol === 'TRY=X') displaySymbol = 'DOLAR';
      if (displaySymbol === 'EURTRY=X') displaySymbol = 'EURO';
      if (displaySymbol === 'GLDTR') displaySymbol = 'ALTIN';

      const price = q.regularMarketPrice as number;
      const formattedPrice = new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: price >= 10000 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(price);

      const changePercent = (q.regularMarketChangePercent as number) || 0;
      const change = (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%';
      
      const changeRaw = (q.regularMarketChange as number) || 0;
      const up = changeRaw >= 0;

      return {
        symbol: displaySymbol,
        price: formattedPrice,
        change,
        changePercent,
        up
      };
    });
  } catch (err: any) {
    console.warn('[Ticker] Batch fetch failed:', err.message);
    return [];
  }
}

export async function getTickerData(): Promise<TickerQuote[]> {
  const cached = tickerCache.get('dashboard-tickers');
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log('[Ticker] Cache hit');
    return cached.data;
  }

  const data = await fetchTickerData();
  if (data && data.length > 0) {
    tickerCache.set('dashboard-tickers', { data, ts: Date.now() });
  }
  return data;
}
