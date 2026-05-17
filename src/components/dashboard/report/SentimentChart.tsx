'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface SentimentChartProps {
  newsData: Array<{ sentiment?: string }>
}

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#64748b',
}

const LABELS: Record<string, string> = {
  positive: 'Olumlu',
  negative: 'Olumsuz',
  neutral: 'Nötr',
}

export function SentimentChart({ newsData }: SentimentChartProps) {
  const counts = newsData.reduce(
    (acc, n) => {
      const s = n.sentiment || 'neutral'
      acc[s] = (acc[s] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const data = Object.entries(counts).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    color: COLORS[key as keyof typeof COLORS] || '#64748b',
  }))

  if (data.length === 0) return null

  return (
    <div className="flex items-center gap-4">
      <div className="w-[120px] h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#94a3b8]">
              {d.name}: <span className="text-white font-bold">{d.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
