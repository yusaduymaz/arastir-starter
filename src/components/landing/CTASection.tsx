'use client'

import { motion } from 'framer-motion'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'

const BEZIER = [0.22, 1, 0.36, 1] as [number, number, number, number]

const ROLES = [
  { value: 'bist', label: 'BIST Yatırımcısı' },
  { value: 'sme', label: 'KOBİ Yöneticisi' },
  { value: 'analyst', label: 'Piyasa Analisti' },
  { value: 'vc', label: 'Girişim Sermayecisi' },
]

export function CTASection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <motion.section
      className="max-w-2xl mx-auto w-full"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: BEZIER }}
    >
      <div className="neon-gradient-card">
        <div className="neon-card-inner bg-[#080808] p-8 md:p-12 relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#facc15]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#4edea3]/4 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 text-center mb-8 relative z-10">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#facc15]/60 tracking-[0.2em] uppercase mx-auto">
              // Erken Erişim
            </span>
            <h2 className="font-['Montserrat'] text-3xl md:text-4xl font-black text-white">
              Erken Erişim Talep Et
            </h2>
            <p className="font-['Inter'] text-[#8c8c94] leading-relaxed">
              BIST yatırımcıları ve hızlı sentez gerektiren KOBİ'ler için tasarlandı.
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[#4edea3]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <p className="font-['Montserrat'] font-bold text-white text-lg">Talebiniz Alındı</p>
              <p className="font-['Inter'] text-[#64748b] text-sm text-center">
                24 saat içinde kurumsal e-postanıza erişim bilgilerini göndereceğiz.
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-5 relative z-10" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] uppercase tracking-widest" htmlFor="cta-email">
                  Kurumsal E-posta
                </label>
                <input
                  id="cta-email"
                  type="email"
                  required
                  placeholder="analyst@firma.com"
                  className="bg-[#0d0d0e] border border-[#1a1a1b] focus:border-[#facc15]/50 text-white placeholder-[#45474c] p-3.5 rounded-lg outline-none transition-colors duration-200 font-['Inter'] text-sm focus:shadow-[0_0_0_1px_rgba(250,204,21,0.2)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] uppercase tracking-widest" htmlFor="cta-role">
                  Birincil Rol
                </label>
                <select
                  id="cta-role"
                  className="bg-[#0d0d0e] border border-[#1a1a1b] focus:border-[#facc15]/50 text-[#c5c6cc] p-3.5 rounded-lg outline-none transition-colors duration-200 font-['Inter'] text-sm appearance-none"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="pulse-btn relative overflow-hidden bg-[#facc15] text-[#0a0a0a] font-['Montserrat'] font-black text-sm py-4 px-6 rounded-lg mt-2 hover:bg-[#fde047] transition-all duration-300 active:scale-95 group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Erişim Talep Et
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-200">
                    arrow_forward
                  </span>
                </span>
              </button>

              <p className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] text-center tracking-wider">
                Spam göndermiyoruz · KVKK uyumlu · İstediğiniz zaman çıkın
              </p>
            </form>
          )}

          {/* Quick login */}
          <div className="mt-6 pt-6 border-t border-[#1a1a1b] flex items-center justify-center gap-3 relative z-10">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c]">
              Hesabınız var mı?
            </span>
            <SignedOut>
              <Link
                href="/sign-in"
                className="font-['JetBrains_Mono'] text-[11px] text-[#facc15]/80 hover:text-[#facc15] transition-colors underline underline-offset-2"
              >
                Giriş Yap →
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="font-['JetBrains_Mono'] text-[11px] text-[#facc15]/80 hover:text-[#facc15] transition-colors underline underline-offset-2"
              >
                Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
