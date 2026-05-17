import { ReactNode } from 'react';
import { MagicCard } from '@/components/ui/MagicCard';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <MagicCard 
      className={cn("bg-[#080808] rounded-xl border border-white/[0.05] p-6 relative group overflow-hidden h-full", className)}
      glowColor="rgba(78, 222, 147, 0.08)"
    >
      <div className="flex items-center justify-between relative z-10">
        <h3 className="font-mono text-[10px] text-[#45474c] tracking-[0.2em] uppercase">{title}</h3>
        <div className="p-2.5 bg-[#4edea3]/5 text-[#4edea3] rounded-lg border border-[#4edea3]/20 group-hover:bg-[#4edea3]/10 transition-colors">
          {icon}
        </div>
      </div>
      
      <div className="mt-8 relative z-10">
        <div className="flex items-baseline gap-2">
          <p className="font-display text-4xl font-black text-white tracking-tight italic">
            {value}
          </p>
        </div>
        {trend && (
          <p className={cn(
            "font-mono text-[10px] mt-4 flex items-center gap-1.5 tracking-wider",
            trend.isPositive ? "text-[#4edea3]" : "text-red-500"
          )}>
            <span className="opacity-50">{trend.isPositive ? '▲' : '▼'}</span>
            {trend.value} <span className="text-[#45474c] uppercase italic">Sistem_Momentum</span>
          </p>
        )}
      </div>

      <BorderBeam size={120} duration={6} borderWidth={1.2} colorFrom="#4edea3" colorTo="#FACC15" delay={2} />
    </MagicCard>
  );
}
