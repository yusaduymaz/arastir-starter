import React from "react";
import { DataSourceCard } from "@/components/dashboard/DataSourceCard";

export const metadata = {
  title: "Veri Kaynakları | Araştır Terminal",
  description: "Aktif veri kaynakları durumu",
};

const categories = [
  {
    label: "// TÜRK PİYASA VERİLERİ_",
    sources: [
      { name: "KAP", status: "active" as const, description: "Kamuyu Aydınlatma Platformu anlık bildirimleri ve finansal raporlar." },
      { name: "TCMB", status: "active" as const, description: "Merkez Bankası kur, faiz ve makroekonomik veriler (EVDS API)." },
      { name: "Turkey Financial Data", status: "active" as const, description: "BIST hisse senetleri, endeksler ve Türkiye piyasa verileri (RapidAPI)." },
      { name: "Harem Altın", status: "active" as const, description: "Türkiye altın fiyatları — gram, çeyrek, yarım ve tam altın (RapidAPI)." },
      { name: "Turkey News Live", status: "active" as const, description: "Türkiye ekonomi ve finans haberleri akışı (RapidAPI)." },
    ],
  },
  {
    label: "// KÜRESEL PİYASA VERİLERİ_",
    sources: [
      { name: "Yahoo Finance (YH)", status: "active" as const, description: "Yahoo Finance hisse senedi fiyatları, hacim ve temel göstergeler (RapidAPI)." },
      { name: "Yahoo Finance Real-Time", status: "active" as const, description: "Yahoo Finance gerçek zamanlı fiyat güncellemeleri (RapidAPI)." },
      { name: "Real-time Finance Data", status: "active" as const, description: "Hisse senedi ve borsa verileri için gerçek zamanlı finans feed'i (RapidAPI)." },
      { name: "Finance API", status: "active" as const, description: "Genel finans ve hisse senedi analiz verileri (RapidAPI)." },
      { name: "Exchange Rates", status: "active" as const, description: "Anlık döviz kur çevrimi ve tarihsel kur verileri (RapidAPI)." },
    ],
  },
  {
    label: "// KRİPTO & FOREX_",
    sources: [
      { name: "Crypto News", status: "active" as const, description: "Kripto para haberleri, duyurular ve piyasa güncellemeleri (RapidAPI)." },
      { name: "Crypto RSI (Trading Indicators)", status: "active" as const, description: "RSI tabanlı kripto para teknik analiz göstergeleri (RapidAPI)." },
      { name: "Forex API", status: "active" as const, description: "FX döviz çiftleri, spot fiyatlar ve parite verileri (RapidAPI)." },
    ],
  },
  {
    label: "// HABER KAYNAKLARI_",
    sources: [
      { name: "CNBC", status: "active" as const, description: "CNBC küresel iş dünyası ve finans haber akışı (RapidAPI)." },
      { name: "Bloomberg HT", status: "active" as const, description: "Türkiye finansal haberleri ve piyasa yorumları." },
      { name: "Reuters", status: "active" as const, description: "Küresel piyasa verileri ve makroekonomik haberler." },
    ],
  },
];

export default function DataSourcesPage() {
  const totalSources = categories.reduce((acc, cat) => acc + cat.sources.length, 0);

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="mb-8 relative z-10">
        <h1 className="text-white text-2xl font-bold font-['Montserrat'] tracking-tight mb-2">
          Sistem Durumu
        </h1>
        <p className="text-[#64748b] text-sm font-['Inter']">
          Bağlı veri API'leri ve scraping modüllerinin operasyonel durumu.{" "}
          <span className="text-[#22c55e]/60 font-['JetBrains_Mono'] text-xs">
            {totalSources} KAYNAK AKTIF
          </span>
        </p>
      </div>

      <div className="space-y-10 blur-fade blur-fade-d1">
        {categories.map((category) => (
          <section key={category.label}>
            <h2 className="font-['JetBrains_Mono'] text-sm text-[#22c55e]/80 uppercase mb-4">
              {category.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.sources.map((source) => (
                <DataSourceCard
                  key={source.name}
                  name={source.name}
                  status={source.status}
                  description={source.description}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Decorative terminal artifacts */}
      <div className="fixed bottom-8 right-8 z-0 pointer-events-none opacity-20">
        <pre className="font-['JetBrains_Mono'] text-[8px] text-[#22c55e] text-right">
          {`SYS.SOURCES.LINKED\n`}
          {`TOTAL: ${totalSources}_ACTIVE\n`}
          {`PONG: 12ms\n`}
          {'...'}
        </pre>
      </div>
    </div>
  );
}
