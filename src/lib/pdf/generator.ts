import { ReportData } from '../../types/research';
import { marked } from 'marked';
import * as fs from 'fs';

export async function generatePdfReport(data: ReportData, outputPath: string): Promise<void> {
  console.warn("[PDF Generator] PDF generation is temporarily disabled for Vercel deployment compatibility (Puppeteer removed).");
  
  // Write a dummy file to satisfy any filesystem checks
  fs.writeFileSync(outputPath, "PDF generation is disabled in the serverless environment to meet Vercel's 50MB function limit. Please use the PPTX export or view the report in the dashboard.");
}
