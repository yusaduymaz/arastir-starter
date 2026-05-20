import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, baseStyles } from '../../styles/theme';
import { BulletList, toBullets } from '../shared/BulletList';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  content: { borderLeftWidth: 4, borderLeftColor: COLORS.ACCENT_RED, paddingLeft: 14 },
  riskCard: { ...baseStyles.card, backgroundColor: COLORS.MUTED_RED, marginBottom: 8 },
});

const fallbackRisks = [
  'Makroekonomik oynaklık ve faiz görünümü şirket değerlemesi üzerinde baskı oluşturabilir.',
  'Haber akışındaki belirsizlik kısa vadeli fiyat dalgalanmasını artırabilir.',
  'Likidite ve piyasa çarpanlarındaki bozulma yatırım iştahını sınırlayabilir.',
];

export function RisksPage({ data }: { data: ReportData }) {
  const items = toBullets(data.risks, fallbackRisks);
  const risks = items.length >= 3 ? items : [...items, ...fallbackRisks].slice(0, 3);
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Risk Faktörleri" color={COLORS.ACCENT_RED} />
      <View style={styles.content}>
        {risks.map((risk, index) => (
          <View key={`${risk}-${index}`} style={styles.riskCard}>
            <BulletList items={[risk]} color={COLORS.ACCENT_RED} />
          </View>
        ))}
      </View>
    </PageWrapper>
  );
}

