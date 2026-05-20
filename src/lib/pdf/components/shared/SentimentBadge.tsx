import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PDF_FONT } from '../../styles/theme';

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 8,
    color: COLORS.BG_CARD,
  },
});

export function recommendationColor(action?: string) {
  if (action === 'AL') return COLORS.ACCENT_GREEN;
  if (action === 'SAT') return COLORS.ACCENT_RED;
  return COLORS.ACCENT_AMBER;
}

export function sentimentColor(sentiment?: string) {
  const normalized = (sentiment || '').toLowerCase();
  if (normalized.includes('pozitif') || normalized.includes('positive') || normalized.includes('olumlu')) {
    return COLORS.ACCENT_GREEN;
  }
  if (normalized.includes('negatif') || normalized.includes('negative') || normalized.includes('olumsuz')) {
    return COLORS.ACCENT_RED;
  }
  return COLORS.TEXT_SECONDARY;
}

export function SentimentBadge({ label, color }: { label: string; color?: string }) {
  const bg = color || sentimentColor(label);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

