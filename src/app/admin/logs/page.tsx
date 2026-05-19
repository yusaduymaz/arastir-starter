'use client';

import { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';

type LogEntry = {
  id: string;
  source: 'audit' | 'agent';
  created_at: string;
  // audit fields
  admin_id?: string;
  action?: string;
  target_type?: string;
  target_id?: string;
  details?: any;
  // agent fields
  session_id?: string;
  agent_name?: string;
  level?: string;
  message?: string;
};

type FilterType = 'all' | 'audit' | 'agent';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/logs?limit=100');
      if (!res.ok) throw new Error('Log verisi alınamadı');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.source === filter;
  });

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionText = (log: LogEntry) => {
    if (log.source === 'audit') return log.action || '-';
    return log.message || '-';
  };

  const getTargetText = (log: LogEntry) => {
    if (log.source === 'audit') {
      if (log.target_type && log.target_id) return `${log.target_type}:${log.target_id.substring(0, 8)}`;
      return '-';
    }
    return log.agent_name || log.session_id?.substring(0, 8) || '-';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.2em] uppercase">Sistem_Log_İzleyici</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight font-display italic">Sistem Logları</h1>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-[#4edea3] border border-[#4edea3]/20 rounded-lg hover:bg-[#4edea3]/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        {(['all', 'audit', 'agent'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all border ${
              filter === f
                ? 'bg-[#4edea3]/10 border-[#4edea3]/40 text-[#4edea3]'
                : 'bg-transparent border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
            }`}
          >
            {f === 'all' ? 'Tümü' : f === 'audit' ? 'Audit' : 'Agent'}
            {f === 'all' && ` (${logs.length})`}
            {f === 'audit' && ` (${logs.filter((l) => l.source === 'audit').length})`}
            {f === 'agent' && ` (${logs.filter((l) => l.source === 'agent').length})`}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 font-mono text-sm">
          [HATA]: {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#4edea3]" />
          <span className="font-mono text-[10px] text-[#4edea3]/60 tracking-[0.3em] uppercase animate-pulse">
            LOGLAR YÜKLENİYOR...
          </span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <FileText className="w-10 h-10 text-[#45474c]" />
          <p className="text-[#64748b] font-mono text-sm">Kayıt bulunamadı</p>
        </div>
      ) : (
        <div className="bg-[#080808] border border-white/[0.05] rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[180px_80px_1fr_160px] gap-4 px-4 py-3 border-b border-white/[0.05] bg-black/40">
            <span className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest">Zaman</span>
            <span className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest">Kaynak</span>
            <span className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest">İşlem / Mesaj</span>
            <span className="text-[10px] font-mono text-[#45474c] uppercase tracking-widest">Hedef</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/[0.03]">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`grid grid-cols-[180px_80px_1fr_160px] gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors border-l-2 ${
                  log.source === 'audit'
                    ? 'border-l-[#FACC15]'
                    : 'border-l-[#4edea3]'
                }`}
              >
                <span className="text-[11px] font-mono text-[#64748b] truncate">{formatTime(log.created_at)}</span>
                <span
                  className={`text-[11px] font-mono uppercase font-bold ${
                    log.source === 'audit' ? 'text-[#FACC15]/70' : 'text-[#4edea3]/70'
                  }`}
                >
                  {log.source}
                </span>
                <span
                  className={`text-[11px] font-mono truncate ${
                    log.source === 'audit' ? 'text-[#FACC15]' : 'text-[#4edea3]'
                  }`}
                >
                  {getActionText(log)}
                </span>
                <span className="text-[11px] font-mono text-[#64748b] truncate">{getTargetText(log)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
