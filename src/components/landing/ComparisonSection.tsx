'use client'

import { motion } from 'framer-motion'

const BEZIER = [0.22, 1, 0.36, 1] as [number, number, number, number]

const OLD_WAY = [
  'Manuel ve yavaş veri toplama — saatler harcanıyor.',
  'Dağınık kaynaklar, yüksek önyargı ve hata riski.',
  'Temel analiz raporları için 2-4 saat emek.',
  'Güncel bilgi için sürekli tekrar eden iş yükü.',
]

const NEW_WAY = [
  'Otomatik, anlık veri çıkarımı — gerçek zamanlı.',
  '8+ doğrulanmış premium kaynak — paralel analiz.',
  'Kurumsal rapor 10 dakikada — PDF + PPTX.',
  'Her sorgu için yeniden çalışan taze pipeline.',
]

export function ComparisonSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Old Way */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: BEZIER }}
        className="relative bg-[#080808] border border-[#ef4444]/15 rounded-2xl p-8 flex flex-col gap-6 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ef4444]/30 to-transparent" />
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-[#ef4444]/50 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#ef4444] text-sm">close</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#ef4444]/60 tracking-widest uppercase">
            Eski Yöntem
          </span>
        </div>

        <ul className="flex flex-col gap-4">
          {OLD_WAY.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#ef4444]/50 text-base mt-0.5 shrink-0">
                remove_circle
              </span>
              <span className="font-['Inter'] text-sm text-[#64748b] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* New Way */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: 0.1, ease: BEZIER }}
        className="relative bg-[#080808] border border-[#4edea3]/20 rounded-2xl p-8 flex flex-col gap-6 overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(78,222,163,0.05)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4edea3]/50 to-transparent" />
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-[#facc15]/80 via-[#4edea3]/50 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#facc15]/10 border border-[#facc15]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#facc15] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#facc15]/70 tracking-widest uppercase">
            Araştır Yolu
          </span>
        </div>

        <ul className="flex flex-col gap-4">
          {NEW_WAY.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#4edea3] text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-['Inter'] text-sm text-[#c5c6cc] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
