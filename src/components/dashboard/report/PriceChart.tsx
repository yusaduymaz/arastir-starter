'use client'

import React, { useState } from 'react'
import { ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { calculateSMA, calculateVolumeSMA } from '@/lib/math/technical-indicators'

interface PriceChartProps {
  timeSeries: Record<string, { 
    '1. open': string
    '2. high': string
    '3. low': string
    '4. close': string
    '5. volume': string 
  }>
}

export function PriceChart({ timeSeries }: PriceChartProps) {
  const [showMA20, setShowMA20] = useState(false)
  const [showMA50, setShowMA50] = useState(true)
  const [showMA200, setShowMA200] = useState(false)

  // Sort daily data by date ascending
  const sortedEntries = Object.entries(timeSeries)
    .map(([date, entry]) => ({
      date,
      open: parseFloat(entry['1. open']),
      high: parseFloat(entry['2. high']),
      low: parseFloat(entry['3. low']),
      close: parseFloat(entry['4. close']),
      volume: parseInt(entry['5. volume']) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (sortedEntries.length === 0) return null

  // Calculate MAs on full dataset to ensure valid values at the start of display window
  const prices = sortedEntries.map(e => e.close)
  const volumes = sortedEntries.map(e => e.volume)

  const ma20Values = calculateSMA(prices, 20)
  const ma50Values = calculateSMA(prices, 50)
  const ma200Values = calculateSMA(prices, 200)
  const volAvg20Values = calculateVolumeSMA(volumes, 20)

  // Map calculations back to entries
  const fullData = sortedEntries.map((e, idx) => {
    const avgVol = volAvg20Values[idx] || 0
    const isAnomaly = avgVol > 0 && e.volume > 2 * avgVol
    return {
      ...e,
      ma20: ma20Values[idx],
      ma50: ma50Values[idx],
      ma200: ma200Values[idx],
      volAvg20: avgVol,
      isAnomaly,
    }
  })

  // Slice to most recent 12 months (~250 trading days) for crisp visual performance
  const chartData = fullData.slice(-250)

  // Calculate Y-axis scaling bounds for Price
  const activePrices = chartData.flatMap(d => {
    const vals = [d.low, d.high]
    if (showMA20 && d.ma20 !== null) vals.push(d.ma20)
    if (showMA50 && d.ma50 !== null) vals.push(d.ma50)
    if (showMA200 && d.ma200 !== null) vals.push(d.ma200)
    return vals
  })
  const minPrice = Math.min(...activePrices) * 0.97
  const maxPrice = Math.max(...activePrices) * 1.03

  // Max volume for volume Y-axis scaling
  const maxVolume = Math.max(...chartData.map(d => d.volume))

  // Custom tooltips with MA values and volume anomaly alert
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find matching item in chartData
      const data = chartData.find(d => d.date === label) || payload[0].payload
      return (
        <div className="bg-[#0a0a0a] border border-[#22c55e]/30 rounded-lg p-3 font-['JetBrains_Mono'] text-[11px] text-[#e2e8f0] shadow-xl space-y-1 z-50">
          <p className="font-bold text-[#64748b]">Tarih: {label}</p>
          <p className="flex justify-between gap-6">
            <span>Kapanış:</span>
            <span className="font-bold text-white">{data.close.toFixed(2)} TL</span>
          </p>
          <p className="flex justify-between gap-6 text-[10px]">
            <span>A/Y/D:</span>
            <span className="text-[#94a3b8]">
              {data.open.toFixed(1)} / {data.high.toFixed(1)} / {data.low.toFixed(1)}
            </span>
          </p>
          <p className="flex justify-between gap-6">
            <span>Hacim:</span>
            <span className={`font-bold ${data.isAnomaly ? 'text-[#ea580c] scale-105' : 'text-[#facc15]'}`}>
              {data.volume.toLocaleString('tr-TR')}
            </span>
          </p>
          {showMA20 && data.ma20 && (
            <p className="flex justify-between gap-6 text-[#facc15]">
              <span>MA20:</span>
              <span>{data.ma20.toFixed(2)} TL</span>
            </p>
          )}
          {showMA50 && data.ma50 && (
            <p className="flex justify-between gap-6 text-[#3b82f6]">
              <span>MA50:</span>
              <span>{data.ma50.toFixed(2)} TL</span>
            </p>
          )}
          {showMA200 && data.ma200 && (
            <p className="flex justify-between gap-6 text-[#d946ef]">
              <span>MA200:</span>
              <span>{data.ma200.toFixed(2)} TL</span>
            </p>
          )}
          {data.isAnomaly && (
            <div className="mt-2 px-2 py-1 bg-[#ea580c]/10 border border-[#ea580c]/30 rounded text-[9px] text-[#ea580c] font-bold text-center animate-pulse">
              ⚠️ ANORMAL HACİM ARTIŞI (&gt;2x)
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Moving Average Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] uppercase tracking-wider mr-1">Göstergeler:</span>
        <button
          onClick={() => setShowMA20(!showMA20)}
          className={`px-2.5 py-1 rounded font-['JetBrains_Mono'] text-[9px] font-bold border transition-all ${
            showMA20
              ? 'bg-[#facc15]/10 border-[#facc15] text-[#facc15] shadow-[0_0_8px_rgba(250,204,21,0.15)]'
              : 'border-[#1a1a1a] text-[#64748b] hover:border-[#64748b]/30'
          }`}
        >
          MA20
        </button>
        <button
          onClick={() => setShowMA50(!showMA50)}
          className={`px-2.5 py-1 rounded font-['JetBrains_Mono'] text-[9px] font-bold border transition-all ${
            showMA50
              ? 'bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.15)]'
              : 'border-[#1a1a1a] text-[#64748b] hover:border-[#64748b]/30'
          }`}
        >
          MA50
        </button>
        <button
          onClick={() => setShowMA200(!showMA200)}
          className={`px-2.5 py-1 rounded font-['JetBrains_Mono'] text-[9px] font-bold border transition-all ${
            showMA200
              ? 'bg-[#d946ef]/10 border-[#d946ef] text-[#d946ef] shadow-[0_0_8px_rgba(217,70,239,0.15)]'
              : 'border-[#1a1a1a] text-[#64748b] hover:border-[#64748b]/30'
          }`}
        >
          MA200
        </button>
      </div>

      {/* Chart Panel */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} syncId="tech-analysis-chart" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#1a1a1a' }}
              tickLine={false}
              tickFormatter={(dateStr) => dateStr.slice(2, 7)} // YY-MM
            />

            {/* Price YAxis */}
            <YAxis
              yAxisId="price"
              domain={[minPrice, maxPrice]}
              tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#1a1a1a' }}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(0)}`}
              width={35}
            />

            {/* Hidden Volume YAxis (stretched so bars occupy the bottom 25% of the height) */}
            <YAxis
              yAxisId="volume"
              orientation="right"
              domain={[0, maxVolume * 4]}
              tick={false}
              axisLine={false}
              tickLine={false}
              width={0}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Volume Bars */}
            <Bar yAxisId="volume" dataKey="volume">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isAnomaly ? '#ea580c' : '#22c55e'} 
                  fillOpacity={entry.isAnomaly ? 0.8 : 0.15} 
                />
              ))}
            </Bar>

            {/* Price Area */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', stroke: '#0a0a0a', strokeWidth: 2 }}
            />

            {/* Technical Analysis Lines */}
            {showMA20 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma20"
                stroke="#facc15"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={false}
              />
            )}
            {showMA50 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma50"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            )}
            {showMA200 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma200"
                stroke="#d946ef"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
