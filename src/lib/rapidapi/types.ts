export enum RapidApiProvider {
  CNBC = 'CNBC',
  HaremAltin = 'HaremAltin',
  FinanceAPI = 'FinanceAPI',
  ExchangeRates = 'ExchangeRates',
  CryptoNews = 'CryptoNews',
  YFinance = 'YFinance',
  YahooRealTime = 'YahooRealTime',
  CryptoRSI = 'CryptoRSI',
  ForexAPI = 'ForexAPI',
  TurkeyFinancial = 'TurkeyFinancial',
  RealTimeFinance = 'RealTimeFinance',
  TurkeyNews = 'TurkeyNews',
}

const RAPIDAPI_ENV_KEY_ALIASES: Record<RapidApiProvider, readonly string[]> = {
  [RapidApiProvider.CNBC]: ['RAPIDAPI_CNBC_KEY'],
  [RapidApiProvider.HaremAltin]: ['RAPIDAPI_HAREM_ALTIN_KEY', 'RAPIDAPI_HAREMALTIN_KEY'],
  [RapidApiProvider.FinanceAPI]: ['RAPIDAPI_FINANCE_API_KEY', 'RAPIDAPI_FINANCEAPI_KEY'],
  [RapidApiProvider.ExchangeRates]: ['RAPIDAPI_EXCHANGE_RATES_KEY', 'RAPIDAPI_EXCHANGERATES_KEY'],
  [RapidApiProvider.CryptoNews]: ['RAPIDAPI_CRYPTO_NEWS_KEY', 'RAPIDAPI_CRYPTONEWS_KEY'],
  [RapidApiProvider.YFinance]: ['RAPIDAPI_YH_FINANCE_KEY', 'RAPIDAPI_YFINANCE_KEY'],
  [RapidApiProvider.YahooRealTime]: ['RAPIDAPI_YAHOO_REALTIME_KEY', 'RAPIDAPI_YAHOOREALTIME_KEY'],
  [RapidApiProvider.CryptoRSI]: ['RAPIDAPI_CRYPTO_RSI_KEY', 'RAPIDAPI_CRYPTORSI_KEY', 'RAPIDAPI_CRYPTO_INDICATORS_KEY'],
  [RapidApiProvider.ForexAPI]: ['RAPIDAPI_FOREX_KEY', 'RAPIDAPI_FOREXAPI_KEY'],
  [RapidApiProvider.TurkeyFinancial]: ['RAPIDAPI_TURKEY_FINANCIAL_KEY', 'RAPIDAPI_TURKEYFINANCIAL_KEY', 'RAPIDAPI_TURKEY_FINANCE_KEY'],
  [RapidApiProvider.RealTimeFinance]: ['RAPIDAPI_REALTIME_FINANCE_KEY', 'RAPIDAPI_REALTIMEFINANCE_KEY', 'RAPIDAPI_RT_FINANCE_KEY'],
  [RapidApiProvider.TurkeyNews]: ['RAPIDAPI_TURKEY_NEWS_KEY', 'RAPIDAPI_TURKEYNEWS_KEY'],
};

export function getRapidApiEnvKeys(provider: RapidApiProvider): readonly string[] {
  return RAPIDAPI_ENV_KEY_ALIASES[provider];
}

export function getRapidApiKey(provider: RapidApiProvider): string | undefined {
  for (const envKey of getRapidApiEnvKeys(provider)) {
    const value = process.env[envKey];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

export class RapidApiError extends Error {
  public provider: RapidApiProvider;
  public status?: number;
  public code?: string;
  public retry_after?: number;
  public kind: 'missing_key' | 'http_error' | 'network_error';

  constructor(
    message: string,
    options: {
      provider: RapidApiProvider;
      kind: 'missing_key' | 'http_error' | 'network_error';
      status?: number;
      code?: string;
      retry_after?: number;
    }
  ) {
    super(message);
    this.name = 'RapidApiError';
    this.provider = options.provider;
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.retry_after = options.retry_after;
  }
}

export interface RapidApiClient {
  get<T>(path: string, params?: Record<string, string | number>): Promise<T | RapidApiError>;
  post<T>(path: string, body?: any): Promise<T | RapidApiError>;
}
