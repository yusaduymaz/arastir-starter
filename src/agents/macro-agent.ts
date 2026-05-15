import { getMacroEconomicData, EvdsDataPoint } from '../lib/tcmb/client';
import { SupabaseClient } from '@supabase/supabase-js';

function toDdMmYyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function runMacroAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string
): Promise<EvdsDataPoint[]> {
  console.log('[Macro Agent] Fetching TCMB EVDS macro series (USD/CPI/policy rate, last 12 months)...');

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  try {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);

    const data: EvdsDataPoint[] = await getMacroEconomicData(
      toDdMmYyyy(start),
      toDdMmYyyy(end),
      'monthly'
    );

    console.log(`[Macro Agent] Successfully fetched ${data.length} monthly data points`);

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: data as any,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return data;
  } catch (error: any) {
    console.error('[Macro Agent] Failed to fetch macro data:', error);
    await supabase.from('agent_runs').update({ 
      status: 'failed', 
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    throw error;
  }
}

