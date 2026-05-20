'use client'

import React from 'react'
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import { calculateRSI } from '@/lib/math/technical-indicators'

interface RsiChartProps {
  timeSeries: Record<string, { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string }>
}

export function RsiChart({ timeSeries }: RsiChartProps) {
  // Sort data by date ascending
  const sortedEntries = Object.entries(timeSeries)
    .map(([date, entry]) => ({
      date,
      close: parseFloat(entry['4. close']),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (sortedEntries.length === 0) return null

  // Calculate RSI on the full dataset to ensure correct indicator warm-up
  const closePrices = sortedEntries.map(e => e.close)
  const rsiValues = calculateRSI(closePrices, 14)

  // Merge RSI values back into the sorted entry array
  const fullData = sortedEntries.map((e, idx) => ({
    ...e,
    rsi: rsiValues[idx],
  }))

  // Slices the dataset down to the most recent 12 months (~250 trading days) for visualization
  const chartData = fullData.slice(-250)

  return (
    <div className="w-full h-[120px] mt-2 bg-[#080808] border border-[#c084fc]/12 rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-['JetBrains_Mono'] text-[9px] text-[#c084fc]/50 tracking-widest uppercase">
          // RSI (14) GÖSTERGESİ
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart data={chartData} syncId="tech-analysis-chart" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
            tickFormatter={(dateStr) => dateStr.slice(2, 7)} // YY-MM
          />
          <YAxis
            domain={[0, 100]}
            ticks={[30, 50, 70]}
            tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
            width={25}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #c084fc30',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: '#e2e8f0',
            }}
            formatter={(value: any) => [`${Number(value).toFixed(2)}`, 'RSI']}
            labelFormatter={(label) => `Tarih: ${label}`}
          />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '70', fill: '#ef4444', position: 'insideRight', fontSize: 8, fontFamily: 'JetBrains Mono' }} />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '30', fill: '#22c55e', position: 'insideRight', fontSize: 8, fontFamily: 'JetBrains Mono' }} />
          <ReferenceLine y={50} stroke="#45474c" strokeDasharray="1 1" />
          <Line
            type="monotone"
            dataKey="rsi"
            stroke="#c084fc"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4, fill: '#c084fc', stroke: '#0a0a0a', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
