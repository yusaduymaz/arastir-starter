'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { AnimatedBeam } from '@/components/ui/AnimatedBeam'

const PIPELINE = [
  { icon: 'travel_explore', label: 'Arama',     color: '#4edea3' },
  { icon: 'fact_check',     label: 'Doğrulama', color: '#facc15' },
  { icon: 'analytics',      label: 'Analiz',    color: '#facc15' },
  { icon: 'edit_document',  label: 'Rapor',     color: '#4edea3' },
]

const TRUST = [
  { icon: 'verified',        label: 'KAP Entegreli',    color: '#4edea3' },
  { icon: 'show_chart',      label: 'BIST 100 Canlı',   color: '#4edea3' },
  { icon: 'account_balance', label: 'TCMB Verileri',    color: '#facc15' },
  { icon: 'shield',          label: 'KVKK Uyumlu',      color: '#64748b' },
]

const METRICS = [
  { value: '10 dk', label: 'Yanıt süresi', color: '#facc15' },
  { value: '%98',   label: 'Doğruluk',    color: '#4edea3' },
  { value: '8+',    label: 'Kaynak',      color: '#facc15' },
]

function PipelineBeam() {
  const containerRef = useRef<HTMLDivElement>(null)
  const n0 = useRef<HTMLDivElement>(null)
  const n1 = useRef<HTMLDivElement>(null)
  const n2 = useRef<HTMLDivElement>(null)
  const n3 = useRef<HTMLDivElement>(null)
  const n4 = useRef<HTMLDivElement>(null)

  const nodeRefs = [n0, n1, n2, n3, n4]

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-between w-full h-16"
    >
      {[{ icon: 'input', color: '#64748b' }, ...PIPELINE.map(p => ({ icon: p.icon, color: p.color }))].map((node, i) => (
        <div
          key={i}
          ref={nodeRefs[i] as React.RefObject<HTMLDivElement>}
          className="z-10 flex flex-col items-center gap-1.5 shrink-0"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center border"
            style={{
              background: `${node.color}10`,
              borderColor: `${node.color}30`,
              boxShadow: `0 0 12px ${node.color}15`,
            }}
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{ color: node.color, fontVariationSettings: "'FILL' 1" }}
            >
              {node.icon}
            </span>
          </div>
        </div>
      ))}

      {/* Beams between nodes */}
      {[0, 1, 2, 3].map((i) => (
        <AnimatedBeam
          key={i}
          containerRef={containerRef as React.RefObject<HTMLElement>}
          fromRef={nodeRefs[i] as React.RefObject<HTMLElement>}
          toRef={nodeRefs[i + 1] as React.RefObject<HTMLElement>}
          duration={2.2}
          delay={i * 0.5}
          gradientStartColor={i % 2 === 0 ? '#facc15' : '#4edea3'}
          gradientStopColor={i % 2 === 0 ? '#4edea3' : '#facc15'}
          pathOpacity={0.15}
        />
      ))}
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden">

      {/* ─── Left Panel: Brand + Pipeline ─── */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] shrink-0 px-14 py-12 relative border-r border-[#1a1a1b]">
        {/* Background glows */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#facc15]/4 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-0 w-[300px] h-[200px] bg-[#4edea3]/4 rounded-full blur-[80px]" />
        </div>

        {/* Retro grid */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#facc15] flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              <span className="material-symbols-outlined text-[#0a0a0a] text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                psychology
              </span>
            </div>
            <span className="font-['Montserrat'] font-black text-white text-xl tracking-tight">
              Araştır
            </span>
          </Link>
          <span className="font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/60 border border-[#22c55e]/20 rounded px-1.5 py-0.5 bg-[#22c55e]/5 tracking-widest">
            BETA
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#facc15]/60 tracking-[0.2em] uppercase">
              // AI Araştırma Platformu
            </span>
            <h2 className="font-['Montserrat'] text-4xl font-black text-white leading-[1.1] tracking-tight">
              Piyasa Zekâsını{' '}
              <span className="text-[#facc15]">Saniyeler</span>
              {' '}İçinde Üretin
            </h2>
            <p className="font-['Inter'] text-sm text-[#64748b] leading-relaxed max-w-xs">
              4 aşamalı otonom AI pipeline ile BIST, KAP ve TCMB verilerini kurumsal kalite raporlara dönüştürün.
            </p>
          </div>

          {/* Animated pipeline */}
          <div className="bg-[#080808] border border-[#1a1a1b] rounded-xl p-5 flex flex-col gap-3">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">
              // Pipeline
            </span>
            <PipelineBeam />
            <div className="flex items-center justify-between">
              {PIPELINE.map((step) => (
                <span
                  key={step.label}
                  className="font-['JetBrains_Mono'] text-[9px] tracking-widest uppercase"
                  style={{ color: `${step.color}60` }}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="bg-[#080808] border border-[#1a1a1b] rounded-xl p-4 flex flex-col gap-1"
              >
                <span
                  className="font-['Montserrat'] text-2xl font-black"
                  style={{ color: m.color }}
                >
                  {m.value}
                </span>
                <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative z-10 flex flex-col gap-3">
          <span className="font-['JetBrains_Mono'] text-[9px] text-[#2a2a2b] tracking-widest uppercase">
            // Veri Kaynakları
          </span>
          <div className="flex flex-wrap gap-2">
            {TRUST.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: `${t.color}20`,
                  backgroundColor: `${t.color}06`,
                }}
              >
                <span
                  className="material-symbols-outlined text-xs"
                  style={{ color: `${t.color}80`, fontVariationSettings: "'FILL' 1" }}
                >
                  {t.icon}
                </span>
                <span
                  className="font-['JetBrains_Mono'] text-[10px] tracking-wide"
                  style={{ color: `${t.color}70` }}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Clerk Auth Box ─── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#facc15]/4 rounded-full blur-[120px] pointer-events-none" />

        {/* Mobile logo */}
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-[#facc15] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0a0a0a] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <span className="font-['Montserrat'] font-black text-white text-base">Araştır</span>
        </Link>

        {/* Clerk box wrapper */}
        <div className="relative w-full max-w-[420px]">
          {/* BorderBeam wrapper */}
          <div className="border-beam-wrapper">
            <div className="beam-content bg-[#080808] rounded-[calc(0.75rem-1px)]">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#facc15]/40 to-transparent rounded-t-[calc(0.75rem-1px)]" />

              <div className="px-8 py-10">
                {/* Header */}
                <div className="flex flex-col gap-1 mb-8">
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-[0.2em] uppercase">
                    // Güvenli Giriş
                  </span>
                  <h1 className="font-['Montserrat'] text-2xl font-black text-white mt-2">
                    Hesabınıza Girin
                  </h1>
                  <p className="font-['Inter'] text-sm text-[#64748b]">
                    Araştır platformuna hoş geldiniz.
                  </p>
                </div>

                {/* Clerk component rendered here */}
                {children}
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-center font-['JetBrains_Mono'] text-[10px] text-[#2a2a2b] mt-6 tracking-wider">
            Hesap oluşturarak{' '}
            <a href="#" className="text-[#45474c] hover:text-[#64748b] transition-colors underline underline-offset-2">
              Kullanım Koşulları
            </a>
            {'\'nı '}kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
