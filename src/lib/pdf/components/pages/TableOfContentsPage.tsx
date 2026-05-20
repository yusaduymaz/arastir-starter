import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { PageWrapper } from '../shared/PageWrapper';
import { reportCompany, reportDate } from './page-utils';

const rows = [
  ['1. Yönetici Özeti', '3'],
  ['2. Yatırım Tavsiyesi', '4'],
  ['3. Piyasa Verileri', '5'],
  ['4. KAP Bildirimleri', '6'],
  ['5. Haber Analizi', '7'],
  ['6. Risk Faktörleri', '8'],
  ['7. Fırsat Alanları', '9'],
  ['8. Makroekonomik Bağlam', '10'],
  ['9. Veri Özeti', '11'],
  ['10. Yasal Uyarı & Kaynaklar', '12'],
];

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingVertical: 11,
  },
  text: { fontFamily: PDF_FONT, fontSize: 11, color: COLORS.TEXT_PRIMARY },
  page: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 11, color: COLORS.PRIMARY_BLUE },
});

export function TableOfContentsPage({ data }: { data: ReportData }) {
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <Text style={baseStyles.h2}>İçindekiler</Text>
      {rows.map(([label, page]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.text}>{label}</Text>
          <Text style={styles.page}>{page}</Text>
        </View>
      ))}
    </PageWrapper>
  );
}

