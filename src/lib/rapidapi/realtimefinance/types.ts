export interface Quote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
  currency: string;
  exchange: string;
  shortName: string;
  longName: string;
}

export interface QuoteResponse {
  result: Quote[];
  error: any;
}

export interface RealTimeFinanceResponse {
  quoteResponse: QuoteResponse;
}
