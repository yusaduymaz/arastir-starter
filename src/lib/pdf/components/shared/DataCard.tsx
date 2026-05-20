import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PDF_FONT } from '../../styles/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 6,
    padding: 12,
    minHeight: 70,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.PRIMARY_BLUE,
  },
  label: {
    fontFamily: PDF_FONT,
    fontSize: 8,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 7,
  },
  value: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
  },
});

export function DataCard({ label, value, color }: { label: string; value?: string | number; color?: string }) {
  return (
    <View style={[styles.card, color ? { borderBottomColor: color } : {}]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value === undefined || value === null || value === '' ? 'N/A' : String(value)}</Text>
    </View>
  );
}

