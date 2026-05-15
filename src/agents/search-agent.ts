import { z } from 'zod';
import { fetchDisclosures } from '../lib/kap/client';
import { KAPDisclosure, KAPDisclosureSchema } from '../types/kap';
import { SupabaseClient } from '@supabase/supabase-js';

export async function runSearchAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string,
  topic: string
): Promise<KAPDisclosure[]> {
  console.log(`[Search Agent] Starting search for topic/ticker: ${topic}`);

  await supabase.from('agent_runs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', runId);

  try {
    // 1. Fetch data
    const rawData = await fetchDisclosures(topic, 5);

    // 2. Validate data
    console.log(`[Search Agent] Validating ${rawData.length} records...`);
    const validatedData = z.array(KAPDisclosureSchema).parse(rawData);

    console.log(`[Search Agent] Successfully validated ${validatedData.length} disclosures for ${topic}`);

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: validatedData,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

    return validatedData;
  } catch (error: any) {
    console.error(`[Search Agent] Failed to search data for ${topic}:`, error);
    await supabase.from('agent_runs').update({ 
      status: 'failed', 
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    throw error;
  }
}
