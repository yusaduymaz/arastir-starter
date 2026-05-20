import React from 'react';
import { Document } from '@react-pdf/renderer';
import { ReportData } from '../../../types/research';
import { CoverPage } from './pages/CoverPage';
import { DataSummaryPage } from './pages/DataSummaryPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { ExecutiveSummaryPage } from './pages/ExecutiveSummaryPage';
import { InvestmentRecommendationPage } from './pages/InvestmentRecommendationPage';
import { KapDisclosuresPage } from './pages/KapDisclosuresPage';
import { MacroContextPage } from './pages/MacroContextPage';
import { MarketDataPage } from './pages/MarketDataPage';
import { NewsAnalysisPage } from './pages/NewsAnalysisPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { RisksPage } from './pages/RisksPage';
import { TableOfContentsPage } from './pages/TableOfContentsPage';

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document title={data.title} author="Arastir.ai" language="tr">
      <CoverPage data={data} />
      <TableOfContentsPage data={data} />
      <ExecutiveSummaryPage data={data} />
      <InvestmentRecommendationPage data={data} />
      <MarketDataPage data={data} />
      <KapDisclosuresPage data={data} />
      <NewsAnalysisPage data={data} />
      <RisksPage data={data} />
      <OpportunitiesPage data={data} />
      <MacroContextPage data={data} />
      <DataSummaryPage data={data} />
      <DisclaimerPage data={data} />
    </Document>
  );
}

