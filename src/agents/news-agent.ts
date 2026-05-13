import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { fetchNews } from '../lib/news/client';
import { NewsArticleSchema } from '../types/news';
import { analyzeSentiment } from '../lib/news/sentiment';

export async function runNewsAgent(topic: string): Promise<string> {
  console.log(`[News Agent] Starting news search and analysis for: ${topic}`);

  try {
    // 1. Fetch data
    const rawData = await fetchNews(topic, 3);
    
    // 2. Analyze sentiment
    console.log(`[News Agent] Analyzing sentiment for ${rawData.length} articles...`);
    const analyzedData = rawData.map(article => {
      const { sentiment } = analyzeSentiment(article.content);
      return {
        ...article,
        sentiment
      };
    });

    // 3. Validate data
    console.log('[News Agent] Validating data structure...');
    const validatedData = z.array(NewsArticleSchema).parse(analyzedData);
    
    // 4. Prepare output directory
    const researchDir = path.resolve(__dirname, '../../research');
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }

    // 5. Save to file
    const timestamp = Date.now();
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${timestamp}-${safeTopic}-news.json`;
    const outputPath = path.join(researchDir, fileName);

    fs.writeFileSync(outputPath, JSON.stringify(validatedData, null, 2), 'utf-8');
    console.log(`[News Agent] Successfully saved validated news data to: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error(`[News Agent] Failed to process news for ${topic}:`, error);
    throw error;
  }
}

// CLI Execution Wrapper
async function main() {
  const args = process.argv.slice(2);
  const topic = args[0];

  if (!topic) {
    console.error('Usage: npx ts-node src/agents/news-agent.ts <TICKER/TOPIC>');
    process.exit(1);
  }

  try {
    await runNewsAgent(topic);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}
