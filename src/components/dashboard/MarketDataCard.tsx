import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';

interface MarketData {
  price?: number;
  change_percent?: number;
  pe_ratio?: number;
  market_cap?: number;
  volume?: number;
}

export function MarketDataCard({ data, ticker }: { data?: MarketData; ticker: string }) {
  if (!data) {
    return (
      <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center h-full text-on-surface-variant">
        <BarChart2 className="mb-2 opacity-50" size={32} />
        <p className="text-sm">Piyasa verisi bulunamadı.</p>
      </div>
    );
  }

  const isPositive = (data.change_percent || 0) >= 0;

  return (
    <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
        <h3 className="text-lg font-headline font-semibold flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={20} /> Piyasa Verileri ({ticker})
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-on-surface-variant mb-1">Son Fiyat</span>
          <span className="text-2xl font-bold font-['Montserrat']">
            {data.price ? `₺${data.price.toFixed(2)}` : 'N/A'}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-on-surface-variant mb-1">Günlük Değişim</span>
          <span className={`text-lg font-bold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {data.change_percent ? `${isPositive ? '+' : ''}${data.change_percent.toFixed(2)}%` : 'N/A'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/20">
        <div className="flex flex-col">
          <span className="text-xs text-on-surface-variant mb-1">F/K Oranı</span>
          <span className="font-semibold text-sm">{data.pe_ratio ? data.pe_ratio.toFixed(2) : 'N/A'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-on-surface-variant mb-1">Piyasa Değeri</span>
          <span className="font-semibold text-sm">
            {data.market_cap ? `₺${(data.market_cap / 1000000000).toFixed(2)}Mlyr` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
