/**
 * PDF Report Generator using @react-pdf/renderer.
 *
 * This module must run in the Node.js runtime. API routes that invoke it should
 * export `runtime = 'nodejs'` because @react-pdf/renderer is not Edge-safe.
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import * as fs from 'fs';
import * as path from 'path';
import { ReportData } from '../../types/research';
import { ReportDocument } from './components/ReportDocument';
import { registerPdfFonts } from './styles/theme';

export async function generatePdfReport(data: ReportData, outputPath: string): Promise<void> {
  try {
    console.log(`[PDF Generator] Starting PDF generation for: ${data.title}`);
    registerPdfFonts();

    const buffer = await renderToBuffer(React.createElement(ReportDocument, { data }) as any);
    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`[PDF Generator] PDF created at ${outputPath} (${buffer.length} bytes)`);
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF:', error);
    throw error;
  }
}

