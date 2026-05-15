import { getFullMarketData } from '../lib/market/client';
import { MarketData } from '../types/market';

export async function runMarketAgent(ticker: string): Promise<MarketData | null> {
  console.log(`[Market Agent] Fetching Alpha Vantage data for ${ticker}...`);

  try {
    const data: MarketData = await getFullMarketData(ticker);
    console.log(`[Market Agent] Successfully fetched market data for ${ticker}`);
    return data;
  } catch (error) {
    console.error(`[Market Agent] Failed to fetch market data for ${ticker}:`, error);
    return null;
  }
}
