import { getFullMarketData } from '../lib/market/client';
import { MarketData } from '../types/market';
import { SupabaseClient } from '@supabase/supabase-js';

export async function runMarketAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string,
  ticker: string
): Promise<MarketData | null> {
  console.log(`[Market Agent] Fetching Alpha Vantage data for ${ticker}...`);

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  try {
    const data: MarketData = await getFullMarketData(ticker);
    console.log(`[Market Agent] Successfully fetched market data for ${ticker}`);

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: data as any,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return data;
  } catch (error: any) {
    console.error(`[Market Agent] Failed to fetch market data for ${ticker}:`, error);
    await supabase.from('agent_runs').update({ 
      status: 'failed', 
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    return null; // or throw error
  }
}

