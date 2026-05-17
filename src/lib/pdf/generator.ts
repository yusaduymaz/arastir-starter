import { ReportData } from '../../types/research';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as fs from 'fs';
import * as path from 'path';

export async function generatePdfReport(data: ReportData, outputPath: string): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // ── Helper functions ──
    const checkPageBreak = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addSectionTitle = (title: string, color: [number, number, number]) => {
      checkPageBreak(15);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(margin, y, 3, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text(title, margin + 6, y + 6);
      y += 14;
    };

    const addBodyText = (text: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(text, contentWidth);
      for (const line of lines) {
        checkPageBreak(6);
        doc.text(line, margin, y);
        y += 5;
      }
      y += 4;
    };

    // ── Title Page ──
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 80, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(data.title, margin, 35);

    doc.setFontSize(11);
    doc.setTextColor(180, 180, 180);
    doc.text(`Kaynak: ${data.source}`, margin, 48);

    const dateStr = new Date(data.dateGenerated).toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    doc.text(`Tarih: ${dateStr}`, margin, 56);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Bu rapor Arastir.ai yapay zeka platformu tarafindan otomatik olusturulmustur.', margin, 68);

    y = 90;

    // ── Data Summary Table ──
    if (data.data && data.data.length > 0) {
      addSectionTitle('Ozet Veriler', [34, 197, 94]);

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Gosterge', 'Deger']],
        body: data.data.map(d => [d.label, String(d.value)]),
        headStyles: {
          fillColor: [20, 20, 20],
          textColor: [200, 200, 200],
          fontStyle: 'bold',
          fontSize: 10,
        },
        bodyStyles: {
          fillColor: [245, 245, 245],
          textColor: [60, 60, 60],
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [235, 235, 235],
        },
        theme: 'grid',
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.3,
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ── Executive Summary ──
    if (data.executiveSummary) {
      addSectionTitle('Yonetici Ozeti', [250, 204, 21]);
      addBodyText(data.executiveSummary);
    }

    // ── Risks ──
    if (data.risks) {
      addSectionTitle('Riskler', [239, 68, 68]);
      addBodyText(data.risks);
    }

    // ── Opportunities ──
    if (data.opportunities) {
      addSectionTitle('Firsatlar', [34, 197, 94]);
      addBodyText(data.opportunities);
    }

    // ── Macro Context ──
    if (data.macroContext) {
      addSectionTitle('Makroekonomik Baglam', [96, 165, 250]);
      addBodyText(data.macroContext);
    }

    // ── Footer on each page ──
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      const pageH = doc.internal.pageSize.getHeight();
      doc.text(`Arastir.ai | ${data.title} | Sayfa ${i}/${totalPages}`, margin, pageH - 8);
      doc.text('Bu rapor yatirim danismanligi niteliginde degildir.', pageWidth - margin, pageH - 8, { align: 'right' });
    }

    // ── Save ──
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = doc.output('arraybuffer');
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    console.log(`[PDF Generator] PDF created at ${outputPath}`);
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF:', error);
    throw error;
  }
}
