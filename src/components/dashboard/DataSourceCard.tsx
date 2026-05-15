import React from "react";

interface DataSourceCardProps {
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  icon: string;
  lastSync?: string;
  type: "public" | "api";
}

export function DataSourceCard({ name, description, status, icon, lastSync, type }: DataSourceCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "connected": return "#22c55e"; // Neon Green
      case "disconnected": return "#64748b"; // Slate
      case "error": return "#ef4444"; // Red
      case "syncing": return "#facc15"; // Yellow
      default: return "#64748b";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "connected": return "BAĞLI";
      case "disconnected": return "BAĞLI DEĞİL";
      case "error": return "HATA";
      case "syncing": return "SENKRONİZE EDİLİYOR";
      default: return "BİLİNMİYOR";
    }
  };

  const statusColor = getStatusColor();

  return (
    <div className="relative group p-5 rounded-lg border border-white/5 bg-[#0a0a0a] hover:bg-[#111] transition-all duration-300 overflow-hidden flex flex-col gap-4">
      {/* Glow Effect */}
      <div 
        className="absolute -inset-px opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg pointer-events-none"
        style={{ background: `linear-gradient(45deg, transparent, ${statusColor}, transparent)` }}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-black border border-white/10 text-white">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-['Montserrat'] text-white text-sm font-bold tracking-tight">{name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-[9px] text-white/40 uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded">
                {type === "public" ? "PUBLIC VERİ" : "API BAĞLANTISI"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 border border-white/5 px-2 py-1 rounded bg-black">
          <span className="relative flex h-2 w-2">
            {status === "connected" || status === "syncing" ? (
              <span 
                className="status-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ backgroundColor: statusColor }}
              />
            ) : null}
            <span 
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: statusColor }}
            />
          </span>
          <span 
            className="font-['JetBrains_Mono'] text-[9px] tracking-widest uppercase"
            style={{ color: statusColor }}
          >
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Body */}
      <p className="text-[#64748b] text-xs font-['Inter'] leading-relaxed relative z-10">
        {description}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
        <span className="font-['JetBrains_Mono'] text-[10px] text-white/30">
          Son Senkronizasyon: <span className="text-white/60">{lastSync || "Bilinmiyor"}</span>
        </span>
        <span className="text-[10px] font-['JetBrains_Mono'] text-[#22c55e]/60 border border-[#22c55e]/20 px-1.5 py-0.5 rounded uppercase tracking-widest bg-[#22c55e]/5">
          SİSTEM KONTROLÜNDE
        </span>
      </div>
    </div>
  );
}
