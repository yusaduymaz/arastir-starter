"use client";

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsBar } from '@/components/landing/StatsBar';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PipelineSection } from '@/components/landing/PipelineSection';
import { OutputSection } from '@/components/landing/OutputSection';
import { CTASection } from '@/components/landing/CTASection';
import { PricingSection } from '@/components/landing/PricingSection';

const NAV_LINKS = [
  { href: '#pipeline', label: 'Özellikler' },
  { href: '#pipeline', label: 'Nasıl Çalışır' },
  { href: '#pricing', label: 'Fiyatlandırma' },
]

export default function LandingPage() {
  return (
    <>
      {/* ─── Header ─── */}
      <header className="fixed top-0 w-full z-50 border-b border-[#1a1a1b] bg-[#080808]/85 backdrop-blur-md">
        <div className="flex justify-between items-center px-4 md:px-12 h-16 max-w-[1440px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#facc15] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0a0a0a] text-sm font-black" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                psychology
              </span>
            </div>
            <span className="font-['Montserrat'] font-black text-white text-base tracking-tight">
              Araştır
            </span>
            <span className="hidden md:inline font-['JetBrains_Mono'] text-[9px] text-[#45474c] border border-[#22c55e]/20 rounded px-1.5 py-0.5 bg-[#22c55e]/5 text-[#22c55e]/60 tracking-widest ml-1">
              BETA
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-['Inter'] text-sm text-[#64748b] hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/sign-in"
                className="hidden md:inline font-['Inter'] text-sm text-[#64748b] hover:text-white transition-colors"
              >
                Giriş
              </Link>
              <Link
                href="/sign-in"
                className="shiny-btn bg-[#facc15] text-[#0a0a0a] font-['Montserrat'] font-bold text-xs py-2 px-4 rounded-lg hover:bg-[#fde047] transition-all duration-300 active:scale-95"
              >
                Demo Başlat
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-[#facc15] text-[#0a0a0a] font-['Montserrat'] font-bold text-xs py-2 px-5 rounded-lg hover:bg-[#fde047] transition-all duration-300 active:scale-95 whitespace-nowrap shrink-0"
              >
                Dashboard&apos;a Git
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-12 flex flex-col gap-28 pt-28 pb-24">
        <HeroSection />
        <StatsBar />
        <ComparisonSection />
        <PipelineSection />
        <OutputSection />
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="cta">
          <CTASection />
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1a1a1b] bg-[#080808]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#facc15] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0a0a0a] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
              </div>
              <span className="font-['Montserrat'] font-black text-white text-sm">Araştır</span>
            </div>
            <p className="font-['Inter'] text-sm text-[#45474c] leading-relaxed max-w-xs">
              AI destekli kurumsal piyasa araştırma platformu. BIST, KAP ve TCMB verilerini saniyeler içinde analiz edin.
            </p>
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#2a2a2b]">
              © 2025 Araştır. Tüm hakları saklıdır.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] tracking-widest uppercase">
              Ürün
            </span>
            {['Özellikler', 'Fiyatlandırma', 'Changelog', 'Yol Haritası'].map((item) => (
              <a key={item} href="#" className="font-['Inter'] text-sm text-[#45474c] hover:text-[#c5c6cc] transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474c] tracking-widest uppercase">
              Şirket
            </span>
            {['Hakkında', 'Gizlilik', 'Kullanım Koşulları', 'İletişim'].map((item) => (
              <a key={item} href="#" className="font-['Inter'] text-sm text-[#45474c] hover:text-[#c5c6cc] transition-colors duration-200">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
