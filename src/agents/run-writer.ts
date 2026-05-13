import * as fs from 'fs';
import * as path from 'path';
import { runWriterAgent } from './writer-agent';
import { ReportData } from '../types/research';

async function main() {
  try {
    const jsonPath = path.resolve(__dirname, '../../research/sample-data.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Sample data not found: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const reportData: ReportData = JSON.parse(rawData);

    const timestamp = Date.now();
    const slug = reportData.title.replace(/\s+/g, '-').toLowerCase();
    const outputDir = path.resolve(__dirname, '../../outputs', `${timestamp}-${slug}`);

    await runWriterAgent(reportData, outputDir);
    console.log(`Output directory: ${outputDir}`);
  } catch (error) {
    console.error('Error in run-writer:', error);
    process.exit(1);
  }
}

main();
