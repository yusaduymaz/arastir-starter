import { getMacroEconomicData, EvdsDataPoint } from '../lib/tcmb/client';

function toDdMmYyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function runMacroAgent(): Promise<EvdsDataPoint[]> {
  console.log('[Macro Agent] Fetching TCMB EVDS macro series (USD/CPI/policy rate, last 12 months)...');

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

    return data;
  } catch (error) {
    console.error('[Macro Agent] Failed to fetch macro data:', error);
    throw error;
  }
}
