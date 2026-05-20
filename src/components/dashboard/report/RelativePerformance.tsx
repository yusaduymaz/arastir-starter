'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Award, BarChart2 } from 'lucide-react'

interface TimeSeriesEntry {
  '1. open': string
  '2. high': string
  '3. low': string
  '4. close': string
  '5. volume': string
}

interface RelativePerformanceProps {
  ticker: string
  timeSeries: Record<string, TimeSeriesEntry>
  benchmarkSeries?: Record<string, TimeSeriesEntry>
}

export function RelativePerformance({ ticker, timeSeries, benchmarkSeries }: RelativePerformanceProps) {
  // Sort stock data by date ascending
  const stockEntries = Object.entries(timeSeries)
    .map(([date, entry]) => ({
      date,
      close: parseFloat(entry['4. close']),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Slice to last 12 months (~250 trading days) to match chart display
  const slicedStock = stockEntries.slice(-250)

  if (slicedStock.length < 2) return null

  const firstStock = slicedStock[0]
  const lastStock = slicedStock[slicedStock.length - 1]

  const stockPerf = ((lastStock.close - firstStock.close) / firstStock.close) * 100

  // Find benchmark values for closest matching dates
  const findClosePrice = (series: Record<string, TimeSeriesEntry> | undefined, targetDate: string): number | null => {
    if (!series || Object.keys(series).length === 0) return null
    if (series[targetDate]) return parseFloat(series[targetDate]['4. close'])

    const keys = Object.keys(series).sort()
    let closestKey = keys[0]
    let minDiff = Math.abs(new Date(keys[0]).getTime() - new Date(targetDate).getTime())

    for (const key of keys) {
      const diff = Math.abs(new Date(key).getTime() - new Date(targetDate).getTime())
      if (diff < minDiff) {
        minDiff = diff
        closestKey = key
      }
    }
    return parseFloat(series[closestKey]['4. close'])
  }

  const firstBench = findClosePrice(benchmarkSeries, firstStock.date)
  const lastBench = findClosePrice(benchmarkSeries, lastStock.date)

  const hasBenchmark = firstBench !== null && lastBench !== null
  const benchPerf = hasBenchmark ? ((lastBench - firstBench) / firstBench) * 100 : 0

  const relativePerf = stockPerf - benchPerf
  const outperforms = relativePerf >= 0

  const displayTicker = ticker.toUpperCase().replace('.IS', '')

  return (
    <div className="relative group overflow-hidden bg-[#080808]/90 backdrop-blur-md border border-[#22c55e]/15 hover:border-[#22c55e]/30 rounded-xl p-5 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.7)] hover:shadow-[0_8px_30px_-4px_rgba(34,197,94,0.08)]">
      {/* Background radial gradient glow on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.06),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${outperforms ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#facc15]/10 text-[#facc15]'} border ${outperforms ? 'border-[#22c55e]/20' : 'border-[#facc15]/20'}`}>
            {outperforms ? <Award size={20} className="animate-pulse" /> : <BarChart2 size={20} />}
          </div>
          <div>
            <h4 className="font-['Montserrat'] text-[13px] font-bold text-white tracking-wide uppercase">Göreceli Performans Analizi</h4>
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#64748b] mt-0.5">
              Son 12 ayın başlangıç ve bitiş fiyatları karşılaştırması
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Stock Performance */}
          <div className="flex flex-col">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] uppercase tracking-wider">{displayTicker} Getirisi</span>
            <span className={`font-['Montserrat'] text-lg font-black flex items-center gap-1 mt-0.5 ${stockPerf >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {stockPerf >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {stockPerf >= 0 ? '+' : ''}{stockPerf.toFixed(1)}%
            </span>
          </div>

          {/* Benchmark Performance */}
          {hasBenchmark && (
            <>
              <div className="h-8 w-[1px] bg-[#1a1a1a]" />
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] uppercase tracking-wider">BIST100 Getirisi</span>
                <span className={`font-['Montserrat'] text-lg font-black flex items-center gap-1 mt-0.5 ${benchPerf >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {benchPerf >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {benchPerf >= 0 ? '+' : ''}{benchPerf.toFixed(1)}%
                </span>
              </div>

              <div className="h-8 w-[1px] bg-[#1a1a1a]" />

              {/* Relative Difference */}
              <div className="flex flex-col">
                <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] uppercase tracking-wider">Endeks Üzeri Getiri</span>
                <span className={`font-['Montserrat'] text-lg font-black flex items-center gap-1 mt-0.5 ${outperforms ? 'text-[#22c55e]' : 'text-[#facc15]'}`}>
                  {relativePerf >= 0 ? '+' : ''}{relativePerf.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
