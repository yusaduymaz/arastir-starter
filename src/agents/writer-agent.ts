import * as fs from 'fs';
import * as path from 'path';
import { ReportData } from '../types/research';
import { generatePdfReport } from '../lib/pdf/generator';
import { generatePptxReport } from '../lib/pptx/generator';

export async function runWriterAgent(data: ReportData, outputDir: string): Promise<void> {
  console.log('Generating reports...');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfOutputPath = path.join(outputDir, 'report.pdf');
  const pptxOutputPath = path.join(outputDir, 'presentation.pptx');

  await Promise.all([
    generatePdfReport(data, pdfOutputPath),
    generatePptxReport(data, pptxOutputPath)
  ]);

  console.log('Finished.');
}
