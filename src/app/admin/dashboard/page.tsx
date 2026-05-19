'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { AnalyticsChart } from '@/components/admin/dashboard/AnalyticsChart';
import { Users, CreditCard, Activity, CheckCircle, Shield, ArrowUpRight } from 'lucide-react';
import { MagicCard } from '@/components/ui/MagicCard';

interface AnalyticsData {
  totalUsers: number;
  paidUsers: number;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  userSignupsLast30Days: { date: string; count: number }[];
  sessionsLast30Days: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics');
        if (!response.ok) throw new Error('Analytics verisi alınamadı');
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#4edea3]"></div>
        <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.3em] uppercase animate-pulse">
          SİSTEM ANALİZİ BAŞLATILIYOR...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl font-mono text-sm">
        <strong className="font-bold">[HATA]: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* ── Header ── */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.2em] uppercase">Sistem_Terminal_v2.0</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight font-display italic">Panel Merkezi</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[9px] text-[#45474c] uppercase">Son Güncelleme</span>
          <span className="font-mono text-xs text-white/60">{new Date().toLocaleTimeString('tr-TR')}</span>
        </div>
      </div>
      
      {/* ── Stats Grid (Bento Style) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={data.totalUsers}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title="Ücretli Abonelik"
          value={data.paidUsers}
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ value: '5%', isPositive: true }}
        />
        <StatCard
          title="Toplam Analiz"
          value={data.totalSessions}
          icon={<Activity className="w-5 h-5" />}
        />
        <StatCard
          title="Başarı Oranı"
          value={`${data.totalSessions > 0 ? Math.round((data.completedSessions / data.totalSessions) * 100) : 0}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: '0.4%', isPositive: true }}
        />
      </div>

      {/* ── Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart 
            title="Günlük Kayıt Akışı" 
            data={data.userSignupsLast30Days} 
          />
        </div>
        
        {/* Quick Actions / System Info */}
        <MagicCard className="bg-[#080808] border border-white/[0.05] p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#45474c] tracking-widest uppercase">Hızlı İşlemler</span>
            <Shield className="w-4 h-4 text-[#FACC15]" />
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Kullanıcıları Yönet', href: '/admin/users' },
              { label: 'Oturum İzleme', href: '/admin/sessions' },
              { label: 'Sistem Logları', href: '/admin/logs' },
              { label: 'API Durumu', href: '#' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-[#4edea3]/5 hover:border-[#4edea3]/20 transition-all group"
              >
                <span className="text-sm text-[#8c8c94] group-hover:text-white transition-colors">{action.label}</span>
                <ArrowUpRight className="w-4 h-4 text-[#45474c] group-hover:text-[#4edea3] transition-colors" />
              </a>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FACC15]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FACC15]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Güvenlik Modu</span>
                <span className="text-[10px] text-[#4edea3] font-mono">AKTİF (Level 4)</span>
              </div>
            </div>
          </div>
        </MagicCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnalyticsChart 
          title="Araştırma Yoğunluğu" 
          data={data.sessionsLast30Days} 
        />
      </div>
    </div>
  );
}
