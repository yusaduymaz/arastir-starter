import { z } from 'zod';
import { fetchDisclosures } from '../lib/kap/client';
import { KAPDisclosure, KAPDisclosureSchema } from '../types/kap';

export async function runSearchAgent(topic: string): Promise<KAPDisclosure[]> {
  console.log(`[Search Agent] Starting search for topic/ticker: ${topic}`);

  try {
    // 1. Fetch data
    const rawData = await fetchDisclosures(topic, 5);

    // 2. Validate data
    console.log(`[Search Agent] Validating ${rawData.length} records...`);
    const validatedData = z.array(KAPDisclosureSchema).parse(rawData);

    console.log(`[Search Agent] Successfully validated ${validatedData.length} disclosures for ${topic}`);

    return validatedData;
  } catch (error) {
    console.error(`[Search Agent] Failed to search data for ${topic}:`, error);
    throw error;
  }
}
