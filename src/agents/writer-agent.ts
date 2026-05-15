import * as fs from 'fs';
import * as path from 'path';
import { ReportData } from '../types/research';
import { generatePdfReport } from '../lib/pdf/generator';
import { generatePptxReport } from '../lib/pptx/generator';
import { SupabaseClient } from '@supabase/supabase-js';

export async function runWriterAgent(
  supabase: SupabaseClient,
  sessionId: string,
  runId: string,
  data: ReportData, 
  outputDir: string
): Promise<void> {
  console.log('[Writer Agent] Generating reports (PDF & PPTX)...');
  
  await supabase.from('agent_runs').update({ 
    status: 'running', 
    started_at: new Date().toISOString() 
  }).eq('id', runId);

  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfOutputPath = path.join(outputDir, 'report.pdf');
    const pptxOutputPath = path.join(outputDir, 'presentation.pptx');

    await Promise.all([
      generatePdfReport(data, pdfOutputPath),
      generatePptxReport(data, pptxOutputPath)
    ]);

    console.log('[Writer Agent] Reports generated successfully.');

    await supabase.from('agent_runs').update({ 
      status: 'completed', 
      output_data: { pdf: true, pptx: true, path: outputDir } as any,
      completed_at: new Date().toISOString()
    }).eq('id', runId);

  } catch (error: any) {
    console.error(`[Writer Agent] Failed to generate reports:`, error);
    await supabase.from('agent_runs').update({ 
      status: 'failed', 
      error_message: error.message || 'Unknown error',
      completed_at: new Date().toISOString()
    }).eq('id', runId);
    throw error;
  }
}

