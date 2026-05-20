import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PDF_FONT } from '../../styles/theme';

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bar: {
    width: 4,
    height: 22,
    marginRight: 9,
  },
  title: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.PRIMARY_DARK,
  },
});

export function SectionTitle({ title, color = COLORS.PRIMARY_BLUE }: { title: string; color?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

