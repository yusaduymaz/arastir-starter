/* eslint-disable @next/next/no-img-element */
import { UserButton } from "@clerk/nextjs";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden flex font-body-md mesh-bg">
      {/* SideNavBar Shared Component */}
      <div className="relative flex h-full flex-col bg-surface-container border-r border-outline-variant w-64 shrink-0 group/design-root z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            {/* Brand Profile */}
            <div className="flex gap-3 items-center pt-2">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 border border-outline-variant"
                data-alt="A minimalist avatar profile picture placeholder with a sleek dark navy background and subtle emerald green abstract geometric accents, fitting a high-contrast fintech aesthetic."
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA616cLGnPP6b8F5VUqZ6c3FRckhW2Ke9G0iHNP4LR4niKDclMo_Wz0Bc92hl03AfQ7a9N8BciAIFSsi_J4R2b5wymQTZVm0kYegX8phrRuMoLa8zOvQaEXyVlzKTXNEnO8uwxB2HP6MrwIpoOP3BlB8TMu4rEfYUt-hjw1OgW6wqr7mcxRNvygEXGqD0QQqfXxCc0l-_rcjUMhn7w7i1dKAENEIipP73eZ7D9YD4NgOrtOHyDjclScSsKYU8aeR7ip-aTB4uDeEuI")',
                }}
              ></div>
              <div className="flex flex-col">
                <h1 className="text-on-surface font-headline text-title-md tracking-tight">
                  Araştır
                </h1>
                <p className="text-on-surface-variant font-label-sm uppercase tracking-wider">
                  Dashboard
                </p>
              </div>
            </div>
            {/* Navigation Links */}
            <div className="flex flex-col gap-2">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded bg-surface-variant/50 text-secondary border-l-2 border-secondary shadow-[inset_40px_0_40px_-40px_rgba(78,222,163,0.1)] transition-colors"
                href="#"
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add
                </span>
                <p className="font-body-md font-semibold">Yeni Araştırma</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface transition-colors border-l-2 border-transparent"
                href="#"
              >
                <span className="material-symbols-outlined text-[24px]">
                  description
                </span>
                <p className="font-body-md">Raporlarım</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface transition-colors border-l-2 border-transparent"
                href="#"
              >
                <span className="material-symbols-outlined text-[24px]">
                  database
                </span>
                <p className="font-body-md">Veri Kaynakları</p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface transition-colors border-l-2 border-transparent"
                href="#"
              >
                <span className="material-symbols-outlined text-[24px]">
                  settings
                </span>
                <p className="font-body-md">Ayarlar</p>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Ambient Glow Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-secondary opacity-5 blur-[100px]"></div>
        </div>
        {/* TopBar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-outline-variant bg-surface-container/80 backdrop-blur-md px-margin-desktop py-4 z-10">
          <div className="flex items-center gap-4 text-on-surface">
            <h2 className="font-headline text-headline-lg-mobile tracking-tight">
              Genel Bakış
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <label className="flex flex-col min-w-64 h-10">
              <div className="flex w-full flex-1 items-stretch rounded h-full bg-primary-container border border-outline-variant focus-within:border-secondary focus-within:shadow-[0_0_15px_rgba(78,222,163,0.2)] transition-all">
                <div className="text-on-surface-variant flex items-center justify-center pl-3 pr-2">
                  <span className="material-symbols-outlined text-[20px]">
                    search
                  </span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 bg-transparent text-on-surface border-none focus:ring-0 h-full placeholder:text-on-surface-variant px-2 font-body-md"
                  placeholder="Araştır..."
                />
              </div>
            </label>
            {/* Quick Start Button */}
            <button className="bg-secondary text-primary-container px-6 py-2 rounded h-10 font-headline font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(78,222,163,0.3)] hover:shadow-[0_0_25px_rgba(78,222,163,0.5)] transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                play_arrow
              </span>
              YENİ ARAŞTIRMA BAŞLAT
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
