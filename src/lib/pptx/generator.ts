import PptxGenJS from 'pptxgenjs';
import { ReportData } from '../../types/research';

export async function generatePptxReport(data: ReportData, outputPath: string): Promise<void> {
  try {
    const pptx = new PptxGenJS();

    // 1. Title Slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText(data.title, {
      x: 1, y: 1, w: 8, h: 1,
      fontSize: 24, bold: true, color: '363636',
      align: 'center'
    });
    titleSlide.addText(`Kaynak: ${data.source}`, {
      x: 1, y: 2.5, w: 8, h: 0.5,
      fontSize: 14, color: '666666',
      align: 'center'
    });
    titleSlide.addText(`Oluşturulma Tarihi: ${data.dateGenerated}`, {
      x: 1, y: 3, w: 8, h: 0.5,
      fontSize: 12, color: '666666',
      align: 'center'
    });

    // 2. Data Slide
    const dataSlide = pptx.addSlide();
    dataSlide.addText('Veri Özeti', {
      x: 0.5, y: 0.5, w: 9, h: 0.5,
      fontSize: 18, bold: true, color: '363636'
    });

    // Attempt to map data to a chart if all values are numeric or can be parsed as numeric
    const isNumericData = data.data.every(item => !isNaN(Number(item.value)));

    if (isNumericData && data.data.length > 0) {
      const labels = data.data.map(item => item.label);
      const values = data.data.map(item => Number(item.value));

      const chartData = [
        {
          name: data.title,
          labels: labels,
          values: values
        }
      ];

      dataSlide.addChart('bar', chartData, {
        x: 0.5, y: 1.5, w: 9, h: 3.5,
        showTitle: false,
        barDir: 'col',
        valAxisMinVal: 0
      });
    } else {
      // Fallback to a simple table if data is mixed or non-numeric
      const tableRows = [
        [{ text: 'Etiket' }, { text: 'Değer' }] // Header
      ];
      data.data.forEach(item => {
        tableRows.push([{ text: item.label }, { text: String(item.value) }]);
      });

      dataSlide.addTable(tableRows, {
        x: 0.5, y: 1.5, w: 9,
        colW: [4.5, 4.5],
        border: { type: 'solid', pt: 1, color: 'CCCCCC' },
        fill: { color: 'F7F7F7' },
        fontSize: 12
      });
    }

    // Save the presentation
    await pptx.writeFile({ fileName: outputPath });
  } catch (error) {
    console.error('Error generating PPTX:', error);
    throw error;
  }
}
