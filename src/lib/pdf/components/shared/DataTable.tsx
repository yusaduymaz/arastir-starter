import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { COLORS, PDF_FONT } from '../../styles/theme';

export interface DataTableColumn<T> {
  label: string;
  width?: string;
  value: (row: T) => string | number | undefined;
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 5,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  headCell: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 8,
    color: '#CBD5E1',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  cell: {
    fontFamily: PDF_FONT,
    fontSize: 8,
    color: COLORS.TEXT_PRIMARY,
    padding: 8,
  },
});

export function DataTable<T>({
  columns,
  rows,
}: {
  columns: Array<DataTableColumn<T>>;
  rows: T[];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.head}>
        {columns.map((column) => (
          <Text key={column.label} style={[styles.headCell, { width: column.width || `${100 / columns.length}%` }]}>
            {column.label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, { backgroundColor: rowIndex % 2 === 0 ? COLORS.BG_CARD : COLORS.BG_LIGHT }]}
        >
          {columns.map((column) => (
            <Text key={column.label} style={[styles.cell, { width: column.width || `${100 / columns.length}%` }]}>
              {column.value(row) ?? 'N/A'}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

