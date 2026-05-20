import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, FileText, Presentation, ExternalLink, Calendar, Building, TrendingUp, TrendingDown, BarChart3, Globe, Shield, Lightbulb, Activity } from 'lucide-react';
import { notFound } from 'next/navigation';
import { PriceChart } from '@/components/dashboard/report/PriceChart';
import { SentimentChart } from '@/components/dashboard/report/SentimentChart';
import { MacroChart } from '@/components/dashboard/report/MacroChart';
import { InvestmentCard } from '@/components/dashboard/report/InvestmentCard';
import { RsiChart } from '@/components/dashboard/report/RsiChart';
import { RelativePerformance } from '@/components/dashboard/report/RelativePerformance';

export const dynamic = 'force-dynamic';

function formatMarketCap(val: string | undefined): string {
  if (!val) return 'N/A';
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T TL`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B TL`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M TL`;
  return `${n.toLocaleString('tr-TR')} TL`;
}

function timeAgo(fetchedAt: number | string): string {
  const ts = typeof fetchedAt === 'string' ? new Date(fetchedAt).getTime() : fetchedAt;
  const diffMs = Date.now() - ts;
  if (diffMs < 60_000) return 'Az önce güncellendi';
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} dakika önce güncellendi`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr} saat önce güncellendi`;
}

function getLatestNonNull(data: Record<string, unknown>[], field: string): string | null {
  if (!data || data.length === 0) return null;
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][field];
    if (val != null && val !== '' && val !== 'ND') return String(val);
  }
  return null;
}

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const { userId } = auth();

  if (!userId) {
    return <div>Yetkisiz erisim. Lutfen giris yapin.</div>;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: report, error } = await supabase
    .from('research_sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (error || !report) {
    return notFound();
  }

  const { data: agentTimestamps } = await supabase
    .from('agent_runs')
    .select('agent_name, completed_at')
    .eq('session_id', params.id)
    .in('agent_name', ['macro', 'news'])
    .not('completed_at', 'is', null);

  const macroCompletedAt = agentTimestamps?.find((r: any) => r.agent_name === 'macro')?.completed_at ?? null;
  const newsCompletedAt = agentTimestamps?.find((r: any) => r.agent_name === 'news')?.completed_at ?? null;

  const { kap_data, news_data, market_data, macro_data, synthesis_data } = report;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const ticker = report.extracted_ticker || report.query;
  const quote = market_data?.quote;
  const overview = market_data?.overview;
  const timeSeries = market_data?.timeSeries;
  const benchmarkSeries = market_data?.benchmarkSeries;
  const changePercent = parseFloat(quote?.changePercent || '0');
  const isUp = changePercent >= 0;
  const investmentRec = synthesis_data?.investmentRecommendation;

  return (
    <main className="flex-1 overflow-y-auto p-6 z-10 bg-background text-on-surface">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/history" className="p-2 bg-[#080808] rounded-full border border-[#22c55e]/20 hover:border-[#22c55e]/50 hover:text-[#22c55e] transition-colors text-[#64748b]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="font-['Montserrat'] text-2xl font-bold tracking-tight text-white">{report.query}</h2>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#64748b] mt-1">
                {formatDate(report.created_at)} | Kaynak: KAP, Haberler, Piyasa, Makro
              </p>
            </div>
          </div>

          {report.status === 'completed' && report.result_url && (
            <div className="flex gap-3">
              <a href={`${report.result_url}/report.pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-[#080808] hover:bg-[#111] border border-[#1a1a1a] hover:border-blue-500/30 rounded-lg font-['JetBrains_Mono'] text-[11px] transition-colors">
                <FileText size={14} className="text-blue-400" /> PDF Indir
              </a>
              <a href={`${report.result_url}/presentation.pptx`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-[#080808] hover:bg-[#111] border border-[#1a1a1a] hover:border-orange-500/30 rounded-lg font-['JetBrains_Mono'] text-[11px] transition-colors">
                <Presentation size={14} className="text-orange-400" /> Sunum Indir
              </a>
            </div>
          )}
        </div>

        {report.status !== 'completed' ? (
          <div className="p-12 text-center bg-[#080808] border border-[#1a1a1a] rounded-xl">
            <p className="text-lg text-[#64748b]">Bu rapor su an &apos;{report.status}&apos; durumunda.</p>
            {report.error_message && <p className="text-red-400 mt-4 border border-red-900/50 bg-red-900/10 p-4 rounded">{report.error_message}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* ── Row 1: Company Profile + Price Overview ── */}
            {quote && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Current Price Card */}
                <div className="bg-[#080808] border border-[#22c55e]/12 rounded-xl p-5 flex flex-col justify-between">
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">Guncel Fiyat</span>
                  <div className="mt-2">
                    <span className="font-['Montserrat'] text-3xl font-black text-white">{quote.price || 'N/A'}</span>
                    <span className="font-['JetBrains_Mono'] text-sm text-[#64748b] ml-1">TL</span>
                  </div>
                  <div className={`mt-2 flex items-center gap-1 font-['JetBrains_Mono'] text-sm font-bold ${isUp ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {isUp ? '+' : ''}{quote.changePercent}%
                    <span className="text-[#45474c] text-[10px] font-normal ml-1">({quote.change})</span>
                  </div>
                </div>

                {/* Volume */}
                <div className="bg-[#080808] border border-[#facc15]/12 rounded-xl p-5 flex flex-col justify-between">
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">Hacim</span>
                  <span className="font-['Montserrat'] text-2xl font-bold text-[#facc15] mt-2">
                    {quote.volume ? parseInt(quote.volume).toLocaleString('tr-TR') : 'N/A'}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] mt-1">islem adedi</span>
                </div>

                {/* P/E Ratio */}
                <div className="bg-[#080808] border border-[#c084fc]/12 rounded-xl p-5 flex flex-col justify-between">
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">F/K Orani</span>
                  <span className="font-['Montserrat'] text-2xl font-bold text-[#c084fc] mt-2">
                    {overview?.PERatio || 'N/A'}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] mt-1">
                    EPS: {overview?.EPS || 'N/A'}
                  </span>
                </div>

                {/* Market Cap */}
                <div className="bg-[#080808] border border-[#14b8a6]/12 rounded-xl p-5 flex flex-col justify-between">
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">Piyasa Degeri</span>
                  <span className="font-['Montserrat'] text-2xl font-bold text-[#14b8a6] mt-2">
                    {formatMarketCap(overview?.MarketCapitalization)}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] mt-1">
                    52H: {overview?.['52WeekLow'] || '?'} - {overview?.['52WeekHigh'] || '?'}
                  </span>
                </div>
              </div>
            )}

            {/* ── Row 1.5: Company Info Banner ── */}
            {overview && (overview.Sector || overview.Industry || overview.Name) && (
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-[#64748b]" />
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8]">
                    {overview.Name || ticker}
                  </span>
                </div>
                {overview.Sector && (
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-[#64748b]" />
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8]">
                      {overview.Sector} / {overview.Industry || ''}
                    </span>
                  </div>
                )}
                {overview.DividendYield && overview.DividendYield !== '0' && overview.DividendYield !== 'None' && (
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-[#64748b]" />
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8]">
                      Temettu Verimi: %{(parseFloat(overview.DividendYield) * 100).toFixed(2)}
                    </span>
                  </div>
                )}
                {overview.Exchange && (
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] px-2 py-1 border border-[#1a1a1a] rounded">
                    {overview.Exchange} | {overview.Currency || 'TRY'}
                  </span>
                )}
              </div>
            )}

            {/* ── Relative Performance Analysis ── */}
            {timeSeries && Object.keys(timeSeries).length > 0 && (
              <RelativePerformance 
                ticker={ticker} 
                timeSeries={timeSeries} 
                benchmarkSeries={benchmarkSeries} 
              />
            )}

            {/* ── Row 2: Price Chart + Investment Card ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price & Technical Indicators Chart */}
              {timeSeries && Object.keys(timeSeries).length > 0 && (
                <div className="bg-[#080808] border border-[#22c55e]/12 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/50 tracking-widest uppercase">
                      // Fiyat Grafiği & Teknik Göstergeler
                    </span>
                    <Activity size={14} className="text-[#22c55e]/30" />
                  </div>
                  <PriceChart timeSeries={timeSeries} />
                  <RsiChart timeSeries={timeSeries} />
                </div>
              )}

              {/* Investment Recommendation */}
              <InvestmentCard recommendation={investmentRec ?? null} ticker={ticker} />

              {/* If no chart but has recommendation, full width */}
              {!timeSeries && !investmentRec && null}
            </div>

            {/* ── Row 3: AI Synthesis ── */}
            {synthesis_data && (synthesis_data.executiveSummary || synthesis_data.risks || synthesis_data.opportunities) && (
              <div className="bg-[#080808] border border-[#f472b6]/12 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-[#1a1a1a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f472b6] text-[18px]">psychology</span>
                  <h3 className="font-['Montserrat'] text-base font-bold text-white">Yapay Zeka Analizi</h3>
                </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {synthesis_data.executiveSummary && (
                    <div className="lg:col-span-2">
                      <h4 className="font-['JetBrains_Mono'] text-[9px] text-[#facc15]/60 tracking-widest uppercase mb-2">Yonetici Ozeti</h4>
                      <p className="font-['JetBrains_Mono'] text-[12px] text-[#c8cdd3] leading-relaxed whitespace-pre-wrap">{synthesis_data.executiveSummary}</p>
                    </div>
                  )}
                  {synthesis_data.risks && (
                    <div className="bg-[#0d0d0d] border border-[#ef4444]/10 rounded-lg p-4">
                      <h4 className="font-['JetBrains_Mono'] text-[9px] text-[#ef4444]/80 tracking-widest uppercase mb-2 flex items-center gap-1.5">
                        <Shield size={12} /> Riskler
                      </h4>
                      <p className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8] leading-relaxed whitespace-pre-wrap">{synthesis_data.risks}</p>
                    </div>
                  )}
                  {synthesis_data.opportunities && (
                    <div className="bg-[#0d0d0d] border border-[#22c55e]/10 rounded-lg p-4">
                      <h4 className="font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/80 tracking-widest uppercase mb-2 flex items-center gap-1.5">
                        <Lightbulb size={12} /> Firsatlar
                      </h4>
                      <p className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8] leading-relaxed whitespace-pre-wrap">{synthesis_data.opportunities}</p>
                    </div>
                  )}
                  {synthesis_data.macroContext && (
                    <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#60a5fa]/10 rounded-lg p-4">
                      <h4 className="font-['JetBrains_Mono'] text-[9px] text-[#60a5fa]/80 tracking-widest uppercase mb-2">Makroekonomik Baglam</h4>
                      <p className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8] leading-relaxed whitespace-pre-wrap">{synthesis_data.macroContext}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Row 4: Macro Chart + Sentiment + Stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Macro Chart */}
              {macro_data && macro_data.length > 0 && (
                <div className="lg:col-span-2 bg-[#080808] border border-[#14b8a6]/12 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-['JetBrains_Mono'] text-[9px] text-[#14b8a6]/50 tracking-widest uppercase">
                      // Makro Gostergeler (TCMB EVDS)
                    </span>
                    {macroCompletedAt && (
                      <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">
                        {timeAgo(macroCompletedAt)}
                      </span>
                    )}
                  </div>
                  <MacroChart macroData={macro_data} />
                  {/* Macro data table */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {(() => {
                      if (!macro_data || macro_data.length === 0) return null;
                      const usd = getLatestNonNull(macro_data, 'TP_DK_USD_A') ?? getLatestNonNull(macro_data, 'TP_DK_USD_A_YTL');
                      const tufe = getLatestNonNull(macro_data, 'TP_FG_J0');
                      const faiz = getLatestNonNull(macro_data, 'TP_MK_B_A2');
                      return (
                        <>
                          <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
                            <p className="font-['JetBrains_Mono'] text-[8px] text-[#45474c] uppercase">USD/TRY</p>
                            <p className="font-['Montserrat'] text-lg font-bold text-[#facc15]">{usd ? parseFloat(usd).toFixed(2) : 'N/A'}</p>
                          </div>
                          <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
                            <p className="font-['JetBrains_Mono'] text-[8px] text-[#45474c] uppercase">TUFE</p>
                            <p className="font-['Montserrat'] text-lg font-bold text-[#60a5fa]">{tufe ? parseFloat(tufe).toFixed(2) : 'Veri henüz yayınlanmadı'}</p>
                          </div>
                          <div className="bg-[#0d0d0d] rounded-lg p-3 text-center">
                            <p className="font-['JetBrains_Mono'] text-[8px] text-[#45474c] uppercase">Politika Faizi</p>
                            <p className="font-['Montserrat'] text-lg font-bold text-[#ef4444]">{faiz ? `%${parseFloat(faiz).toFixed(2)}` : 'Veri henüz yayınlanmadı'}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Sentiment Analysis + Report Stats */}
              <div className="flex flex-col gap-4">
                {/* Sentiment */}
                {news_data && news_data.length > 0 && (
                  <div className="bg-[#080808] border border-[#60a5fa]/12 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-['JetBrains_Mono'] text-[9px] text-[#60a5fa]/50 tracking-widest uppercase">
                        // Haber Duygu Analizi
                      </span>
                      {newsCompletedAt && (
                        <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">
                          {timeAgo(newsCompletedAt)}
                        </span>
                      )}
                    </div>
                    <SentimentChart newsData={news_data} />
                  </div>
                )}

                {/* Temel Finansal Göstergeler */}
                {overview && (
                  <div className="bg-[#080808] border border-[#c084fc]/12 rounded-xl p-5">
                    <span className="font-['JetBrains_Mono'] text-[9px] text-[#c084fc]/50 tracking-widest uppercase mb-3 block">
                      // Temel Gostergeler
                    </span>
                    <div className="space-y-2.5">
                      {[
                        { label: 'F/DD (P/B)', value: overview.PBRatio },
                        { label: 'Beta', value: overview.Beta },
                        { label: 'ROE (Ozk. Karlılığı)', value: overview.ROE ? `%${overview.ROE}` : '' },
                        { label: 'ROA (Varlık Karlılığı)', value: overview.ROA ? `%${overview.ROA}` : '' },
                        { label: 'Net Kar Marjı', value: overview.NetMargin ? `%${overview.NetMargin}` : '' },
                        { label: 'Halka Açık Hisse Adedi', value: overview.FloatShares ? formatMarketCap(overview.FloatShares).replace(' TL', ' hisse') : '' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">{label}</span>
                          <span className="font-['Montserrat'] text-sm font-bold text-[#c084fc]">
                            {value && value !== '' ? value : '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Stats */}
                <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5">
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase mb-3 block">
                    // Rapor Istatistikleri
                  </span>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">KAP Bildirimleri</span>
                      <span className="font-['Montserrat'] text-sm font-bold text-white">{kap_data?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">Haber Sayisi</span>
                      <span className="font-['Montserrat'] text-sm font-bold text-white">{news_data?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">Piyasa Verisi</span>
                      <span className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded ${market_data ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
                        {market_data ? 'Mevcut' : 'Yok'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">Makro Veri</span>
                      <span className={`font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded ${macro_data?.length ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
                        {macro_data?.length ? `${macro_data.length} ay` : 'Yok'}
                      </span>
                    </div>
                    {market_data?.source?.provider && (
                      <div className="flex justify-between items-center border-t border-[#1a1a1a] pt-2">
                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">Veri Kaynagi</span>
                        <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c]">{market_data.source.provider}</span>
                      </div>
                    )}
                    {market_data?.source?.fetched_at && (
                      <div className="flex justify-between items-center">
                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">Piyasa Verisi</span>
                        <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c]">
                          {timeAgo(market_data.source.fetched_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 5: KAP + News Details ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KAP Data */}
              <div className="bg-[#080808] border border-[#22c55e]/12 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
                  <h3 className="font-['Montserrat'] text-sm font-bold text-white flex items-center gap-2">
                    <Building size={16} className="text-[#22c55e]" /> KAP Bildirimleri ({kap_data?.length || 0})
                  </h3>
                </div>
                <div className="divide-y divide-[#1a1a1a] max-h-[500px] overflow-y-auto">
                  {kap_data && kap_data.length > 0 ? kap_data.map((kap: any, idx: number) => (
                    <div key={idx} className="p-4 hover:bg-[#0d0d0d] transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-['JetBrains_Mono'] text-[11px] font-medium text-[#22c55e]/80 leading-relaxed flex-1 mr-2">{kap.title}</h4>
                        <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] bg-[#0d0d0d] px-2 py-1 rounded whitespace-nowrap">{kap.date}</span>
                      </div>
                      {kap.content && (
                        <p className="font-['JetBrains_Mono'] text-[10px] text-[#64748b] leading-relaxed line-clamp-4">{kap.content}</p>
                      )}
                      {kap.url && (
                        <a href={kap.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/60 mt-2 hover:text-[#22c55e] transition-colors">
                          Orijinal Bildirime Git <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )) : (
                    <div className="p-8 text-center font-['JetBrains_Mono'] text-[11px] text-[#45474c]">KAP verisi bulunamadi.</div>
                  )}
                </div>
              </div>

              {/* News Data */}
              <div className="bg-[#080808] border border-[#60a5fa]/12 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
                  <h3 className="font-['Montserrat'] text-sm font-bold text-white flex items-center gap-2">
                    <Calendar size={16} className="text-[#60a5fa]" /> Basindan Haberler ({news_data?.length || 0})
                  </h3>
                </div>
                <div className="divide-y divide-[#1a1a1a] max-h-[500px] overflow-y-auto">
                  {news_data && news_data.length > 0 ? news_data.map((news: any, idx: number) => (
                    <div key={idx} className="p-4 hover:bg-[#0d0d0d] transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-['JetBrains_Mono'] text-[11px] font-medium text-white leading-relaxed flex-1 mr-2">{news.title}</h4>
                        <div className="flex gap-1.5 items-center shrink-0">
                          {news.sentiment === 'positive' && <span className="font-['JetBrains_Mono'] text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded">Olumlu</span>}
                          {news.sentiment === 'negative' && <span className="font-['JetBrains_Mono'] text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded">Olumsuz</span>}
                          {news.sentiment === 'neutral' && <span className="font-['JetBrains_Mono'] text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#64748b]/10 text-[#64748b] border border-[#64748b]/20 rounded">Notr</span>}
                        </div>
                      </div>
                      <p className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] mb-1.5">{news.source} &bull; {news.date}</p>
                      <p className="font-['JetBrains_Mono'] text-[10px] text-[#64748b] leading-relaxed line-clamp-3">{news.content}</p>
                      {news.url && (
                        <a href={news.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] text-[#60a5fa]/60 mt-2 hover:text-[#60a5fa] transition-colors">
                          Haberi Oku <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )) : (
                    <div className="p-8 text-center font-['JetBrains_Mono'] text-[11px] text-[#45474c]">Haber verisi bulunamadi.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
