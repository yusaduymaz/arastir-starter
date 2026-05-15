'use client'

import { motion } from 'framer-motion'
import { MagicCard } from '@/components/ui/MagicCard'

const BEZIER = [0.22, 1, 0.36, 1] as [number, number, number, number]

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transition = 'transform 0.5s ease'
    e.currentTarget.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)'
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transition = 'transform 0.08s ease'
  }

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

const OUTPUT_FEATURES = [
  { icon: 'picture_as_pdf', label: 'PDF', color: '#ef4444' },
  { icon: 'slideshow', label: 'PPTX', color: '#facc15' },
  { icon: 'table_chart', label: 'Excel', color: '#4edea3' },
]

export function OutputSection() {
  return (
    <section className="flex flex-col gap-12">
      <div className="text-center flex flex-col gap-4">
        <span className="font-['JetBrains_Mono'] text-[11px] text-[#22c55e]/60 tracking-[0.2em] uppercase">
          // Çıktı Kalitesi
        </span>
        <h2 className="font-['Montserrat'] text-4xl md:text-5xl font-black text-white tracking-tight">
          Output Fidelity
        </h2>
        <p className="font-['Inter'] text-[#8c8c94] max-w-lg mx-auto leading-relaxed">
          Kurumsal kalite çıktılar — anında indirilebilir format seçenekleriyle.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* PDF — large */}
        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: BEZIER }}
        >
          <div className="border-beam-wrapper h-full">
            <div className="beam-content h-full">
              <TiltCard className="relative group rounded-[calc(0.75rem-1px)] overflow-hidden bg-[#080808] min-h-[280px] flex items-center justify-center">
                {/* Mock PDF preview */}
                <div className="absolute inset-0 flex flex-col gap-2 p-8 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
                  <div className="h-3 bg-[#22c55e]/20 rounded w-3/4" />
                  <div className="h-2 bg-[#45474c] rounded w-full" />
                  <div className="h-2 bg-[#45474c] rounded w-5/6" />
                  <div className="h-2 bg-[#45474c] rounded w-full" />
                  <div className="mt-3 h-24 bg-[#facc15]/8 rounded border border-[#facc15]/15" />
                  <div className="h-2 bg-[#45474c] rounded w-4/5" />
                  <div className="h-2 bg-[#45474c] rounded w-full" />
                  <div className="mt-2 flex gap-2">
                    <div className="h-16 flex-1 bg-[#22c55e]/8 rounded border border-[#22c55e]/15" />
                    <div className="h-16 flex-1 bg-[#22c55e]/8 rounded border border-[#22c55e]/15" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10" />
                <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/25 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ef4444] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      picture_as_pdf
                    </span>
                  </div>
                  <div>
                    <span className="font-['Montserrat'] text-sm font-bold text-white block">
                      Executive PDF Summary
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c]">
                      Grafik · Tablo · Özet
                    </span>
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </motion.div>

        {/* PPTX + Features Column */}
        <motion.div
          className="md:col-span-2 flex flex-col gap-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: BEZIER }}
        >
          {/* PPTX card */}
          <div className="border-beam-wrapper flex-1">
            <div className="beam-content h-full">
              <TiltCard className="relative group rounded-[calc(0.75rem-1px)] overflow-hidden bg-[#080808] min-h-[160px] flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col gap-2 p-5 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
                  <div className="flex-1 bg-[#facc15]/8 rounded border border-[#facc15]/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#facc15]/30" style={{ fontVariationSettings: "'FILL' 1" }}>
                      present_to_all
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10" />
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#facc15]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    slideshow
                  </span>
                  <span className="font-['Montserrat'] text-sm font-bold text-white">Presentation Deck</span>
                </div>
              </TiltCard>
            </div>
          </div>

          {/* Format chips */}
          <MagicCard className="bg-[#080808] border border-[#1a1a1b] rounded-xl p-5 flex flex-col gap-3" glowColor="rgba(250,204,21,0.06)">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] tracking-widest uppercase">
              Çıktı Formatları
            </span>
            <div className="flex gap-2 flex-wrap">
              {OUTPUT_FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-['JetBrains_Mono'] text-xs font-bold"
                  style={{
                    color: f.color,
                    borderColor: `${f.color}30`,
                    backgroundColor: `${f.color}08`,
                  }}
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {f.icon}
                  </span>
                  {f.label}
                </div>
              ))}
            </div>
            <p className="font-['Inter'] text-xs text-[#45474c] leading-relaxed">
              Tek tıkla indirme · Otomatik markalama · Kurumsal şablon
            </p>
          </MagicCard>
        </motion.div>
      </div>
    </section>
  )
}
