"use client";
/* eslint-disable @next/next/no-img-element */
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';

const LandingPage = () => {
  return (
    <>
      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-md dark:bg-surface/80 text-secondary dark:text-secondary fixed top-0 w-full z-50 border-b border-outline-variant/20 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center px-margin-desktop md:px-margin-desktop px-margin-mobile h-20 max-w-container-max mx-auto">
          <div className="flex items-center gap-2 font-title-md text-title-md font-bold text-secondary dark:text-secondary">
            <img
              alt="Araştır Logo"
              className="h-8 w-auto rounded"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2azPTK854GQ_vYz97gBR2eeYPNHUQCtAtif9RqkQTczbxdakFRU39vtqvF8fzZNt_46E4ShpGGFgCoq7rjyxBa6ZUihZOXl68th8NpuX8rl7cENbLwMVSjLWINWhOhUfaAqUMShOxpuewmEzCJFsdi7LwX-lcHRwrrPdSEYl_59OTmbVIvy3hWINrtlIwwH9zp2cVHUHVyXFa9asEIWNGx9_xk3lMkXHptG18WEmsxf64AAPihrOh77NBWhkizCcQbP7O3A3qQ8E"
            />
          </div>
          <nav className="hidden md:flex gap-8">
            <a
              className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm text-label-sm"
              href="#"
            >
              Features
            </a>
            <a
              className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm text-label-sm"
              href="#"
            >
              How it Works
            </a>
            <a
              className="text-on-surface-variant hover:text-secondary transition-colors font-label-sm text-label-sm"
              href="#"
            >
              Pricing
            </a>
          </nav>
          <div className="hidden md:block">
            <SignedOut>
              <Link href="/sign-in" className="bg-secondary text-on-secondary font-title-md text-label-sm py-2 px-4 rounded hover:opacity-80 transition-all duration-300 active:scale-95 glow-hover">
                Demo Başlat
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
          <button className="md:hidden text-on-surface-variant hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 flex flex-col gap-24">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center text-center py-24 gap-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background blur-3xl opacity-50"></div>
          <h1 className="font-display-lg text-display-lg text-on-surface max-w-4xl">
            Piyasa Araştırmasında 2 Saati <span className="text-secondary">10 Dakikaya</span> İndirin
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Search, Validation, Analysis ve Report aşamalarından oluşan 4 aşamalı AI pipeline.
          </p>
          <div className="flex gap-4 mt-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="bg-secondary text-on-secondary font-title-md text-title-md py-3 px-8 rounded-lg hover:opacity-80 transition-all duration-300 active:scale-95 glow-hover shadow-lg shadow-secondary/20"
              >
                Demo Başlat
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-secondary text-on-secondary font-title-md text-title-md py-3 px-8 rounded-lg hover:opacity-80 transition-all duration-300 active:scale-95 glow-hover shadow-lg shadow-secondary/20"
              >
                Dashboard
              </Link>
            </SignedIn>
          </div>
        </section>
        {/* Comparison Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Eski Yöntem */}
          <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/30 flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-error/50"></div>
            <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/20 pb-4">
              Eski Yöntem
            </h3>
            <ul className="flex flex-col gap-4 text-on-surface-variant font-body-md">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-xl">close</span>
                Manual and slow data gathering.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-xl">close</span>
                Scattered sources, high risk of bias.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-xl">close</span>
                Hours spent compiling basic reports.
              </li>
            </ul>
          </div>
          {/* Araştır Yolu */}
          <div className="bg-surface-container p-8 rounded-xl border border-secondary/30 flex flex-col gap-6 relative overflow-hidden glow-ambient">
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
            <h3 className="font-title-md text-title-md text-secondary border-b border-outline-variant/20 pb-4">
              Araştır Yolu
            </h3>
            <ul className="flex flex-col gap-4 text-on-surface font-body-md">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                Automated, continuous data extraction.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                8+ validated premium sources analyzed instantly.
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                98% accuracy in synthesis and reporting.
              </li>
            </ul>
          </div>
        </section>
        {/* How it Works (4 Agents) */}
        <section className="flex flex-col gap-12 pt-12">
          <div className="text-center flex flex-col gap-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Intelligence Pipeline</h2>
            <p className="font-body-md text-on-surface-variant">
              The 4-stage autonomous architecture driving our market synthesis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Agent 1 */}
            <div className="bg-surface-container-high p-6 rounded-lg border border-outline-variant/20 hover:border-secondary/50 transition-colors duration-300 flex flex-col gap-4">
              <div className="bg-primary-container w-12 h-12 rounded flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  travel_explore
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface">Arama</h4>
              <p className="font-body-md text-label-sm text-on-surface-variant">
                Rapid traversal of global databases to extract preliminary signals.
              </p>
            </div>
            {/* Agent 2 */}
            <div className="bg-surface-container-high p-6 rounded-lg border border-outline-variant/20 hover:border-secondary/50 transition-colors duration-300 flex flex-col gap-4">
              <div className="bg-primary-container w-12 h-12 rounded flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  fact_check
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface">Doğrulama</h4>
              <p className="font-body-md text-label-sm text-on-surface-variant">
                Cross-referencing claims against authoritative benchmarks to ensure integrity.
              </p>
            </div>
            {/* Agent 3 */}
            <div className="bg-surface-container-high p-6 rounded-lg border border-outline-variant/20 hover:border-secondary/50 transition-colors duration-300 flex flex-col gap-4 relative">
              <div className="absolute left-0 top-6 w-1 h-8 bg-secondary rounded-r"></div>
              <div className="bg-primary-container w-12 h-12 rounded flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  analytics
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface">Analist</h4>
              <p className="font-body-md text-label-sm text-on-surface-variant">
                Synthesizing verified data points into actionable insights and trends.
              </p>
            </div>
            {/* Agent 4 */}
            <div className="bg-surface-container-high p-6 rounded-lg border border-outline-variant/20 hover:border-secondary/50 transition-colors duration-300 flex flex-col gap-4">
              <div className="bg-primary-container w-12 h-12 rounded flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  edit_document
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface">Yazar</h4>
              <p className="font-body-md text-label-sm text-on-surface-variant">
                Formatting the synthesized intelligence into institutional-grade reports.
              </p>
            </div>
          </div>
        </section>
        {/* Previews */}
        <section className="flex flex-col gap-12 pt-12">
          <div className="text-center flex flex-col gap-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Output Fidelity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60 z-10"></div>
              <img
                alt="PDF Mockup"
                className="w-full h-full object-cover opacity-50 blur-[2px] transition-all duration-500 group-hover:blur-0 group-hover:opacity-80"
                data-alt="A stylized, high-contrast, blurred representation of a professional financial PDF report viewed on a dark screen. The document features abstract data visualizations in emerald green against a deep navy background. The aesthetic is modern, institutional-grade, and sleek, evoking a high-end fintech terminal light-mode aesthetic but adapted for dark mode. Soft ambient glow indicates high stakes and technological mastery."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx6U4rWlzlg4Q7NE5ZM3Odt5w_JEy-pC5_FIPf4XBKW4Svx1MkV3Wq-84bNItRzcSS8wmcztCbMClVRbW68nSmkv7NsCU7sxQed9bItfIXMEzZguEK60V409k0oNcecuG_z3qmqc1uU0_CfJBodwsxhmZWaLo9Kpq70mcQp6f9-9T9nPZhLlTdVHAc1i-DU32GZSjk6GiaiW3t9S3ZC3xz5qA9AiSTJmYm9USk4xoMIKZpcgaKdy2g3fnY1Mwj5uNlmKuITFPcfrQ"
              />
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">picture_as_pdf</span>
                <span className="font-title-md text-on-surface">Executive PDF Summary</span>
              </div>
            </div>
            <div className="relative group rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60 z-10"></div>
              <img
                alt="PPTX Mockup"
                className="w-full h-full object-cover opacity-50 blur-[2px] transition-all duration-500 group-hover:blur-0 group-hover:opacity-80"
                data-alt="A sleek, blurred mockup of a professional presentation slide deck (PPTX format) displayed on a dark background. The slides showcase minimalist abstract charts, sparklines, and text blocks utilizing an emerald green and slate gray palette. The lighting is dramatic and moody, reflecting a sophisticated, AI-driven market research tool tailored for enterprise analysts and venture capitalists."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIVzpGphAr0SNcTZGV05PgLBFFTqB_ftUlmXYNXRr9T0IgPE_QX0BrWZOcXWS83vL2aJlN-H7uQM0lndjNvvOJB3HjWRYx9LawHreHeASHNS8evA-8yR2kfrx_vNuPDzA5uFpJU7fmCrZh-7jNJUS7RJRpkKirNfLPXDECgpzjNyLXwrEnvWWXGx8XRnzFbUn4fE9D4sTtPaQ3ZDtVPfJiWDg9CB2WmQkgJUOR0eVtDPPnmaS0ebg0RDX2Hav7zsGWt2no-_89sXI"
              />
              <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">slideshow</span>
                <span className="font-title-md text-on-surface">Presentation Deck</span>
              </div>
            </div>
          </div>
        </section>
        {/* Signup Form */}
        <section className="max-w-2xl mx-auto w-full bg-surface-container p-8 md:p-12 rounded-xl border border-outline-variant/20 relative overflow-hidden mt-12 mb-24">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col gap-6 text-center mb-8">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Secure Early Access</h2>
            <p className="font-body-md text-on-surface-variant">
              Tailored for BIST investors and SMEs requiring rapid synthesis.
            </p>
          </div>
          <form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
                htmlFor="email"
              >
                Corporate Email
              </label>
              <input
                className="bg-primary-container border-b border-outline-variant/50 border-0 focus:ring-0 focus:border-secondary text-on-surface p-3 transition-colors duration-200 outline-none w-full"
                id="email"
                placeholder="analyst@firm.com"
                type="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
                htmlFor="role"
              >
                Primary Role
              </label>
              <select
                className="bg-primary-container border-b border-outline-variant/50 border-0 focus:ring-0 focus:border-secondary text-on-surface p-3 transition-colors duration-200 outline-none w-full appearance-none"
                id="role"
              >
                <option value="bist">BIST Investor</option>
                <option value="sme">SME Executive</option>
                <option value="analyst">Market Analyst</option>
              </select>
            </div>
            <button
              className="bg-secondary text-on-secondary font-title-md text-title-md py-4 px-6 rounded-lg mt-4 hover:opacity-90 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(78,222,163,0.2)]"
              type="submit"
            >
              Request Access
            </button>
          </form>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-container-lowest text-secondary dark:text-secondary w-full py-12 border-t border-outline-variant/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <span className="font-title-md text-title-md font-bold text-secondary dark:text-secondary">
              Araştır
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              © 2024 Araştır. Intelligence-driven market synthesis.
            </p>
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              LinkedIn
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Twitter
            </a>
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Terms of Service
            </a>
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <a
              className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
              href="#"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
