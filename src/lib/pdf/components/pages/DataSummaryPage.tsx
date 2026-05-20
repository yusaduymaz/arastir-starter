import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { DataTable } from '../shared/DataTable';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  tableWrap: { marginBottom: 18 },
  sources: { ...baseStyles.card },
  sourceItem: { fontFamily: PDF_FONT, fontSize: 9, color: COLORS.TEXT_PRIMARY, marginBottom: 6 },
});

export function DataSummaryPage({ data }: { data: ReportData }) {
  const rows = data.data && data.data.length > 0 ? data.data : [
    { label: 'Son KAP Bildirimleri', value: data.kapDisclosures?.length ?? 0 },
    { label: 'İncelenen Haber Sayısı', value: data.newsArticles?.length ?? 0 },
    { label: 'Güncel Fiyat', value: data.marketData?.price ?? 'N/A' },
    { label: 'Günlük Değişim', value: data.marketData?.changePercent ?? 'N/A' },
  ];
  const sources = ['KAP', 'Yahoo Finance', 'TCMB EVDS', 'Currents API'];

  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Araştırma Özeti" color={COLORS.ACCENT_GREEN} />
      <View style={styles.tableWrap}>
        <DataTable
          columns={[
            { label: 'Gösterge', value: (row: typeof rows[number]) => row.label },
            { label: 'Değer', value: (row: typeof rows[number]) => row.value },
          ]}
          rows={rows}
        />
      </View>
      <View style={styles.sources}>
        <Text style={baseStyles.h3}>Kullanılan Kaynaklar</Text>
        {sources.map((source) => <Text key={source} style={styles.sourceItem}>• {source}</Text>)}
      </View>
    </PageWrapper>
  );
}

