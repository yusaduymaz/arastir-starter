import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, baseStyles } from '../../styles/theme';
import { DataCard } from '../shared/DataCard';
import { DataTable } from '../shared/DataTable';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 16 },
  slot: { width: '33.333%', padding: 5 },
  sector: { ...baseStyles.card, marginBottom: 16 },
});

export function MarketDataPage({ data }: { data: ReportData }) {
  const md = data.marketData;
  const rows = [
    { label: 'Güncel Fiyat', value: md?.price },
    { label: 'Günlük Değişim', value: md?.changePercent },
    { label: 'Hacim', value: md?.volume },
    { label: '52H Yüksek', value: md?.week52High },
    { label: '52H Düşük', value: md?.week52Low },
    { label: 'F/K Oranı', value: md?.peRatio },
  ];

  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Piyasa Verileri" />
      <View style={styles.grid}>
        {rows.map((row) => <View key={row.label} style={styles.slot}><DataCard label={row.label} value={row.value} /></View>)}
      </View>
      <View style={styles.sector}>
        <Text style={baseStyles.h3}>Sektör / Endüstri</Text>
        <Text style={baseStyles.body}>{md?.sector || 'Sektör bilgisi bulunamadı.'}</Text>
      </View>
      <DataTable
        columns={[
          { label: 'Gösterge', value: (row: { label: string; value?: string | number }) => row.label },
          { label: 'Değer', value: (row: { label: string; value?: string | number }) => row.value },
        ]}
        rows={rows}
      />
    </PageWrapper>
  );
}

