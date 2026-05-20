import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReportData } from '../../../../types/research';
import { COLORS, PDF_FONT, baseStyles } from '../../styles/theme';
import { PageWrapper } from '../shared/PageWrapper';
import { SectionTitle } from '../shared/SectionTitle';
import { reportCompany, reportDate } from './page-utils';

const styles = StyleSheet.create({
  paragraph: { ...baseStyles.body, marginBottom: 10 },
  sources: { ...baseStyles.card, marginTop: 10 },
  bottomBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 12,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  contact: { fontFamily: PDF_FONT, fontSize: 9, color: COLORS.TEXT_SECONDARY, marginTop: 14 },
});

const disclaimer = [
  'Bu raporda yer alan bilgi, yorum ve tavsiyeler yatırım danışmanlığı kapsamında değildir. Yatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulur.',
  'Burada yer alan değerlendirmeler genel niteliktedir ve kişisel mali durumunuz ile risk-getiri tercihlerinize uygun olmayabilir. Bu nedenle yalnızca bu raporda yer alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar doğurmayabilir.',
  'Rapor, üretildiği tarihte erişilebilen veri kaynakları ve yapay zeka destekli analiz süreçleriyle hazırlanmıştır. Veri sağlayıcılarındaki gecikme, eksiklik veya metodoloji farkları sonuçları etkileyebilir.',
  'Arastir.ai ve raporun üretiminde kullanılan sistemler, bu rapora dayanılarak alınan kararlardan doğabilecek doğrudan veya dolaylı zararlardan sorumlu tutulamaz.',
];

export function DisclaimerPage({ data }: { data: ReportData }) {
  return (
    <PageWrapper title={data.title} company={reportCompany(data)} date={reportDate(data)}>
      <SectionTitle title="Yasal Uyarı & Kaynaklar" color={COLORS.ACCENT_RED} />
      {disclaimer.map((item, index) => <Text key={index} style={styles.paragraph}>{item}</Text>)}
      <View style={styles.sources}>
        <Text style={baseStyles.h3}>Kaynaklar</Text>
        <Text style={baseStyles.body}>{data.source}</Text>
        <Text style={baseStyles.body}>KAP, Yahoo Finance, TCMB EVDS, Currents API ve Arastir.ai analiz çıktıları.</Text>
      </View>
      <Text style={styles.contact}>Arastir.ai | Kurumsal araştırma ve raporlama platformu</Text>
      <View style={styles.bottomBand} fixed />
    </PageWrapper>
  );
}

