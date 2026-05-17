'use client'

import { motion } from 'framer-motion'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { useRef } from 'react'
import { AnimatedBeam } from '@/components/ui/AnimatedBeam'
import { TypingAnimation } from '@/components/ui/TypingAnimation'

const BEZIER = [0.22, 1, 0.36, 1] as [number, number, number, number]

const AGENTS = [
  { icon: 'travel_explore', label: 'Arama', color: '#4edea3' },
  { icon: 'fact_check', label: 'Doğrulama', color: '#facc15' },
  { icon: 'analytics', label: 'Analiz', color: '#facc15' },
  { icon: 'edit_document', label: 'Rapor', color: '#4edea3' },
]

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const a0Ref = useRef<HTMLDivElement>(null)
  const a1Ref = useRef<HTMLDivElement>(null)
  const a2Ref = useRef<HTMLDivElement>(null)
  const a3Ref = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const agentRefs = [a0Ref, a1Ref, a2Ref, a3Ref]

  return (
    <section className="retro-grid relative flex flex-col items-center text-center py-20 md:py-32 gap-8 rounded-2xl overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#facc15]/4 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[200px] rounded-full bg-[#4edea3]/4 blur-[80px]" />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#22c55e]/25 bg-[#22c55e]/6 text-[#22c55e] font-['JetBrains_Mono'] text-[11px] tracking-widest uppercase"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22c55e]" />
        </span>
        BIST 100 · KAP · TCMB Entegreli
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1, ease: BEZIER }}
        className="font-['Montserrat'] text-5xl md:text-6xl lg:text-7xl font-black text-white max-w-4xl leading-[1.05] tracking-tight"
      >
        Piyasa Araştırmasını{' '}
        <span className="relative inline-block">
          <span className="text-[#facc15]">
            <TypingAnimation text="10 Dakikaya" duration={55} delay={800} cursor={false} />
          </span>
          <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#facc15]/60 to-transparent" />
        </span>
        {' '}İndirin
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.25, ease: BEZIER }}
        className="font-['Inter'] text-lg text-[#8c8c94] max-w-xl leading-relaxed"
      >
        4 aşamalı otonom AI pipeline — veri toplama, çapraz doğrulama, analiz ve
        kurumsal kalite rapor üretimi.
      </motion.p>

      {/* AnimatedBeam Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.4, ease: BEZIER }}
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className="relative w-full max-w-2xl h-24 flex items-center justify-between px-4"
      >
        {/* Input node */}
        <div
          ref={inputRef}
          className="flex flex-col items-center gap-2 flex-shrink-0 z-10"
        >
          <div className="w-10 h-10 rounded-lg bg-[#0a121e] border border-[#facc15]/30 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.15)]">
            <span className="material-symbols-outlined text-[#facc15] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              input
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">Sorgu</span>
        </div>

        {/* Agent nodes */}
        {AGENTS.map((agent, i) => (
          <div
            key={agent.label}
            ref={agentRefs[i] as React.RefObject<HTMLDivElement>}
            className="flex flex-col items-center gap-2 flex-shrink-0 z-10"
          >
            <div
              className="w-10 h-10 rounded-lg bg-[#0a121e] border flex items-center justify-center transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: `${agent.color}40`,
                boxShadow: `0 0 12px ${agent.color}10`,
              }}
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ color: agent.color, fontVariationSettings: "'FILL' 1" }}
              >
                {agent.icon}
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">
              {agent.label}
            </span>
          </div>
        ))}

        {/* Output node */}
        <div
          ref={outputRef}
          className="flex flex-col items-center gap-2 flex-shrink-0 z-10"
        >
          <div className="w-10 h-10 rounded-lg bg-[#0a121e] border border-[#4edea3]/30 flex items-center justify-center shadow-[0_0_20px_rgba(78,222,163,0.15)]">
            <span className="material-symbols-outlined text-[#4edea3] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              picture_as_pdf
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase">Rapor</span>
        </div>

        {/* Beams */}
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={inputRef as React.RefObject<HTMLElement>} toRef={a0Ref as React.RefObject<HTMLElement>} duration={2.0} delay={0} gradientStartColor="#facc15" gradientStopColor="#4edea3" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={a0Ref as React.RefObject<HTMLElement>} toRef={a1Ref as React.RefObject<HTMLElement>} duration={2.0} delay={0.5} gradientStartColor="#4edea3" gradientStopColor="#facc15" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={a1Ref as React.RefObject<HTMLElement>} toRef={a2Ref as React.RefObject<HTMLElement>} duration={2.0} delay={1.0} gradientStartColor="#facc15" gradientStopColor="#4edea3" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={a2Ref as React.RefObject<HTMLElement>} toRef={a3Ref as React.RefObject<HTMLElement>} duration={2.0} delay={1.5} gradientStartColor="#4edea3" gradientStopColor="#facc15" />
        <AnimatedBeam containerRef={containerRef as React.RefObject<HTMLElement>} fromRef={a3Ref as React.RefObject<HTMLElement>} toRef={outputRef as React.RefObject<HTMLElement>} duration={2.0} delay={2.0} gradientStartColor="#facc15" gradientStopColor="#4edea3" />
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.55, ease: BEZIER }}
        className="flex flex-col sm:flex-row gap-4 mt-2"
      >
        <SignedOut>
          <Link
            href="/sign-in"
            className="relative overflow-hidden group shiny-btn bg-[#facc15] text-[#0a0a0a] font-['Montserrat'] font-bold text-sm py-3.5 px-8 rounded-lg transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
          >
            Demo Başlat
            <span className="material-symbols-outlined text-sm ml-2 align-middle">arrow_forward</span>
          </Link>
          <Link
            href="#pipeline"
            className="font-['Montserrat'] font-semibold text-sm py-3.5 px-8 rounded-lg border border-[#45474c] text-[#8c8c94] hover:border-[#facc15]/40 hover:text-[#facc15] transition-all duration-300"
          >
            Nasıl Çalışır?
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="shiny-btn bg-[#facc15] text-[#0a0a0a] font-['Montserrat'] font-bold text-sm py-3.5 px-8 rounded-lg transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
          >
            Dashboard'a Git
            <span className="material-symbols-outlined text-sm ml-2 align-middle">arrow_forward</span>
          </Link>
        </SignedIn>
      </motion.div>

      {/* Trust signals */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9, ease: BEZIER }}
        className="font-['JetBrains_Mono'] text-[11px] text-[#45474c] tracking-wider"
      >
        Kredi kartı gerekmez · 3 ücretsiz analiz · İptal anında
      </motion.p>
    </section>
  )
}
