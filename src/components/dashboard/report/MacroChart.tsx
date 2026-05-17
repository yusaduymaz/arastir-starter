'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface MacroChartProps {
  macroData: Array<{
    Tarih?: string
    date?: string
    TP_DK_USD_A?: string
    TP_DK_USD_A_YTL?: string
    TP_FG_J0?: string
    TP_MK_B_A2?: string
    [key: string]: any
  }>
}

export function MacroChart({ macroData }: MacroChartProps) {
  const data = macroData
    .map((d) => ({
      date: (d.Tarih || d.date || '').slice(0, 7),
      usdTry: parseFloat(d.TP_DK_USD_A || d.TP_DK_USD_A_YTL || '0') || null,
      tufe: parseFloat(d.TP_FG_J0 || '0') || null,
      faiz: parseFloat(d.TP_MK_B_A2 || '0') || null,
    }))
    .filter((d) => d.date)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (data.length === 0) return null

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            axisLine={{ stroke: '#1a1a1a' }}
            tickLine={false}
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
          />
          <Line yAxisId="left" type="monotone" dataKey="usdTry" stroke="#facc15" strokeWidth={2} dot={false} name="USD/TRY" />
          <Line yAxisId="right" type="monotone" dataKey="faiz" stroke="#ef4444" strokeWidth={2} dot={false} name="Faiz %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
