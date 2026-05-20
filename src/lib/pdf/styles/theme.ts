import { Font, StyleSheet } from '@react-pdf/renderer';
import * as path from 'path';

export const PDF_FONT = 'NotoSans';
export const TOTAL_REPORT_PAGES = 12;

export const COLORS = {
  PRIMARY_DARK: '#0F172A',
  PRIMARY_BLUE: '#1D4ED8',
  ACCENT_GREEN: '#16A34A',
  ACCENT_RED: '#DC2626',
  ACCENT_AMBER: '#D97706',
  TEXT_PRIMARY: '#1E293B',
  TEXT_SECONDARY: '#64748B',
  BG_LIGHT: '#F8FAFC',
  BG_CARD: '#FFFFFF',
  BORDER: '#E2E8F0',
  MUTED_BLUE: '#EFF6FF',
  MUTED_GREEN: '#F0FDF4',
  MUTED_RED: '#FEF2F2',
  MUTED_AMBER: '#FFFBEB',
};

let fontsRegistered = false;

export function registerPdfFonts() {
  if (fontsRegistered) return;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  Font.register({
    family: PDF_FONT,
    fonts: [
      { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(fontsDir, 'NotoSans-Bold.ttf'), fontWeight: 'bold' },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT,
    backgroundColor: COLORS.BG_LIGHT,
    color: COLORS.TEXT_PRIMARY,
    paddingTop: 56,
    paddingBottom: 58,
    paddingHorizontal: 71,
    fontSize: 10,
  },
  h2: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.PRIMARY_DARK,
    marginBottom: 14,
  },
  h3: {
    fontFamily: PDF_FONT,
    fontWeight: 'bold',
    fontSize: 12,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 7,
  },
  body: {
    fontFamily: PDF_FONT,
    fontSize: 10,
    color: COLORS.TEXT_PRIMARY,
    lineHeight: 1.55,
    marginBottom: 8,
  },
  caption: {
    fontFamily: PDF_FONT,
    fontSize: 8,
    color: COLORS.TEXT_SECONDARY,
  },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 6,
    padding: 12,
  },
});

