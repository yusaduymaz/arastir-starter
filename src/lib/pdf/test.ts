import { generatePdfReport } from './generator';
import type { ReportData } from '../../types/research';
import * as fs from 'fs';
import * as path from 'path';

async function runTest() {
  console.log('Running PDF generation test...');
  
  const dataPath = path.join(__dirname, '../../../research/sample-tcmb-data.json');
  console.log(`Reading sample data from: ${dataPath}`);
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const reportData: ReportData = JSON.parse(rawData);

  // Use a dynamic name for the output file
  const outputDir = path.join(__dirname, '../../../outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `test-report-${timestamp}.pdf`);

  console.log(`Generating PDF report at: ${outputPath}`);
  await generatePdfReport(reportData, outputPath);
}

runTest().catch(error => {
    console.error("PDF generation test failed:", error);
    process.exit(1);
});
