import { generatePptxReport } from './generator';
import type { ReportData } from '../../types/research';
import * as fs from 'fs';
import * as path from 'path';

async function runTest() {
  console.log('Running PPTX generation test...');

  const dataPath = path.join(__dirname, '../../../research/sample-tcmb-data.json');
  console.log(`Reading sample data from: ${dataPath}`);
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const reportData: ReportData = JSON.parse(rawData);

  const outputDir = path.join(__dirname, '../../../outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `test-presentation-${timestamp}.pptx`);

  console.log(`Generating PPTX report at: ${outputPath}`);
  await generatePptxReport(reportData, outputPath);
}

runTest().catch(error => {
    console.error("PPTX generation test failed:", error);
    process.exit(1);
});
