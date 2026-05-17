'use client';

import { useEffect, useState } from 'react';
import { SessionsDataTable } from '@/components/admin/sessions/SessionsDataTable';

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sessions');
      if (!res.ok) throw new Error('Oturumlar yüklenemedi');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse" />
          <span className="font-mono text-[10px] text-[#FACC15]/60 tracking-[0.2em] uppercase">Canlı_Oturum_İzleme</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight font-display italic">Araştırma Kayıtları</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 font-mono text-sm">
          [HATA]: {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#4edea3]"></div>
          <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-widest uppercase animate-pulse">Veri Çekiliyor...</span>
        </div>
      ) : (
        <SessionsDataTable sessions={sessions} onSessionCancelled={fetchSessions} />
      )}
    </div>
  );
}
