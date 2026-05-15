import React from "react";
import { DataSourceCard } from "@/components/dashboard/DataSourceCard";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "Veri Kaynakları | Araştır Terminal",
  description: "Aktif ve entegre edilebilir veri kaynakları",
};

export default async function DataSourcesPage() {
  const { userId } = await auth();

  // In a real implementation, we would query the `user_settings` table 
  // to check if external_api_keys are valid, and perform a health check on public APIs.
  // For the UI implementation, we demonstrate the Terminal V1.0 states.
  const dataSources: React.ComponentProps<typeof DataSourceCard>[] = [
    {
      name: "KAP (Kamuyu Aydınlatma Platformu)",
      description: "Borsa İstanbul şirketlerinin resmi bildirimleri, finansal tabloları ve özel durum açıklamaları.",
      status: "connected",
      icon: "account_balance",
      lastSync: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      type: "public"
    },
    {
      name: "TCMB (Merkez Bankası)",
      description: "Güncel kurlar, faiz oranları ve makroekonomik istatistikler.",
      status: "syncing",
      icon: "currency_exchange",
      lastSync: "Şu an",
      type: "public"
    },
    {
      name: "TÜİK (Türkiye İstatistik Kurumu)",
      description: "Enflasyon verileri, sektörel endeksler ve demografik istatistikler.",
      status: "connected",
      icon: "bar_chart",
      lastSync: "Dün, 10:00",
      type: "public"
    },
    {
      name: "Bloomberg Terminal API",
      description: "Gerçek zamanlı küresel piyasa verileri, haberler ve analitik araçlar.",
      status: "disconnected",
      icon: "monitoring",
      lastSync: "-",
      type: "api"
    },
    {
      name: "NewsAPI",
      description: "Global ve yerel finansal haber akışı entegrasyonu.",
      status: "error",
      icon: "newspaper",
      lastSync: "API Key Hatalı",
      type: "api"
    },
    {
      name: "Currents API",
      description: "Güncel ve geçmiş haber makaleleri, finansal metin madenciliği.",
      status: "connected",
      icon: "article",
      lastSync: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      type: "api"
    },
    {
      name: "Alpha Vantage",
      description: "Gerçek zamanlı borsa, forex, kripto verileri ve temel finansal göstergeler.",
      status: "connected",
      icon: "show_chart",
      lastSync: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      type: "api"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      {/* Page Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-white text-2xl font-bold font-['Montserrat'] tracking-tight mb-2">
          Veri Kaynakları
        </h1>
        <p className="text-[#64748b] text-sm font-['Inter']">
          Araştırma raporlarında kullanılacak birincil ve ikincil veri kaynaklarının durumunu izleyin ve yönetin.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {dataSources.map((source, idx) => (
          <DataSourceCard key={idx} {...source} />
        ))}
      </div>
      
      {/* Decorative terminal artifacts */}
      <div className="fixed bottom-8 right-8 z-0 pointer-events-none opacity-20">
        <pre className="font-['JetBrains_Mono'] text-[8px] text-[#22c55e] text-right">
          {'SYS.DATA.STREAM.ACTIVE\n'}
          {'SECURE_CONNECTION_ESTABLISHED\n'}
          {'NODE: TR-IST-01\n'}
          {`MEM: ${Math.floor(Math.random() * 1024)}MB / 4096MB\n`}
          {'...'}
        </pre>
      </div>
    </div>
  );
}
