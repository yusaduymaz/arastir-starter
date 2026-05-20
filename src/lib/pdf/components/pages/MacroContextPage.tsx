import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { DataTable } from '../shared/DataTable';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { paragraphs, reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  source: { fontFamily: PDF_FONT, fontSize: 9, color: COLORS.TEXT_SECONDARY, marginBottom: 14 },
  tableWrap: { marginBottom: 16 },
});

const macroRows = [
  { period: 'Son Veri', usdTry: 'Veri setinde', inflation: 'Veri setinde', rate: 'Varsa' },
  { period: 'Önceki Dönem', usdTry: 'Karşılaştırmalı', inflation: 'Karşılaştırmalı', rate: 'Varsa' },
  { period: 'Eğilim', usdTry: 'Kur görünümü', inflation: 'TÜFE eğilimi', rate: 'Politika faizi' },
];

export function MacroContextPage({ data }: { data: ReportData }) {
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Makroekonomik Bağlam" />
      <Text style={styles.source}>Kaynak: TCMB EVDS</Text>
      <View style={styles.tableWrap}>
        <DataTable
          columns={[
            { label: 'Dönem', value: (row: typeof macroRows[number]) => row.period },
            { label: 'USD/TRY', value: (row: typeof macroRows[number]) => row.usdTry },
            { label: 'TÜFE', value: (row: typeof macroRows[number]) => row.inflation },
            { label: 'Faiz', value: (row: typeof macroRows[number]) => row.rate },
          ]}
          rows={macroRows}
        />
      </View>
      {paragraphs(data.macroContext, 'Makroekonomik açıklama bulunamadı.').map((item, index) => (
        <Text key={index} style={baseStyles.body}>{item}</Text>
      ))}
    </PageWrapper>
  );
}

