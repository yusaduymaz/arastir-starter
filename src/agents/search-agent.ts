import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { fetchDisclosures } from '../lib/kap/client';
import { KAPDisclosureSchema } from '../types/kap';

export async function runSearchAgent(topic: string): Promise<string> {
  console.log(`[Search Agent] Starting search for topic/ticker: ${topic}`);

  try {
    // 1. Fetch data
    const rawData = await fetchDisclosures(topic, 5);
    
    // 2. Validate data
    console.log(`[Search Agent] Validating ${rawData.length} records...`);
    const validatedData = z.array(KAPDisclosureSchema).parse(rawData);
    
    // 3. Prepare output directory
    const researchDir = path.resolve(__dirname, '../../research');
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }

    // 4. Save to file
    const timestamp = Date.now();
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${timestamp}-${safeTopic}-kap.json`;
    const outputPath = path.join(researchDir, fileName);

    fs.writeFileSync(outputPath, JSON.stringify(validatedData, null, 2), 'utf-8');
    console.log(`[Search Agent] Successfully saved validated data to: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error(`[Search Agent] Failed to search and save data for ${topic}:`, error);
    throw error;
  }
}

// CLI Execution Wrapper
async function main() {
  const args = process.argv.slice(2);
  const topic = args[0];

  if (!topic) {
    console.error('Usage: npx ts-node src/agents/search-agent.ts <TICKER>');
    process.exit(1);
  }

  try {
    await runSearchAgent(topic);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}
