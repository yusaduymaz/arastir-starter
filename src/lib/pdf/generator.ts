import puppeteer from 'puppeteer';
import { ReportData } from '../../types/research';
import { marked } from 'marked';

export async function generatePdfReport(data: ReportData, outputPath: string): Promise<void> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    
    const execSummaryHtml = data.executiveSummary ? await marked.parse(data.executiveSummary) : '';
    const macroContextHtml = data.macroContext ? await marked.parse(data.macroContext) : '';
    const risksHtml = data.risks ? await marked.parse(data.risks) : '';
    const oppsHtml = data.opportunities ? await marked.parse(data.opportunities) : '';

    // Generate HTML
    const htmlString = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: "Georgia", serif; 
            padding: 3rem; 
            color: #1a1a1a;
            line-height: 1.6;
          }
          .header-banner {
            border-bottom: 2px solid #003366;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          h1 { 
            color: #003366; 
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          h2 {
            color: #003366;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 5px;
            margin-top: 2rem;
          }
          .meta { 
            color: #555; 
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 12px;
          }
          .section { margin-bottom: 2rem; }
          .markdown-content p { margin-bottom: 1rem; }
          .markdown-content ul { margin-bottom: 1rem; padding-left: 1.5rem; }
          .markdown-content li { margin-bottom: 0.5rem; }
          .markdown-content strong { color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f8f9fa; color: #333; }
        </style>
      </head>
      <body>
        <div class="header-banner">
          <h1>${data.title}</h1>
          <div class="meta">
            <span><strong>Kaynak:</strong> ${data.source}</span> | 
            <span><strong>Tarih:</strong> ${data.dateGenerated}</span>
          </div>
        </div>
        
        ${execSummaryHtml ? `
        <div class="section markdown-content">
          <h2>Yönetici Özeti</h2>
          ${execSummaryHtml}
        </div>
        ` : ''}

        ${macroContextHtml ? `
        <div class="section markdown-content">
          <h2>Makroekonomik Bağlam</h2>
          ${macroContextHtml}
        </div>
        ` : ''}

        ${risksHtml ? `
        <div class="section markdown-content">
          <h2>Olası Riskler</h2>
          ${risksHtml}
        </div>
        ` : ''}

        ${oppsHtml ? `
        <div class="section markdown-content">
          <h2>Fırsatlar</h2>
          ${oppsHtml}
        </div>
        ` : ''}

        <div class="section">
          <h2>Sayısal Veriler</h2>
          <table>
            <thead>
              <tr>
                <th>Metrik</th>
                <th>Değer</th>
              </tr>
            </thead>
            <tbody>
              ${data.data ? data.data.map(item => `
                <tr>
                  <td>${item.label}</td>
                  <td>${item.value}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPath, format: 'A4', printBackground: true, margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' } });
  } finally {
    await browser.close();
  }
}
