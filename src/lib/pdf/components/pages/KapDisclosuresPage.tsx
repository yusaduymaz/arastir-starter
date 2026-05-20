import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { compactText, reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  heading: { fontFamily: PDF_FONT, fontSize: 9, color: COLORS.TEXT_SECONDARY, marginBottom: 14 },
  card: { ...baseStyles.card, marginBottom: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  title: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 10, color: COLORS.TEXT_PRIMARY, width: '72%' },
  date: { fontFamily: PDF_FONT, fontSize: 8, color: COLORS.TEXT_SECONDARY, textAlign: 'right' },
});

export function KapDisclosuresPage({ data }: { data: ReportData }) {
  const disclosures = data.kapDisclosures || [];
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="KAP Bildirimleri" color={COLORS.PRIMARY_DARK} />
      <Text style={styles.heading}>Son {disclosures.length} Bildirim</Text>
      {disclosures.length === 0 ? (
        <View style={baseStyles.card}><Text style={baseStyles.body}>Analiz döneminde KAP bildirimi bulunamadı.</Text></View>
      ) : disclosures.slice(0, 5).map((item, index) => (
        <View key={`${item.title}-${index}`} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString('tr-TR')}</Text>
          </View>
          <Text style={baseStyles.body}>{compactText(item.summary, 260)}</Text>
        </View>
      ))}
    </PageWrapper>
  );
}

