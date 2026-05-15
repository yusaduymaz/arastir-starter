'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OrbitingCircles } from '@/components/ui/OrbitingCircles'

const PLACEHOLDERS = [
  'THYAO için yatırım tezi hazırla...',
  'SASA 2025 büyüme analizi yap...',
  'Enerji sektörü karşılaştırmalı raporu...',
  'ASELS savunma harcamaları analizi...',
  'BIST100 momentum stratejisi...',
  'EREGL demir çelik sektör analizi...',
]

const QUICK_TICKERS = ['THYAO', 'EREGL', 'SASA', 'ASELS', 'GARAN', 'PGSUS']

function useTypewriter(strings: string[], speed = 55, pause = 2000) {
  const [display, setDisplay] = useState('')
  const [strIdx, setStrIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const current = strings[strIdx]
    if (!deleting && charIdx < current.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplay(current.slice(0, charIdx + 1))
        setCharIdx((c) => c + 1)
      }, speed)
    } else if (!deleting && charIdx === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplay(current.slice(0, charIdx - 1))
        setCharIdx((c) => c - 1)
      }, speed / 2)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setStrIdx((s) => (s + 1) % strings.length)
    }
    return () => clearTimeout(timeoutRef.current)
  }, [charIdx, deleting, strIdx, strings, speed, pause])

  return display
}

export function ProminentSearch() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const placeholder = useTypewriter(PLACEHOLDERS)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: query.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu.')
      }
      if (data.ticker) {
        console.log(`[Frontend] Extracted ticker: ${data.ticker}`)
      }
      setQuery('')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

      {/* ── Search Card (2/3) ── */}
      <div className="md:col-span-2 glow-card blur-fade blur-fade-d2">
        <div className="bg-[#080808] rounded-xl p-6 flex flex-col gap-5 h-full border border-[#22c55e]/10">

          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/60 tracking-widest uppercase">
                // AI Research Engine
              </span>
            </div>
            <h2 className="text-white font-['Montserrat'] text-xl font-bold leading-tight">
              Derin Finansal Analiz Başlat
            </h2>
            <p className="text-[#64748b] font-['Inter'] text-sm leading-relaxed">
              Hisse kodu veya araştırma konusu girin — yapay zeka tüm kaynakları tarayıp size özel rapor hazırlasın.
            </p>
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Input wrapper with glow on focus */}
            <div className="relative group/input">
              {/* Outer glow ring */}
              <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-[#22c55e]/0 via-[#22c55e]/0 to-[#22c55e]/0 group-focus-within/input:from-[#22c55e]/50 group-focus-within/input:via-[#facc15]/30 group-focus-within/input:to-[#22c55e]/50 transition-all duration-500 blur-[2px]" />
              <div className="relative flex items-center bg-[#0d0d0d] border border-[#22c55e]/20 rounded-lg group-focus-within/input:border-[#22c55e]/50 transition-colors overflow-hidden">
                <span className="material-symbols-outlined text-[#22c55e]/50 text-[20px] ml-4 shrink-0 group-focus-within/input:text-[#22c55e] transition-colors">
                  search
                </span>
                <input
                  type="text"
                  className="flex-1 h-14 bg-transparent pl-3 pr-4 text-white font-['JetBrains_Mono'] text-sm focus:outline-none placeholder:text-[#45474c] tracking-wide"
                  placeholder={placeholder || 'Araştırma konusu girin...'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isLoading}
                />
                {query && (
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/40 mr-4 tracking-widest">
                    ↵ ENTER
                  </span>
                )}
              </div>
            </div>

            {/* ShinyButton */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="shiny-btn w-full h-13 py-3.5 bg-[#facc15] text-black rounded-lg font-['Montserrat'] font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 hover:bg-[#fde047] hover:shadow-[0_0_30px_rgba(250,204,21,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Analizi Başlat
                </>
              )}
            </button>
          </form>

          {/* Quick tickers */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase shrink-0">
              Hızlı:
            </span>
            {QUICK_TICKERS.map((ticker) => (
              <button
                key={ticker}
                type="button"
                onClick={() => setQuery(ticker)}
                className="px-2.5 py-1 bg-black border border-[#22c55e]/20 rounded text-[#22c55e]/70 font-['JetBrains_Mono'] text-[10px] tracking-wider hover:border-[#22c55e]/60 hover:text-[#22c55e] hover:bg-[#22c55e]/05 transition-all"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Orbiting Circles Panel (1/3) ── */}
      <div className="md:col-span-1 blur-fade blur-fade-d3">
        <div className="bg-[#080808] border border-[#facc15]/10 rounded-xl p-4 h-full flex flex-col items-center justify-between gap-3">
          <div className="w-full flex items-center justify-between">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#facc15]/50 tracking-widest uppercase">
              // AI Agents
            </span>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/60 tracking-widest">
              5 aktif
            </span>
          </div>

          <div className="flex-1 w-full flex items-center justify-center">
            <OrbitingCircles />
          </div>

          <div className="w-full grid grid-cols-2 gap-1.5 text-center">
            {[
              { label: 'KAP Tarayıcı', color: '#22c55e' },
              { label: 'Haber Analizi', color: '#60a5fa' },
              { label: 'Piyasa Verisi', color: '#c084fc' },
              { label: 'Rapor Üretici', color: '#fb923c' },
            ].map((agent) => (
              <div
                key={agent.label}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/50 border border-white/05"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: agent.color }} />
                <span className="font-['JetBrains_Mono'] text-[8px] text-[#64748b] truncate">{agent.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
