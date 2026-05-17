import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { ActivePipeline } from '@/components/dashboard/ActivePipeline';
import { ProminentSearch } from '@/components/dashboard/ProminentSearch';
import { HistoryTable } from '@/components/dashboard/HistoryTable';
import { MarqueeTicker } from '@/components/ui/MarqueeTicker';
import { getTickerData } from '@/lib/market/ticker-data';

export const dynamic = 'force-dynamic';

function Sparkline({ up }: { up: boolean }) {
  const points = up
    ? '0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,3 64,5 72,1'
    : '0,3  8,6  16,4  24,10 32,8  40,14 48,12 56,16 64,14 72,19'
  return (
    <svg width="72" height="20" viewBox="0 0 72 20" fill="none" className="opacity-70">
      <polyline
        points={points}
        stroke={up ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        className="sparkline-path"
      />
    </svg>
  )
}

export default async function DashboardPage() {
  const { userId } = auth();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  let history: any[] = [];
  if (userId) {
    const { data, error } = await supabase
      .from('research_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) history = data;
  }

  let tickerData: { symbol: string; price: string; change: string; changePercent: number; up: boolean }[] = [];
  try {
    tickerData = await getTickerData();
  } catch {
    // Hata durumunda bos array kalir, MarqueeTicker fallback kullanir
  }

  const trending = tickerData
    .filter(t => t.symbol !== 'DOLAR' && t.symbol !== 'EURO' && t.symbol !== 'ALTIN')
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 6)
    .map(t => ({ symbol: t.symbol, pct: t.changePercent, vol: '' }));

  // Show ActivePipeline for in-progress, pending, OR the most recent failed task
  // (so the user can see WHY it failed and click "Yeniden Dene")
  const activeTask = history.find(
    (item) => item.status === 'running' || item.status === 'pending'
  ) || history.find((item) => item.status === 'failed');

  const completedCount = history.filter((h) => h.status === 'completed').length;
  const inProgressCount = history.filter((h) => h.status === 'running').length;

  return (
    <main className="flex-1 overflow-y-auto p-6 z-10 flex flex-col gap-4">

      {/* ── Row 1: Live Ticker ── */}
      <div className="blur-fade blur-fade-d1">
        <MarqueeTicker tickers={tickerData.map(t => ({ symbol: t.symbol, price: t.price, change: t.change, up: t.up }))} />
      </div>

      {/* ── Row 2: AI Search + Orbiting Circles ── */}
      <ProminentSearch />

      {/* ── Row 3: Active Pipeline ── */}
      {activeTask && (
        <div className="blur-fade blur-fade-d3">
          <ActivePipeline initialTask={activeTask} />
        </div>
      )}

      {/* ── Row 4: Bento — Trending Heatmap + Market Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 blur-fade blur-fade-d4">

        {/* Trending Stocks Heatmap */}
        <div className="md:col-span-2 bg-[#080808] border border-[#22c55e]/12 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50 tracking-widest uppercase">
              // Trend Hisseler — BIST
            </span>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">Son 1g</span>
          </div>
          {trending.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[#45474c] font-['JetBrains_Mono'] text-xs">
              Piyasa verisi alinamadi
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {trending.map((stock) => {
                const up = stock.pct >= 0
                return (
                  <div
                    key={stock.symbol}
                    className={`heat-${up ? 'up' : 'down'} relative flex flex-col gap-1 p-3 rounded-lg border cursor-default transition-all`}
                    style={{
                      backgroundColor: up ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                      borderColor:     up ? 'rgba(34,197,94,0.2)'  : 'rgba(239,68,68,0.2)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-white">
                        {stock.symbol}
                      </span>
                      <span
                        className="font-['JetBrains_Mono'] text-[10px] font-bold"
                        style={{ color: up ? '#22c55e' : '#ef4444' }}
                      >
                        {up ? '+' : ''}{stock.pct.toFixed(2)}%
                      </span>
                    </div>
                    <Sparkline up={up} />
                    <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">
                      {stock.vol && `Hacim ${stock.vol}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Market Stats Column */}
        <div className="flex flex-col gap-4">

          {/* Completed Reports */}
          <div className="bg-[#080808] border border-[#22c55e]/12 rounded-xl p-4 flex flex-col gap-2 flex-1">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">
              Tamamlanan
            </span>
            <div className="flex items-end justify-between">
              <span className="font-['Montserrat'] text-4xl font-bold text-white">
                {completedCount}
              </span>
              <span className="material-symbols-outlined text-[#22c55e]/40 text-3xl">description</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50">
              rapor hazırlandı
            </span>
            <div className="mt-1 h-1 rounded-full bg-[#0d0d0d] overflow-hidden">
              <div
                className="h-full bg-[#22c55e] rounded-full transition-all"
                style={{ width: `${Math.min((completedCount / Math.max(history.length, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Time Saved */}
          <div className="bg-[#080808] border border-[#facc15]/12 rounded-xl p-4 flex flex-col gap-2 flex-1">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">
              Tasarruf
            </span>
            <div className="flex items-end justify-between">
              <span className="font-['Montserrat'] text-4xl font-bold text-[#facc15]">
                {history.length * 4}
              </span>
              <span className="material-symbols-outlined text-[#facc15]/40 text-3xl">schedule</span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#facc15]/50">
              saat kazanıldı
            </span>
          </div>

          {/* Active analyses */}
          {inProgressCount > 0 && (
            <div className="bg-[#080808] border border-[#facc15]/30 rounded-xl p-4 flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-[#facc15] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#facc15] font-bold">
                  {inProgressCount} Aktif Analiz
                </p>
                <p className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">
                  işleniyor...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 5: Research History Terminal ── */}
      <HistoryTable sessions={history} />

    </main>
  );
}
