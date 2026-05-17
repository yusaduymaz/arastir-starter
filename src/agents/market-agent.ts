import { getFullMarketData } from '../lib/market/client';
import { fetchYahooMarketData } from '../lib/market/providers/yahoo';
import { MarketData } from '../types/market';
import { SupabaseClient } from '@supabase/supabase-js';

export async function runMarketAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string,
  ticker: string
): Promise<MarketData | null> {
  console.log(`[Market Agent] Fetching real-time market data for ${ticker}...`);

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  let data: MarketData | null = null;
  let provider = 'unknown';

  try {
    // 1. Try RapidAPI Yahoo provider chain first (Yahoo Real-Time -> YH Finance -> Real-time Finance)
    const rtData = await fetchYahooMarketData(ticker);
    if (rtData) {
      data = rtData;
      provider = rtData.source?.provider || 'yahoo_realtime';
    }
  } catch (error) {
    console.warn(`[Market Agent] RapidAPI Yahoo provider chain failed for ${ticker}, falling back to Alpha Vantage...`);
  }

  // 2. Fallback to Alpha Vantage if RT data missing/failed
  if (!data) {
    try {
      const avData = await getFullMarketData(ticker);
      data = {
        ...avData,
        source: { provider: 'alpha_vantage', fetched_at: Date.now(), ttl_remaining: 3600 }
      };
      provider = 'alpha_vantage';
    } catch (error: any) {
      console.error(`[Market Agent] Failed to fetch market data for ${ticker}:`, error);
      await supabase.from('agent_runs').update({ 
        status: 'failed', 
        error_message: error.message || 'Unknown error',
        completed_at: new Date().toISOString()
      }).eq('id', runId);
      return null;
    }
  }

  console.log(`[Market Agent] Successfully fetched market data for ${ticker} via ${provider}`);
  await supabase.from('agent_runs').update({ 
    status: 'completed', 
    output_data: data as any,
    completed_at: new Date().toISOString()
  }).eq('id', runId);

  return data;
}
