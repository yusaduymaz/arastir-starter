import puppeteer from 'puppeteer';
import { ReportData } from '../../types/research';

export async function generatePdfReport(data: ReportData, outputPath: string): Promise<void> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    
    // Generate HTML
    const htmlString = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
          h1 { color: #333; }
          .meta { color: #666; margin-bottom: 2rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${data.title}</h1>
        <div class="meta">
          <p><strong>Kaynak:</strong> ${data.source}</p>
          <p><strong>Oluşturulma Tarihi:</strong> ${data.dateGenerated}</p>
        </div>
        
        <h2>Veriler</h2>
        <table>
          <thead>
            <tr>
              <th>Etiket</th>
              <th>Değer</th>
            </tr>
          </thead>
          <tbody>
            ${data.data.map(item => `
              <tr>
                <td>${item.label}</td>
                <td>${item.value}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    await page.setContent(htmlString, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputPath, format: 'A4', printBackground: true, margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' } });
  } finally {
    await browser.close();
  }
}
