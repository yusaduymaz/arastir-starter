import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { DataTable } from '../shared/DataTable';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { SentimentBadge, sentimentColor } from '../shared/SentimentBadge';
import { compactText, reportCompany, reportDate, sentimentLabel } from './page-utils';

type NewsArticle = NonNullable<ReportData['newsArticles']>[number];

const styles = StyleSheet.create({
  summary: { fontFamily: PDF_FONT, fontSize: 9, color: COLORS.TEXT_SECONDARY, marginBottom: 14 },
  card: { ...baseStyles.card, marginBottom: 9 },
  meta: { fontFamily: PDF_FONT, fontSize: 8, color: COLORS.TEXT_SECONDARY, marginBottom: 5 },
  title: { fontFamily: PDF_FONT, fontWeight: 'bold', fontSize: 10, marginBottom: 6, color: COLORS.TEXT_PRIMARY },
});

export function NewsAnalysisPage({ data }: { data: ReportData }) {
  const articles = data.newsArticles || [];
  const counts = articles.reduce((acc, item) => {
    acc[sentimentLabel(item.sentiment)] += 1;
    return acc;
  }, { Pozitif: 0, Nötr: 0, Negatif: 0 });

  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Haber Analizi" color={COLORS.ACCENT_AMBER} />
      <Text style={styles.summary}>Toplam {articles.length} haber | Pozitif {counts.Pozitif} | Nötr {counts.Nötr} | Negatif {counts.Negatif}</Text>
      {articles.length >= 8 ? (
        <DataTable
          columns={[
            { label: 'Tarih', width: '18%', value: (row: NewsArticle) => new Date(row.date).toLocaleDateString('tr-TR') },
            { label: 'Kaynak', width: '18%', value: (row: NewsArticle) => row.source },
            { label: 'Başlık', width: '46%', value: (row: NewsArticle) => compactText(row.title, 80) },
            { label: 'Sentiment', width: '18%', value: (row: NewsArticle) => sentimentLabel(row.sentiment) },
          ]}
          rows={articles.slice(0, 10)}
        />
      ) : articles.length === 0 ? (
        <View style={baseStyles.card}><Text style={baseStyles.body}>Analiz döneminde haber bulunamadı.</Text></View>
      ) : articles.map((item, index) => (
        <View key={`${item.title}-${index}`} style={styles.card}>
          <Text style={styles.meta}>{new Date(item.date).toLocaleDateString('tr-TR')} | {item.source}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <SentimentBadge label={sentimentLabel(item.sentiment)} color={sentimentColor(item.sentiment)} />
        </View>
      ))}
    </PageWrapper>
  );
}
