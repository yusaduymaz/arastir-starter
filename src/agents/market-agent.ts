import { getStockQuote, getCompanyOverview } from '../lib/market/client';
import { fetchYahooMarketData } from '../lib/market/providers/yahoo';
import { getYahooMarketData } from '../lib/market/yahoo-client';
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

  // Tier 1: RapidAPI Yahoo providers (3 sub-providers: Yahoo Real-Time -> YH Finance -> Real-time Finance)
  try {
    const rtData = await fetchYahooMarketData(ticker);
    if (rtData) {
      data = rtData;
      provider = rtData.source?.provider || 'yahoo_realtime';
      console.log(`[Market Agent] Tier 1 success: ${provider}`);
    }
  } catch (err) {
    console.warn(`[Market Agent] Tier 1 failed:`, err);
  }

  // Tier 2: Yahoo Finance v3 (direct via yahoo-finance2 library)
  if (!data) {
    try {
      const yahooData = await getYahooMarketData(ticker);
      if (yahooData) {
        data = {
          ...yahooData,
          source: { provider: 'yahoo_finance_v3', fetched_at: Date.now(), ttl_remaining: 3600 }
        };
        provider = 'yahoo_finance_v3';
        console.log(`[Market Agent] Tier 2 success: yahoo_finance_v3`);
      }
    } catch (err) {
      console.warn(`[Market Agent] Tier 2 failed:`, err);
    }
  }

  // Tier 3: Alpha Vantage (rate-limited fallback)
  if (!data) {
    try {
      const avQuote = await getStockQuote(ticker);
      const avOverview = await getCompanyOverview(ticker);
      data = {
        quote: avQuote,
        overview: avOverview,
        monthlySeries: {},
        source: { provider: 'alpha_vantage', fetched_at: Date.now(), ttl_remaining: 3600 }
      };
      provider = 'alpha_vantage';
      console.log(`[Market Agent] Tier 3 success: alpha_vantage`);
    } catch (err) {
      console.warn(`[Market Agent] Tier 3 (Alpha Vantage) failed:`, err);
    }
  }

  // All tiers exhausted
  if (!data) {
    const errorMsg = `All 3 provider tiers failed for ${ticker}`;
    console.error(`[Market Agent] ${errorMsg}`);
    await supabase.from('agent_runs').update({
      status: 'failed',
      error_message: errorMsg,
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    return null;
  }

  console.log(`[Market Agent] Successfully fetched market data for ${ticker} via ${provider}`);
  await supabase.from('agent_runs').update({
    status: 'completed',
    output_data: data as any,
    completed_at: new Date().toISOString()
  }).eq('id', runId);

  return data;
}
