'use client';

import { useState } from 'react';
import { StopCircle, Eye, User, Terminal as TerminalIcon, Clock } from 'lucide-react';

interface SessionsDataTableProps {
  sessions: any[];
  onSessionCancelled: () => void;
}

export function SessionsDataTable({ sessions, onSessionCancelled }: SessionsDataTableProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (sessionId: string) => {
    if (!confirm('Bu oturumu iptal etmek istediğinize emin misiniz?')) return;
    
    setCancellingId(sessionId);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/cancel`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('İptal işlemi başarısız oldu');
      
      onSessionCancelled();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'running': return 'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/20';
      default: return 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20';
    }
  };

  return (
    <div className="bg-[#080808] rounded-xl border border-[#22c55e]/15 overflow-hidden shadow-2xl">
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-4 text-red-500 font-mono text-xs">
          [HATA]: {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0D0D0D] border-b border-[#22c55e]/10">
              <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Kullanıcı</th>
              <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Sorgu</th>
              <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Durum</th>
              <th className="px-6 py-4 text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">Zaman</th>
              <th className="px-6 py-4 text-right text-[10px] font-mono font-semibold text-[#45474c] uppercase tracking-widest">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#22c55e]/05">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <User size={12} className="text-[#64748b]" />
                    <span className="text-sm text-white font-medium">{session.users?.email || 'Anonim'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="flex items-center gap-2">
                    <TerminalIcon size={12} className="text-[#4edea3]/40 shrink-0" />
                    <span className="text-xs text-[#64748b] truncate italic" title={session.query}>
                      {session.query}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider ${getStatusStyle(session.status)}`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[#45474c]">
                    <Clock size={12} />
                    <span className="text-[11px] font-mono">{new Date(session.created_at).toLocaleString('tr-TR')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-[#45474c] hover:text-white transition-all" title="Detayları Gör">
                      <Eye size={16} />
                    </button>
                    
                    {session.status === 'running' && (
                      <button
                        onClick={() => handleCancel(session.id)}
                        disabled={cancellingId === session.id}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[#45474c] hover:text-red-500 transition-all disabled:opacity-50"
                        title="Oturumu İptal Et"
                      >
                        <StopCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sessions.length === 0 && (
        <div className="p-12 text-center text-[#45474c] font-mono text-sm uppercase tracking-widest">
          Sistemde aktif oturum bulunamadı
        </div>
      )}
    </div>
  );
}
