'use client'

import React from 'react'
import { NumberTicker } from '@/components/ui/NumberTicker'

const STATS = [
  { value: 2400, suffix: '+', label: 'Analiz Tamamlandı', icon: 'analytics', color: '#4edea3' },
  { value: 98, suffix: '%', label: 'Doğruluk Oranı', icon: 'verified', color: '#facc15' },
  { value: 10, suffix: 'dk', label: 'Ortalama Yanıt Süresi', icon: 'timer', color: '#4edea3' },
  { value: 8, suffix: '+', label: 'Veri Kaynağı', icon: 'hub', color: '#facc15' },
]

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1a1a1b] rounded-xl overflow-hidden border border-[#22c55e]/8">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="bg-[#080808] flex flex-col items-center justify-center py-8 px-6 gap-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[#facc15]/3 transition-all duration-500" />

          <span
            className="material-symbols-outlined text-2xl mb-1"
            style={{ color: `${stat.color}60`, fontVariationSettings: "'FILL' 1" }}
          >
            {stat.icon}
          </span>

          <div className="flex items-baseline gap-0.5">
            <NumberTicker
              value={stat.value}
              suffix={stat.suffix}
              className="font-['Montserrat'] text-4xl font-black"
              style={{ color: stat.color } as React.CSSProperties}
              delay={i * 150}
            />
          </div>

          <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] tracking-widest uppercase text-center">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )
}
