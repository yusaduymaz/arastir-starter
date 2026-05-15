import React from 'react';
import { Globe, DollarSign, Percent, TrendingUp } from 'lucide-react';

interface MacroData {
  usd_try?: number;
  eur_try?: number;
  inflation?: number;
  interest_rate?: number;
}

export function MacroDataCard({ data }: { data?: MacroData }) {
  if (!data) {
    return (
      <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center h-full text-on-surface-variant">
        <Globe className="mb-2 opacity-50" size={32} />
        <p className="text-sm">Makro veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <h3 className="text-lg font-headline font-semibold flex items-center gap-2">
          <Globe className="text-purple-400" size={20} /> Makroekonomik Veriler
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
            <DollarSign size={12} className="text-green-400" /> USD/TRY
          </span>
          <span className="font-semibold text-lg">{data.usd_try ? data.usd_try.toFixed(4) : 'N/A'}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
            <Percent size={12} className="text-blue-400" /> TCMB Politika Faizi
          </span>
          <span className="font-semibold text-lg">{data.interest_rate ? `%${data.interest_rate.toFixed(2)}` : 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/20">
         <div className="flex flex-col">
          <span className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-orange-400" /> TÜFE (Yıllık)
          </span>
          <span className="font-semibold text-lg">{data.inflation ? `%${data.inflation.toFixed(2)}` : 'N/A'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
            <DollarSign size={12} className="text-teal-400" /> EUR/TRY
          </span>
          <span className="font-semibold text-lg">{data.eur_try ? data.eur_try.toFixed(4) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
