import React from "react";
import { DataSourceCard } from "@/components/dashboard/DataSourceCard";

export const metadata = {
  title: "Veri Kaynakları | Araştır Terminal",
  description: "Aktif veri kaynakları durumu",
};

export default function DataSourcesPage() {
  const sources = [
    { name: "KAP", status: "active" as const, description: "Kamuyu Aydınlatma Platformu anlık bildirimleri ve finansal raporlar." },
    { name: "TCMB", status: "active" as const, description: "Merkez Bankası kur ve faiz oranları." },
    { name: "Bloomberg HT", status: "active" as const, description: "Finansal haberler ve piyasa yorumları." },
    { name: "Reuters", status: "active" as const, description: "Küresel piyasa verileri ve makroekonomik haberler." }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      <div className="mb-8 relative z-10">
        <h1 className="text-white text-2xl font-bold font-['Montserrat'] tracking-tight mb-2">
          Sistem Durumu
        </h1>
        <p className="text-[#64748b] text-sm font-['Inter']">
          Bağlı veri API'leri ve scraping modüllerinin operasyonel durumu.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-['JetBrains_Mono'] text-lg text-[#22c55e]/80 uppercase">// VERİ KAYNAKLARI_</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 blur-fade blur-fade-d1">
        {sources.map(source => (
          <DataSourceCard
            key={source.name}
            name={source.name}
            status={source.status}
            description={source.description}
          />
        ))}
      </div>

      {/* Decorative terminal artifacts */}
      <div className="fixed bottom-8 right-8 z-0 pointer-events-none opacity-20">
        <pre className="font-['JetBrains_Mono'] text-[8px] text-[#22c55e] text-right">
          {'SYS.SOURCES.LINKED\n'}
          {'STATUS: ALL_GREEN\n'}
          {'PONG: 12ms\n'}
          {'...'}
        </pre>
      </div>
    </div>
  );
}
