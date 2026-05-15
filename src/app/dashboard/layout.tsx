/* eslint-disable @next/next/no-img-element */
import { UserButton } from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import { TokenDisplay } from "@/components/dashboard/TokenDisplay";

const NAV_ITEMS = [
  { href: '/dashboard',         icon: 'add',         label: 'Yeni Araştırma', active: true  },
  { href: '/dashboard/history', icon: 'description',  label: 'Raporlarım',     active: false },
  { href: '#',                  icon: 'database',     label: 'Veri Kaynakları',active: false },
  { href: '#',                  icon: 'settings',     label: 'Ayarlar',        active: false },
]

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-black text-on-surface h-screen overflow-hidden flex font-body-md mesh-bg">

      {/* ── Sidebar ── */}
      <aside className="relative flex h-full flex-col bg-[#050505] border-r border-[#22c55e]/12 w-60 shrink-0 z-10 shadow-[4px_0_32px_rgba(0,0,0,0.8)]">
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />

        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-7">

            {/* Brand */}
            <div className="flex gap-3 items-center pt-3 pb-1">
              <div className="relative flex items-center justify-center w-9 h-9 rounded bg-black border border-[#22c55e]/30 shadow-[0_0_16px_rgba(34,197,94,0.15)]">
                <span className="text-[#22c55e] text-lg font-bold font-['JetBrains_Mono']">A</span>
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#22c55e]">
                  <span className="status-ping absolute inset-0 rounded-full bg-[#22c55e] opacity-60" />
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-['Montserrat'] text-sm font-bold tracking-tight leading-tight">
                  ARAŞTIR
                </h1>
                <p className="text-[#22c55e]/60 font-['JetBrains_Mono'] text-[9px] uppercase tracking-[0.2em]">
                  Terminal v1.0
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group relative overflow-hidden ${
                    item.active
                      ? 'bg-[#22c55e]/08 border-l-2 border-[#facc15] text-white'
                      : 'border-l-2 border-transparent text-[#64748b] hover:text-[#c5c6cc] hover:bg-white/03'
                  }`}
                >
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#facc15]/05 to-transparent pointer-events-none" />
                  )}
                  <span
                    className={`material-symbols-outlined text-[20px] relative z-10 ${
                      item.active ? 'text-[#facc15]' : 'text-inherit'
                    }`}
                    style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="font-['Inter'] text-sm font-medium relative z-10">{item.label}</span>
                  {item.active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#facc15]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Data Sources chip */}
            <div className="border border-[#22c55e]/15 rounded p-3 flex flex-col gap-2">
              <p className="font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/50 uppercase tracking-widest">
                Aktif Kaynaklar
              </p>
              {['KAP', 'TCMB', 'Bloomberg', 'Reuters'].map((src) => (
                <div key={src} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b]">{src}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: user */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#22c55e]/10">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[#c5c6cc] font-medium">Kullanıcı</span>
              <span className="font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/60">● Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Ambient glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] right-[-5%] w-[35%] h-[35%] rounded-full bg-[#22c55e] opacity-[0.03] blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[25%] h-[25%] rounded-full bg-[#facc15] opacity-[0.02] blur-[100px]" />
        </div>

        {/* TopBar */}
        <header className="flex items-center justify-between border-b border-[#22c55e]/12 bg-[#050505]/90 backdrop-blur-md px-8 py-3 z-10 shrink-0">
          <div className="flex items-center gap-4">
            {/* Market status */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
              </span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e] tracking-widest uppercase">
                Piyasa Açık
              </span>
            </div>
            <span className="w-px h-4 bg-[#22c55e]/20" />
            <h2 className="font-['Montserrat'] text-white text-sm font-bold tracking-wide uppercase">
              Genel Bakış
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <TokenDisplay />
            <div className="w-px h-5 bg-[#22c55e]/15" />
            {/* Clock */}
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b] tracking-widest">
              {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
