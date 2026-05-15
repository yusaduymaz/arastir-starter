'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { AnimatedBeam } from '@/components/ui/AnimatedBeam'
import { MagicCard } from '@/components/ui/MagicCard'

const BEZIER = [0.22, 1, 0.36, 1] as [number, number, number, number]

const SOURCES = [
  { icon: 'language', label: 'KAP', color: '#4edea3' },
  { icon: 'show_chart', label: 'BIST', color: '#4edea3' },
  { icon: 'account_balance', label: 'TCMB', color: '#4edea3' },
]

const AGENTS = [
  {
    icon: 'travel_explore',
    title: 'Arama Ajanı',
    desc: 'Global veri tabanlarını hızla tarıyor, ön sinyalleri çıkarıyor.',
    color: '#4edea3',
  },
  {
    icon: 'fact_check',
    title: 'Doğrulama Ajanı',
    desc: 'Tüm iddiaları yetkili kaynaklarla çapraz doğruluyor.',
    color: '#facc15',
    accent: true,
  },
  {
    icon: 'analytics',
    title: 'Analist Ajan',
    desc: 'Doğrulanan veri noktalarını eyleme dönüşebilir içgörülere sentezliyor.',
    color: '#facc15',
  },
  {
    icon: 'edit_document',
    title: 'Yazar Ajan',
    desc: 'Sentezlenmiş zekayı kurumsal kalite raporlara dönüştürüyor.',
    color: '#4edea3',
  },
]

const cardVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.65, delay: i * 0.13, ease: BEZIER },
  }),
}

export function PipelineSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const s0 = useRef<HTMLDivElement>(null)
  const s1 = useRef<HTMLDivElement>(null)
  const s2 = useRef<HTMLDivElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const out = useRef<HTMLDivElement>(null)

  return (
    <section id="pipeline" className="flex flex-col gap-16 py-8">
      {/* Header */}
      <div className="text-center flex flex-col gap-4">
        <span className="font-['JetBrains_Mono'] text-[11px] text-[#22c55e]/60 tracking-[0.2em] uppercase">
          // Mimari
        </span>
        <h2 className="font-['Montserrat'] text-4xl md:text-5xl font-black text-white tracking-tight">
          Intelligence Pipeline
        </h2>
        <p className="font-['Inter'] text-[#8c8c94] max-w-lg mx-auto leading-relaxed">
          4 aşamalı otonom mimari — veriden kurumsal rapora tek tıkla.
        </p>
      </div>

      {/* Source → Hub visual */}
      <div
        ref={containerRef}
        className="relative hidden md:flex items-center justify-between px-8 py-10 bg-[#080808] border border-[#22c55e]/8 rounded-2xl overflow-hidden"
      >
        {/* Scanline overlay */}
        <div className="scanlines absolute inset-0 pointer-events-none z-0" />

        {/* Data Sources */}
        <div className="flex flex-col gap-4 z-10">
          {SOURCES.map((src, i) => (
            <div
              key={src.label}
              ref={i === 0 ? s0 : i === 1 ? s1 : s2}
              className="flex items-center gap-3 bg-[#0a0a0b] border border-[#22c55e]/15 rounded-lg px-4 py-2.5"
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ color: src.color, fontVariationSettings: "'FILL' 1" }}
              >
                {src.icon}
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#c5c6cc] font-bold">
                {src.label}
              </span>
            </div>
          ))}
        </div>

        {/* Center hub */}
        <div
          ref={hub}
          className="z-10 flex flex-col items-center gap-2"
        >
          <div className="relative w-20 h-20 rounded-2xl bg-[#0a121e] border-2 border-[#facc15]/40 flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.2)]">
            <span className="material-symbols-outlined text-3xl text-[#facc15]" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-[#facc15]/20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#facc15]/60 tracking-widest">AI CORE</span>
        </div>

        {/* Output */}
        <div
          ref={out}
          className="z-10 flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-xl bg-[#0a121e] border border-[#4edea3]/30 flex items-center justify-center shadow-[0_0_25px_rgba(78,222,163,0.15)]">
            <span className="material-symbols-outlined text-2xl text-[#4edea3]" style={{ fontVariationSettings: "'FILL' 1" }}>
              description
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#4edea3]/60 tracking-widest">RAPOR</span>
        </div>

        {/* Beams */}
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={s0 as React.RefObject<HTMLElement>} toRef={hub as React.RefObject<HTMLElement>} curvature={40} duration={2} delay={0} gradientStartColor="#4edea3" gradientStopColor="#facc15" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={s1 as React.RefObject<HTMLElement>} toRef={hub as React.RefObject<HTMLElement>} duration={2} delay={0.6} gradientStartColor="#4edea3" gradientStopColor="#facc15" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={s2 as React.RefObject<HTMLElement>} toRef={hub as React.RefObject<HTMLElement>} curvature={-40} duration={2} delay={1.2} gradientStartColor="#4edea3" gradientStopColor="#facc15" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={hub as React.RefObject<HTMLElement>} toRef={out as React.RefObject<HTMLElement>} duration={2.5} delay={0.3} gradientStartColor="#facc15" gradientStopColor="#4edea3" pathWidth={2} />
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENTS.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <MagicCard
              className="relative bg-[#080808] border border-[#1a1a1b] hover:border-[#facc15]/20 rounded-xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-300 group h-full"
              glowColor="rgba(250,204,21,0.08)"
            >
              {card.accent && (
                <div className="absolute left-0 top-6 w-0.5 h-10 rounded-r"
                  style={{ background: card.color }} />
              )}

              {/* Step number */}
              <span
                className="font-['JetBrains_Mono'] text-[10px] tracking-widest"
                style={{ color: `${card.color}50` }}
              >
                0{i + 1}
              </span>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${card.color}10`,
                  border: `1px solid ${card.color}25`,
                  boxShadow: `0 0 0 0 ${card.color}30`,
                }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: card.color, fontVariationSettings: "'FILL' 1" }}
                >
                  {card.icon}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="font-['Montserrat'] text-base font-bold text-white">
                  {card.title}
                </h4>
                <p className="font-['Inter'] text-sm text-[#64748b] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </MagicCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
