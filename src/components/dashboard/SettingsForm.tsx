"use client";

import React, { useState } from "react";
import { UserSettings } from "@/types/saas";

export function SettingsForm({ initialSettings }: { initialSettings?: Partial<UserSettings> }) {
  const [theme, setTheme] = useState(initialSettings?.theme || "dark");
  const [emailNotif, setEmailNotif] = useState(initialSettings?.notifications?.email ?? true);
  const [pushNotif, setPushNotif] = useState(initialSettings?.notifications?.push ?? false);
  const [reportLang, setReportLang] = useState(initialSettings?.report_preferences?.language || "tr");
  const [reportFormat, setReportFormat] = useState(initialSettings?.report_preferences?.default_format || "both");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate server action delay
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-3xl relative z-10">
      
      {/* Theme Settings */}
      <section className="p-6 rounded-lg border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <span className="material-symbols-outlined text-[#22c55e]">palette</span>
          <h2 className="text-white font-['Montserrat'] font-bold text-sm tracking-wide uppercase">Görünüm</h2>
        </div>
        
        <div className="flex gap-4">
          {["dark", "light", "system"].map((t) => (
            <label key={t} className={`flex-1 cursor-pointer flex flex-col items-center gap-3 p-4 rounded border ${theme === t ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-white/10 hover:border-white/20'}`}>
              <input 
                type="radio" 
                name="theme" 
                value={t} 
                checked={theme === t}
                onChange={(e) => setTheme(e.target.value as any)}
                className="hidden" 
              />
              <span className="material-symbols-outlined text-2xl text-[#64748b]">
                {t === "dark" ? "dark_mode" : t === "light" ? "light_mode" : "devices"}
              </span>
              <span className="text-xs font-['Inter'] text-white/80 capitalize">{t === "dark" ? "Karanlık" : t === "light" ? "Aydınlık" : "Sistem"}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Report Preferences */}
      <section className="p-6 rounded-lg border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <span className="material-symbols-outlined text-[#22c55e]">description</span>
          <h2 className="text-white font-['Montserrat'] font-bold text-sm tracking-wide uppercase">Rapor Tercihleri</h2>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-white text-sm font-['Inter']">Varsayılan Rapor Dili</span>
            <div className="flex gap-4">
              {[
                { id: "tr", label: "Türkçe", icon: "translate" },
                { id: "en", label: "İngilizce", icon: "language" }
              ].map((lang) => (
                <label key={lang.id} className={`flex items-center gap-2 p-3 rounded border cursor-pointer ${reportLang === lang.id ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-white/10 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="reportLang" 
                    value={lang.id} 
                    checked={reportLang === lang.id}
                    onChange={(e) => setReportLang(e.target.value as "tr" | "en")}
                    className="hidden" 
                  />
                  <span className="material-symbols-outlined text-[18px] text-[#64748b]">{lang.icon}</span>
                  <span className="text-xs font-['Inter'] text-white/80">{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-white text-sm font-['Inter']">Varsayılan Çıktı Formatı</span>
            <div className="flex gap-4">
              {[
                { id: "pdf", label: "Sadece PDF", icon: "picture_as_pdf" },
                { id: "pptx", label: "Sadece PPTX", icon: "co_present" },
                { id: "both", label: "Her İkisi (PDF + PPTX)", icon: "library_books" }
              ].map((fmt) => (
                <label key={fmt.id} className={`flex items-center gap-2 p-3 rounded border cursor-pointer ${reportFormat === fmt.id ? 'border-[#22c55e] bg-[#22c55e]/10' : 'border-white/10 hover:border-white/20'}`}>
                  <input 
                    type="radio" 
                    name="reportFormat" 
                    value={fmt.id} 
                    checked={reportFormat === fmt.id}
                    onChange={(e) => setReportFormat(e.target.value as "pdf" | "pptx" | "both")}
                    className="hidden" 
                  />
                  <span className="material-symbols-outlined text-[18px] text-[#64748b]">{fmt.icon}</span>
                  <span className="text-xs font-['Inter'] text-white/80">{fmt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="p-6 rounded-lg border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <span className="material-symbols-outlined text-[#22c55e]">notifications</span>
          <h2 className="text-white font-['Montserrat'] font-bold text-sm tracking-wide uppercase">Bildirimler</h2>
        </div>
        
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between p-3 rounded hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex flex-col">
              <span className="text-white text-sm font-['Inter']">E-posta Bildirimleri</span>
              <span className="text-[#64748b] text-xs font-['Inter']">Raporlar tamamlandığında e-posta al</span>
            </div>
            <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} className="accent-[#22c55e] w-4 h-4" />
          </label>
          
          <label className="flex items-center justify-between p-3 rounded hover:bg-white/5 cursor-pointer transition-colors">
            <div className="flex flex-col">
              <span className="text-white text-sm font-['Inter']">Push Bildirimleri</span>
              <span className="text-[#64748b] text-xs font-['Inter']">Tarayıcı üzerinden anlık bildirim al</span>
            </div>
            <input type="checkbox" checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} className="accent-[#22c55e] w-4 h-4" />
          </label>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-[#22c55e] text-black font-['Montserrat'] font-bold text-sm px-6 py-2.5 rounded hover:bg-[#22c55e]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
              KAYDEDİLİYOR...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">save</span>
              AYARLARI KAYDET
            </>
          )}
        </button>
      </div>

    </form>
  );
}
