'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface PriceChartProps {
  monthlySeries: Record<string, { '1. open': string; '2. high': string; '3. low': string; '4. close': string; '5. volume': string }>
}

export function PriceChart({ monthlySeries }: PriceChartProps) {
  const data = Object.entries(monthlySeries)
    .map(([date, entry]) => ({
      date: date.slice(0, 7), // YYYY-MM
      close: parseFloat(entry['4. close']),
      high: parseFloat(entry['2. high']),
      low: parseFloat(entry['3. low']),
      volume: parseInt(entry['5. volume']),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (data.length === 0) return null

  const minPrice = Math.min(...data.map(d => d.low)) * 0.95
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.05

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #22c55e30',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: '#e2e8f0',
            }}
            formatter={(value: any) => [`${Number(value).toFixed(2)} TL`, 'Kapanış']}
            labelFormatter={(label) => `Tarih: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#22c55e', stroke: '#0a0a0a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
