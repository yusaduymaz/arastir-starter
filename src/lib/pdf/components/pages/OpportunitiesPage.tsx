import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, baseStyles } from '../../styles/theme';
import { BulletList, toBullets } from '../shared/BulletList';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  content: { borderLeftWidth: 4, borderLeftColor: COLORS.ACCENT_GREEN, paddingLeft: 14 },
  opportunityCard: { ...baseStyles.card, backgroundColor: COLORS.MUTED_GREEN, marginBottom: 8 },
});

const fallbackOpportunities = [
  'Operasyonel verimlilik ve talep koşullarındaki iyileşme marjları destekleyebilir.',
  'Olumlu haber akışı ve kurumsal aksiyonlar yatırımcı ilgisini artırabilir.',
  'Makro göstergelerde dengelenme değerleme çarpanları için destekleyici olabilir.',
];

export function OpportunitiesPage({ data }: { data: ReportData }) {
  const items = toBullets(data.opportunities, fallbackOpportunities);
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Fırsat Alanları" color={COLORS.ACCENT_GREEN} />
      <View style={styles.content}>
        {items.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.opportunityCard}>
            <BulletList items={[item]} color={COLORS.ACCENT_GREEN} />
          </View>
        ))}
      </View>
    </PageWrapper>
  );
}

