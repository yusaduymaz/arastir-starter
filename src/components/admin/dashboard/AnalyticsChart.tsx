interface ChartDataPoint {
  date: string;
  count: number;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
}

export function AnalyticsChart({ title, data }: AnalyticsChartProps) {
  // Find max value for scaling the bars
  const maxVal = Math.max(...data.map(d => d.count), 1);

  // Take the last 14 days
  const displayData = data.slice(-14);

  return (
    <div className="bg-[#080808] rounded-xl border border-[#22c55e]/15 p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-mono text-[10px] text-[#64748b] tracking-widest uppercase">{title}</h3>
        <span className="font-mono text-[9px] text-[#4edea3]/40 tracking-widest italic">HIST_DATA_v3</span>
      </div>
      
      {displayData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-[#45474c] font-mono text-xs">
          VERİ BULUNAMADI
        </div>
      ) : (
        <div className="h-48 flex items-end justify-between gap-1.5 px-2">
          {displayData.map((point, index) => {
            const heightPercentage = (point.count / maxVal) * 100;
            const shortDate = point.date.split('-').slice(1).join('/');
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full bg-[#4edea3]/20 rounded-t-sm group-hover:bg-[#4edea3]/40 transition-all relative border-t border-x border-[#4edea3]/30"
                  style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#121212] border border-[#4edea3]/30 text-[#4edea3] text-[10px] font-mono py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {point.count}
                  </div>
                </div>
                <span className="text-[8px] font-mono text-[#45474c] mt-3 rotate-45 origin-left tracking-tighter">
                  {shortDate}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Decorative background grid */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
      </div>
    </div>
  );
}
