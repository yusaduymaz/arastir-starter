import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, TOTAL_REPORT_PAGES } from '../../styles/theme';
import { DataCard } from '../shared/DataCard';
import { reportCompany, reportDate, titleWithoutTicker } from './page-utils';

const styles = StyleSheet.create({
  page: { fontFamily: PDF_FONT, backgroundColor: COLORS.BG_LIGHT, padding: 0 },
  top: {
    height: '60%',
    backgroundColor: COLORS.PRIMARY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 72,
  },
  logo: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 14, color: COLORS.PRIMARY_BLUE, marginBottom: 8 },
  ticker: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 36, color: COLORS.BG_CARD, marginBottom: 8 },
  company: { fontFamily: PDF_FONT, fontSize: 18, color: '#94A3B8', marginBottom: 10, textAlign: 'center' },
  type: { fontFamily: PDF_FONT, fontSize: 13, color: '#CBD5E1' },
  bottom: { height: '40%', paddingHorizontal: 52, paddingTop: 28 },
  cards: { flexDirection: 'row', marginBottom: 24 },
  cardSlot: { width: '33.333%', paddingHorizontal: 5 },
  meta: { fontFamily: PDF_FONT, fontSize: 9, color: COLORS.TEXT_SECONDARY, marginBottom: 10, textAlign: 'center' },
  disclaimer: { fontFamily: PDF_FONT, fontSize: 8, color: COLORS.ACCENT_RED, lineHeight: 1.45, textAlign: 'center' },
  footer: {
    position: 'absolute',
    left: 52,
    right: 52,
    bottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontFamily: PDF_FONT, fontSize: 8, color: COLORS.TEXT_SECONDARY, width: '33%' },
  footerCenter: { textAlign: 'center' },
  footerRight: { textAlign: 'right' },
});

export function CoverPage({ data }: { data: ReportData }) {
  const md = data.marketData;
  const changeColor = String(md?.changePercent || '').trim().startsWith('-') ? COLORS.ACCENT_RED : COLORS.ACCENT_GREEN;

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.top}>
        <Text style={styles.logo}>ARAŞTIR.AI</Text>
        <Text style={styles.ticker}>{reportCompany(data)}</Text>
        <Text style={styles.company}>{titleWithoutTicker(data)}</Text>
        <Text style={styles.type}>Sektörel Analiz Raporu</Text>
      </View>
      <View style={styles.bottom}>
        <View style={styles.cards}>
          <View style={styles.cardSlot}><DataCard label="Fiyat" value={md?.price} /></View>
          <View style={styles.cardSlot}><DataCard label="Günlük Değişim" value={md?.changePercent} color={changeColor} /></View>
          <View style={styles.cardSlot}><DataCard label="Piyasa Değeri" value={md?.marketCap} /></View>
        </View>
        <Text style={styles.meta}>{reportDate(data)} | Kaynak: {data.source}</Text>
        <Text style={styles.disclaimer}>Bu rapor yatırım danışmanlığı niteliğinde değildir. Yatırım kararları kişisel risk profili ve profesyonel danışmanlık ile birlikte değerlendirilmelidir.</Text>
      </View>
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Arastir.ai</Text>
        <Text style={[styles.footerText, styles.footerCenter]}>{data.title}</Text>
        <Text style={[styles.footerText, styles.footerRight]}>Sayfa 1/{TOTAL_REPORT_PAGES}</Text>
      </View>
    </Page>
  );
}
