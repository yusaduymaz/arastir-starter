import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { SentimentBadge, recommendationColor } from '../shared/SentimentBadge';
import { paragraphs, reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: COLORS.MUTED_BLUE,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY_BLUE,
    padding: 12,
    marginBottom: 16,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  content: { borderLeftWidth: 4, borderLeftColor: COLORS.ACCENT_AMBER, paddingLeft: 14 },
  highlightText: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 10, color: COLORS.PRIMARY_DARK, lineHeight: 1.45 },
});

export function ExecutiveSummaryPage({ data }: { data: ReportData }) {
  const items = paragraphs(data.executiveSummary);
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <View style={styles.topRow}>
        <SectionTitle title="Yönetici Özeti" color={COLORS.ACCENT_AMBER} />
        {data.investmentRecommendation && (
          <SentimentBadge label={data.investmentRecommendation.action} color={recommendationColor(data.investmentRecommendation.action)} />
        )}
      </View>
      <View style={styles.highlight}>
        <Text style={styles.highlightText}>{items[0]}</Text>
      </View>
      <View style={styles.content}>
        {items.map((item, index) => <Text key={index} style={baseStyles.body}>{item}</Text>)}
      </View>
    </PageWrapper>
  );
}

