'use client'

import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

const BEZIER = [0.22, 1, 0.36, 1] as [number, number, number, number]

type PlanConfig = {
  tier: string
  label: string
  price: string
  tokens: string
  badge?: string
  highlight?: boolean
  features: string[]
  ctaText: string
}

const PLANS: PlanConfig[] = [
  {
    tier: 'starter',
    label: 'Starter',
    price: '₺299',
    tokens: '30 araştırma / ay',
    features: [
      'BIST hisse araştırması',
      'KAP bildirimleri',
      'Haberler & sentiment',
      'PDF + PPTX rapor',
      'Dashboard erişimi',
    ],
    ctaText: 'Başla',
  },
  {
    tier: 'pro',
    label: 'Pro',
    price: '₺799',
    tokens: '100 araştırma / ay',
    badge: 'EN POPÜLER',
    highlight: true,
    features: [
      "Starter'ın tüm özellikleri",
      'Kripto & Altın & Döviz',
      'Öncelikli işleme kuyruğu',
      'Makro ekonomi analizleri',
      'Gelişmiş AI sentezi',
    ],
    ctaText: "Pro'ya Geç",
  },
  {
    tier: 'agency',
    label: 'Agency',
    price: '₺2,499',
    tokens: '500 araştırma / ay',
    features: [
      "Pro'nun tüm özellikleri",
      'JSON API erişimi',
      '5 takım koltuğu',
      'Öncelikli destek (< 4s)',
      'Özel raporlama şablonları',
    ],
    ctaText: 'Başla',
  },
]

export function PricingSection() {
  const { isSignedIn } = useUser()
  const ctaHref = isSignedIn
    ? '/dashboard/settings?tab=abonelik'
    : '/sign-up'

  return (
    <motion.section
      className="w-full"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: BEZIER }}
    >
      {/* Section header */}
      <div className="flex flex-col items-center gap-4 mb-12 text-center">
        <span className="font-['JetBrains_Mono'] text-[11px] text-[#22c55e]/60 tracking-[0.2em] uppercase">
          // Fiyatlandırma
        </span>
        <h2 className="font-['Montserrat'] font-black text-white text-3xl md:text-4xl">
          Araştırmanızı Güçlendirin
        </h2>
        <p className="font-['Inter'] text-[#64748b] text-sm max-w-md leading-relaxed">
          Her ölçekteki yatırımcı ve analist için esnek planlar. İstediğiniz zaman yükseltin veya iptal edin.
        </p>
      </div>

      {/* 3 tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: BEZIER, delay: index * 0.1 }}
            className={`relative flex flex-col rounded-xl border bg-[#080808] p-6 ${
              plan.highlight
                ? 'border-[#facc15]/40 shadow-[0_0_32px_0_rgba(250,204,21,0.08)]'
                : 'border-[#1a1a1b]'
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="font-['JetBrains_Mono'] text-[10px] font-bold tracking-widest bg-[#facc15] text-[#0a0a0a] px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Tier name */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Montserrat'] font-black text-white text-lg">
                {plan.label}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-1.5 mb-2">
              <span className="font-['Montserrat'] font-black text-4xl text-white leading-none">
                {plan.price}
              </span>
              <span className="font-['Inter'] text-[#64748b] text-sm mb-0.5">/ay</span>
            </div>

            {/* Token count */}
            <span className="font-['JetBrains_Mono'] text-[13px] text-[#22c55e] mb-6">
              {plan.tokens}
            </span>

            {/* Feature list */}
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span
                    className="material-symbols-outlined text-[#22c55e] text-base mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
                  >
                    check
                  </span>
                  <span className="font-['Inter'] text-sm text-[#c5c6cc] leading-snug">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA button */}
            <Link
              href={ctaHref}
              className={`w-full text-center font-['Montserrat'] font-bold text-sm py-3 px-4 rounded-lg transition-all duration-200 active:scale-95 ${
                plan.highlight
                  ? 'bg-[#facc15] text-[#0a0a0a] hover:bg-[#fde047]'
                  : 'border border-[#22c55e]/30 text-white hover:bg-[#22c55e]/10'
              }`}
            >
              {plan.ctaText}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Enterprise row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: BEZIER, delay: 0.3 }}
        className="w-full rounded-xl border border-[#22c55e]/20 bg-gradient-to-r from-[#0a0a0a] to-[#080808] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="font-['Montserrat'] font-black text-white text-xl">
              Enterprise · Kurumsal
            </span>
            <span className="font-['JetBrains_Mono'] text-[9px] tracking-widest border border-[#22c55e]/30 text-[#22c55e]/70 rounded px-2 py-0.5 bg-[#22c55e]/5">
              KURUMSAL
            </span>
          </div>
          <p className="font-['Inter'] text-[#64748b] text-sm max-w-lg leading-relaxed">
            Ekibiniz için özel fiyatlandırma ve SLA garanti. Sınırsız araştırma, adanmış destek ekibi, özel entegrasyonlar ve kurumsal güvenlik.
          </p>
          <div className="flex flex-wrap gap-4 mt-1">
            {['Sınırsız araştırma', 'SLA garantisi', 'Özel entegrasyonlar', 'Adanmış destek ekibi'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 font-['Inter'] text-xs text-[#45474c]">
                <span
                  className="material-symbols-outlined text-[#22c55e]/60 text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <a
          href="mailto:iletisim@arastir.com"
          className="shrink-0 font-['Montserrat'] font-bold text-sm py-3 px-6 rounded-lg border border-[#22c55e]/30 text-white hover:bg-[#22c55e]/10 transition-all duration-200 active:scale-95 whitespace-nowrap"
        >
          Bizimle İletişime Geçin
        </a>
      </motion.div>
    </motion.section>
  )
}
