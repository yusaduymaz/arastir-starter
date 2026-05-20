import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PDF_FONT } from '../../styles/theme';
import { parseMarkdownBullets, stripMarkdown } from '../../markdown-utils';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 10,
    marginRight: 8,
    marginTop: 1,
  },
  text: {
    fontFamily: PDF_FONT,
    fontSize: 10,
    lineHeight: 1.45,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
});

export function toBullets(content?: string, fallback: string[] = []) {
  if (!content) return fallback;
  const parsed = parseMarkdownBullets(content);
  if (parsed.length > 0) return parsed;
  return stripMarkdown(content)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function BulletList({
  items,
  color = COLORS.PRIMARY_BLUE,
}: {
  items: string[];
  color?: string;
}) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.row}>
          <Text style={[styles.bullet, { color }]}>▸</Text>
          <Text style={styles.text}>{stripMarkdown(item)}</Text>
        </View>
      ))}
    </View>
  );
}

