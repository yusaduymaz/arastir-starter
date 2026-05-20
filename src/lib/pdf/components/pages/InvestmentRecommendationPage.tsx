import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { BulletList } from '../shared/BulletList';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { recommendationColor } from '../shared/SentimentBadge';
import { reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  mainCard: { ...baseStyles.card, alignItems: 'center', marginBottom: 18, padding: 22 },
  badge: { borderRadius: 6, paddingHorizontal: 24, paddingVertical: 10, marginBottom: 12 },
  badgeText: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 28, color: COLORS.BG_CARD },
  score: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 18, color: COLORS.PRIMARY_DARK, marginBottom: 5 },
  confidence: { fontFamily: PDF_FONT, fontSize: 10, color: COLORS.TEXT_SECONDARY },
  columns: { flexDirection: 'row', marginBottom: 18 },
  col: { ...baseStyles.card, width: '50%', marginRight: 8 },
  colRight: { marginRight: 0, marginLeft: 8 },
});

export function InvestmentRecommendationPage({ data }: { data: ReportData }) {
  const rec = data.investmentRecommendation;
  const color = recommendationColor(rec?.action);

  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Yatırım Tavsiyesi" color={color} />
      {!rec ? (
        <Text style={baseStyles.body}>Yatırım tavsiyesi üretilmedi.</Text>
      ) : (
        <>
          <View style={styles.mainCard}>
            <View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{rec.action}</Text></View>
            <Text style={styles.score}>Puan: {rec.score}/10</Text>
            <Text style={styles.confidence}>Güven seviyesi: {rec.confidence}</Text>
          </View>
          <View style={styles.columns}>
            <View style={styles.col}>
              <Text style={baseStyles.h3}>Kısa Vadeli Görünüm</Text>
              <Text style={baseStyles.body}>{rec.shortTermOutlook}</Text>
            </View>
            <View style={[styles.col, styles.colRight]}>
              <Text style={baseStyles.h3}>Uzun Vadeli Görünüm</Text>
              <Text style={baseStyles.body}>{rec.longTermOutlook}</Text>
            </View>
          </View>
          <Text style={baseStyles.h3}>Önemli Faktörler</Text>
          <BulletList items={rec.keyFactors || []} color={color} />
        </>
      )}
    </PageWrapper>
  );
}

