'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Database, Key } from 'lucide-react';

type ServiceStatus = {
  supabase: { status: 'ok' | 'error'; latencyMs: number };
  clerk: { configured: boolean };
};

type Provider = {
  name: string;
  envVar: string;
  configured: boolean;
};

type ApiStatusData = {
  services: ServiceStatus;
  providers: Provider[];
  checkedAt: string;
};

export default function AdminApiStatusPage() {
  const [data, setData] = useState<ApiStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/api-status');
      if (!res.ok) throw new Error('API durum verisi alınamadı');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const formatCheckedAt = (iso: string) => {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.2em] uppercase">Sistem_API_İzleyici</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight font-display italic">API Durumu</h1>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-[#4edea3] border border-[#4edea3]/20 rounded-lg hover:bg-[#4edea3]/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 font-mono text-sm">
          [HATA]: {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#4edea3]" />
          <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.3em] uppercase animate-pulse">
            API DURUMU KONTROL EDİLİYOR...
          </span>
        </div>
      ) : data ? (
        <>
          {/* Services */}
          <div>
            <h2 className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest mb-4">Temel Servisler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Supabase */}
              <div className="bg-[#080808] border border-white/[0.05] rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.services.supabase.status === 'ok' ? 'bg-[#4edea3]/10' : 'bg-red-500/10'}`}>
                    <Database className={`w-5 h-5 ${data.services.supabase.status === 'ok' ? 'text-[#4edea3]' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Supabase</p>
                    <p className="text-[10px] font-mono text-[#64748b] uppercase">Veritabanı</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${data.services.supabase.status === 'ok' ? 'bg-[#4edea3]/10 text-[#4edea3]' : 'bg-red-500/10 text-red-500'}`}>
                    {data.services.supabase.status === 'ok' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {data.services.supabase.status === 'ok' ? 'Aktif' : 'Hata'}
                  </div>
                  {data.services.supabase.latencyMs >= 0 && (
                    <span className="text-[10px] font-mono text-[#45474c]">{data.services.supabase.latencyMs}ms</span>
                  )}
                </div>
              </div>

              {/* Clerk */}
              <div className="bg-[#080808] border border-white/[0.05] rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.services.clerk.configured ? 'bg-[#FACC15]/10' : 'bg-red-500/10'}`}>
                    <Key className={`w-5 h-5 ${data.services.clerk.configured ? 'text-[#FACC15]' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Clerk</p>
                    <p className="text-[10px] font-mono text-[#64748b] uppercase">Kimlik Doğrulama</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${data.services.clerk.configured ? 'bg-[#FACC15]/10 text-[#FACC15]' : 'bg-red-500/10 text-red-500'}`}>
                  {data.services.clerk.configured ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  {data.services.clerk.configured ? 'Ayarlı' : 'Eksik'}
                </div>
              </div>
            </div>
          </div>

          {/* Providers */}
          <div>
            <h2 className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest mb-4">API Sağlayıcıları</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {data.providers.map((provider) => (
                <div
                  key={provider.envVar}
                  className={`bg-[#080808] border rounded-xl p-4 flex flex-col gap-2 transition-all ${
                    provider.configured
                      ? 'border-[#4edea3]/10 hover:border-[#4edea3]/25'
                      : 'border-red-500/10 hover:border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white truncate">{provider.name}</span>
                    <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${provider.configured ? 'bg-[#4edea3]/10 text-[#4edea3]' : 'bg-red-500/10 text-red-400'}`}>
                      {provider.configured ? <CheckCircle size={8} /> : <XCircle size={8} />}
                      {provider.configured ? 'Ayarlı' : 'Eksik'}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#45474c] truncate">{provider.envVar}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-[10px] font-mono text-[#45474c] text-right">
            Kontrol edildi: {formatCheckedAt(data.checkedAt)}
          </div>
        </>
      ) : null}
    </div>
  );
}
