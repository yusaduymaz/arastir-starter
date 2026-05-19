/**
 * generator.ts — PDF Report Generator using @react-pdf/renderer
 *
 * Migrated from jsPDF to @react-pdf/renderer for full Turkish character support.
 * Uses NotoSans font (stored in public/fonts/) which has complete Unicode/UTF-8 coverage.
 *
 * IMPORTANT: This file must only run in Node.js runtime (not Edge Runtime).
 * Ensure API routes that invoke this have: export const runtime = 'nodejs'
 */

import React from 'react';
import {
  renderToBuffer,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import * as fs from 'fs';
import * as path from 'path';
import { ReportData } from '../../types/research';
import {
  stripMarkdown,
  parseMarkdownBullets,
  parseMarkdownSections,
} from './markdown-utils';

// ── Font Registration ─────────────────────────────────────────────────────────
// NotoSans covers full Latin Extended + Turkish characters (ş ı ğ ü ö ç İ Ş Ğ)
const fontsDir = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(fontsDir, 'NotoSans-Bold.ttf'), fontWeight: 'bold' },
  ],
});

// Hyphenation callback — disable auto-hyphenation for Turkish words
Font.registerHyphenationCallback((word) => [word]);

// ── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0F172A',       // slate-900 — deep dark
  accent: '#3B82F6',        // blue-500
  success: '#22C55E',       // green-500
  danger: '#EF4444',        // red-500
  warning: '#F59E0B',       // amber-500
  textDark: '#1E293B',      // slate-800
  textMid: '#475569',       // slate-600
  textLight: '#94A3B8',     // slate-400
  bgWhite: '#FFFFFF',
  bgLight: '#F8FAFC',       // slate-50
  bgCard: '#F1F5F9',        // slate-100
  border: '#E2E8F0',        // slate-200
  coverBg: '#0F172A',
  coverAccent: '#1E40AF',   // blue-800
};

const FONT = 'NotoSans';

// ── StyleSheet ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: FONT,
    backgroundColor: COLORS.bgWhite,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 10,
    color: COLORS.textDark,
  },

  // Cover page
  coverPage: {
    fontFamily: FONT,
    backgroundColor: COLORS.coverBg,
    padding: 0,
    fontSize: 10,
    color: COLORS.bgWhite,
  },
  coverContent: {
    flex: 1,
    padding: 50,
    justifyContent: 'space-between',
  },
  coverBadge: {
    backgroundColor: COLORS.coverAccent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  coverBadgeText: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 8,
    color: COLORS.bgWhite,
    letterSpacing: 1.5,
  },
  coverTitle: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 28,
    color: COLORS.bgWhite,
    marginBottom: 8,
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontFamily: FONT,
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 40,
  },
  coverDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 20,
  },
  coverMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  coverMetaItem: {
    marginBottom: 6,
  },
  coverMetaLabel: {
    fontFamily: FONT,
    fontSize: 8,
    color: COLORS.textLight,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  coverMetaValue: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.bgWhite,
  },
  coverDisclaimer: {
    fontFamily: FONT,
    fontSize: 7,
    color: '#475569',
    marginTop: 30,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 16,
  },
  sectionBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 13,
    color: COLORS.textDark,
  },

  // Body text
  bodyText: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.textMid,
    lineHeight: 1.6,
    marginBottom: 6,
  },

  // Bullet item
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletDot: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.accent,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.textMid,
    lineHeight: 1.5,
    flex: 1,
  },

  // Card / box
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Investment recommendation badge
  recBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  recActionBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  recActionText: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.bgWhite,
  },
  recScoreBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  recScoreText: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 12,
    color: COLORS.bgWhite,
  },
  recConfidenceBox: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#334155',
    marginRight: 8,
  },
  recConfidenceText: {
    fontFamily: FONT,
    fontSize: 10,
    color: COLORS.bgWhite,
  },

  // Data table
  table: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
  },
  tableHeadCell: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 9,
    color: '#CBD5E1',
    padding: 8,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgLight,
  },
  tableCell: {
    fontFamily: FONT,
    fontSize: 9,
    color: COLORS.textDark,
    padding: 7,
    flex: 1,
  },

  // News article item
  newsItem: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    paddingLeft: 10,
    marginBottom: 8,
  },
  newsTitle: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 10,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  newsMeta: {
    fontFamily: FONT,
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 3,
  },
  newsSentiment: {
    fontFamily: FONT,
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },

  // KAP disclosure item
  kapItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
    marginBottom: 6,
  },
  kapTitle: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 9,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  kapDate: {
    fontFamily: FONT,
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 3,
  },
  kapSummary: {
    fontFamily: FONT,
    fontSize: 9,
    color: COLORS.textMid,
    lineHeight: 1.4,
  },

  // Market data grid
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  marketCell: {
    width: '25%',
    padding: 8,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  marketCellLabel: {
    fontFamily: FONT,
    fontSize: 7,
    color: COLORS.textLight,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  marketCellValue: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 11,
    color: COLORS.textDark,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  footerText: {
    fontFamily: FONT,
    fontSize: 7,
    color: COLORS.textLight,
  },

  // Label helpers
  labelBold: {
    fontFamily: FONT,
    fontWeight: 'bold',
    fontSize: 10,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  spacer: {
    marginBottom: 12,
  },
});

// ── Helper Components ─────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  color?: string;
}

