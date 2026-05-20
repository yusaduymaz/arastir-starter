import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ReactNode } from 'react';
import { baseStyles, COLORS, PDF_FONT, TOTAL_REPORT_PAGES } from '../../styles/theme';

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 22,
    left: 71,
    right: 71,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: PDF_FONT,
    fontSize: 8,
    color: COLORS.TEXT_SECONDARY,
  },
  footer: {
    position: 'absolute',
    left: 71,
    right: 71,
    bottom: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    fontFamily: PDF_FONT,
    fontSize: 8,
    color: COLORS.TEXT_SECONDARY,
    width: '33%',
  },
  footerCenter: {
    textAlign: 'center',
  },
  footerRight: {
    textAlign: 'right',
  },
});

export function PageWrapper({
  title,
  company,
  date,
  children,
}: {
  title: string;
  company: string;
  date: string;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <View style={styles.header} fixed>
        <Text style={styles.headerText}>{company}</Text>
        <Text style={styles.headerText}>{date}</Text>
      </View>
      {children}
      <View style={styles.footer} fixed>
        <Text style={styles.footerItem}>Arastir.ai</Text>
        <Text style={[styles.footerItem, styles.footerCenter]}>{title}</Text>
        <Text
          style={[styles.footerItem, styles.footerRight]}
          render={({ pageNumber }) => `Sayfa ${pageNumber}/${TOTAL_REPORT_PAGES}`}
        />
      </View>
    </Page>
  );
}