function SectionHeader({ title, color = COLORS.accent }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionBar, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

interface FooterProps {
  title: string;
}

function Footer({ title }: FooterProps) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Arastir.ai | {title}</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`}
      />
      <Text style={styles.footerText}>Bu rapor yatirim danismanligi niteliginde degildir.</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

// ── Cover Page ────────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: ReportData }) {
  const dateStr = new Date(data.dateGenerated).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(data.dateGenerated).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverContent}>
        {/* Top section */}
        <View>
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>SEKTOREL ANALIZ RAPORU</Text>
          </View>
          <Text style={styles.coverTitle}>{data.title}</Text>
          <Text style={styles.coverSubtitle}>{data.source}</Text>
        </View>

        {/* Bottom section */}
        <View>
          <View style={styles.coverDivider} />
          <View style={styles.coverMeta}>
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>RAPOR TARIHI</Text>
              <Text style={styles.coverMetaValue}>{dateStr}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>SAAT</Text>
              <Text style={styles.coverMetaValue}>{timeStr}</Text>
            </View>
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>PLATFORM</Text>
              <Text style={styles.coverMetaValue}>Arastir.ai</Text>
            </View>
            {data.marketData?.sector && (
              <View style={styles.coverMetaItem}>
                <Text style={styles.coverMetaLabel}>SEKTOR</Text>
                <Text style={styles.coverMetaValue}>{data.marketData.sector}</Text>
              </View>
            )}
          </View>
          <Text style={styles.coverDisclaimer}>
            Bu rapor Arastir.ai yapay zeka platformu tarafindan otomatik olusturulmustur.
            Yatirim danismanligi niteliginde degildir. Yatirim kararlarinizi vermeden once
            lisansli bir finansal danismanla gorusunuz.
          </Text>
        </View>
      </View>
    </Page>
  );
}

// ── Investment Recommendation Page ────────────────────────────────────────────

function InvestmentRecommendationSection({ data }: { data: ReportData }) {
  const rec = data.investmentRecommendation;
  if (!rec) return null;

  const actionColor =
    rec.action === 'AL' ? COLORS.success :
    rec.action === 'SAT' ? COLORS.danger :
    COLORS.warning;

  const bullets = rec.keyFactors ?? [];

  return (
    <View>
      <SectionHeader title="Yatirim Tavsiyesi" color={actionColor} />
      <View style={styles.card}>
        <View style={styles.recBadgeRow}>
          <View style={[styles.recActionBadge, { backgroundColor: actionColor }]}>
            <Text style={styles.recActionText}>{rec.action}</Text>
          </View>
          <View style={styles.recScoreBox}>
            <Text style={styles.recScoreText}>Puan: {rec.score}/10</Text>
          </View>
          <View style={styles.recConfidenceBox}>
            <Text style={styles.recConfidenceText}>Guven: {rec.confidence}</Text>
          </View>
        </View>

        <Text style={styles.labelBold}>Kisa Vade (1-3 ay):</Text>
        <Text style={styles.bodyText}>{rec.shortTermOutlook}</Text>

        <Text style={styles.labelBold}>Uzun Vade (6-12 ay):</Text>
        <Text style={styles.bodyText}>{rec.longTermOutlook}</Text>

        {bullets.length > 0 && (
          <>
            <Text style={styles.labelBold}>Temel Etkenler:</Text>
            <BulletList items={bullets} />
          </>
        )}
      </View>
    </View>
  );
}

// ── Market Data Section ───────────────────────────────────────────────────────

function MarketDataSection({ data }: { data: ReportData }) {
  const md = data.marketData;
  if (!md) return null;

  const cells: Array<{ label: string; value: string | number | undefined }> = [
    { label: 'FIYAT (TL)', value: md.price },
    { label: 'GUNLUK DEGISIM', value: md.changePercent },
    { label: 'HACIM', value: md.volume },
    { label: 'PIYASA DEGERI', value: md.marketCap },
    { label: 'F/K ORANI', value: md.peRatio },
    { label: 'HISSE BASI KAR', value: md.eps },
    { label: '52H YUKSEK', value: md.week52High },
    { label: '52H DUSUK', value: md.week52Low },
  ].filter(c => c.value !== undefined && c.value !== null && c.value !== 'N/A');

  if (cells.length === 0) return null;

  return (
    <View>
      <SectionHeader title="Piyasa Verileri" color={COLORS.accent} />
      <View style={styles.marketGrid}>
        {cells.map((cell, i) => (
          <View key={i} style={styles.marketCell}>
            <Text style={styles.marketCellLabel}>{cell.label}</Text>
            <Text style={styles.marketCellValue}>{String(cell.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Data Summary Table ────────────────────────────────────────────────────────

function DataSummaryTable({ data }: { data: ReportData }) {
  if (!data.data || data.data.length === 0) return null;

  return (
    <View>
      <SectionHeader title="Ozet Veriler" color={COLORS.success} />
      <View style={styles.table}>
        <View style={styles.tableHead}>
          <Text style={styles.tableHeadCell}>Gosterge</Text>
          <Text style={styles.tableHeadCell}>Deger</Text>
        </View>
        {data.data.map((row, i) => (
          <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.tableCell}>{row.label}</Text>
            <Text style={styles.tableCell}>{String(row.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Text Section (handles Markdown → rendered bullets or paragraphs) ──────────

function TextSection({
  title,
  content,
  color = COLORS.accent,
}: {
  title: string;
  content: string;
  color?: string;
}) {
  const bullets = parseMarkdownBullets(content);

  // If bullets found, render as bullet list; otherwise as paragraphs
  if (bullets.length > 0) {
    return (
      <View>
        <SectionHeader title={title} color={color} />
        <BulletList items={bullets} />
        <View style={styles.spacer} />
      </View>
    );
  }

  // Render as sectioned paragraphs
  const sections = parseMarkdownSections(content);
  return (
    <View>
      <SectionHeader title={title} color={color} />
      {sections.map((s, i) => (
        <View key={i}>
          {s.heading && <Text style={styles.labelBold}>{s.heading}</Text>}
          {s.body ? (
            <Text style={styles.bodyText}>{s.body}</Text>
          ) : null}
        </View>
      ))}
      {sections.length === 0 && (
        <Text style={styles.bodyText}>{stripMarkdown(content)}</Text>
      )}
      <View style={styles.spacer} />
    </View>
  );
}

// ── News Articles Section ─────────────────────────────────────────────────────

function NewsArticlesSection({ data }: { data: ReportData }) {
  const articles = data.newsArticles;
  if (!articles || articles.length === 0) return null;

  const sentimentColor = (s?: string) => {
    if (!s) return '#64748B';
    const sl = s.toLowerCase();
    if (sl.includes('pozitif') || sl.includes('positive')) return COLORS.success;
    if (sl.includes('negatif') || sl.includes('negative')) return COLORS.danger;
    return '#64748B';
  };

  return (
    <View>
      <SectionHeader title="Son Haberler" color={COLORS.warning} />
      {articles.slice(0, 8).map((article, i) => (
        <View key={i} style={styles.newsItem}>
          <Text style={styles.newsTitle}>{article.title}</Text>
          <Text style={styles.newsMeta}>
            {article.source} — {new Date(article.date).toLocaleDateString('tr-TR')}
          </Text>
          {article.sentiment && (
            <View style={[styles.newsSentiment, { backgroundColor: sentimentColor(article.sentiment) + '22', borderWidth: 1, borderColor: sentimentColor(article.sentiment) }]}>
              <Text style={{ fontFamily: FONT, fontSize: 7, color: sentimentColor(article.sentiment) }}>
                {article.sentiment}
              </Text>
            </View>
          )}
          {article.content && (
            <Text style={[styles.bodyText, { fontSize: 9, marginTop: 3 }]}>
              {stripMarkdown(article.content).slice(0, 200)}
              {article.content.length > 200 ? '...' : ''}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ── KAP Disclosures Section ───────────────────────────────────────────────────

function KapDisclosuresSection({ data }: { data: ReportData }) {
  const disclosures = data.kapDisclosures;
  if (!disclosures || disclosures.length === 0) return null;

  return (
    <View>
      <SectionHeader title="KAP Bildirimleri" color={COLORS.primary} />
      {disclosures.slice(0, 10).map((d, i) => (
        <View key={i} style={styles.kapItem}>
          <Text style={styles.kapTitle}>{d.title}</Text>
          <Text style={styles.kapDate}>{new Date(d.date).toLocaleDateString('tr-TR')}</Text>
          {d.summary && (
            <Text style={styles.kapSummary}>{stripMarkdown(d.summary)}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Full Report Document ──────────────────────────────────────────────────────

function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document
      title={data.title}
      author="Arastir.ai"
      subject="Sektorel Analiz Raporu"
      creator="Arastir.ai PDF Generator"
    >
      {/* 1. Cover Page */}
      <CoverPage data={data} />

      {/* 2. Main Content Page */}
      <Page size="A4" style={styles.page}>
        <Footer title={data.title} />

        {/* Data summary table */}
        <DataSummaryTable data={data} />

        {/* Investment Recommendation */}
        <InvestmentRecommendationSection data={data} />

        {/* Market Data */}
        <MarketDataSection data={data} />

        {/* Executive Summary */}
        {data.executiveSummary && (
          <TextSection
            title="Yonetici Ozeti"
            content={data.executiveSummary}
            color={COLORS.warning}
          />
        )}
      </Page>

      {/* 3. Analysis Page */}
      <Page size="A4" style={styles.page}>
        <Footer title={data.title} />

        {/* Risks */}
        {data.risks && (
          <TextSection
            title="Risk Faktörleri"
            content={data.risks}
            color={COLORS.danger}
          />
        )}

        {/* Opportunities */}
        {data.opportunities && (
          <TextSection
            title="Firsatlar"
            content={data.opportunities}
            color={COLORS.success}
          />
        )}

        {/* Macro Context */}
        {data.macroContext && (
          <TextSection
            title="Makroekonomik Baglam"
            content={data.macroContext}
            color={COLORS.accent}
          />
        )}
      </Page>

      {/* 4. News & KAP Page */}
      <Page size="A4" style={styles.page}>
        <Footer title={data.title} />

        <NewsArticlesSection data={data} />
        <KapDisclosuresSection data={data} />
      </Page>
    </Document>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generates a PDF report and writes it to the specified output path.
 * @param data - ReportData object containing all report content
 * @param outputPath - Absolute path where the PDF file should be written
 */
export async function generatePdfReport(data: ReportData, outputPath: string): Promise<void> {
  try {
    console.log(`[PDF Generator] Starting PDF generation for: ${data.title}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(ReportDocument, { data }) as any);

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`[PDF Generator] PDF created at ${outputPath} (${buffer.length} bytes)`);
  } catch (error) {
    console.error('[PDF Generator] Error generating PDF:', error);
    throw error;
  }
}
