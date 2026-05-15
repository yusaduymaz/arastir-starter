'use client'

import { ResearchSession } from '@/types/research'
import { FileText, Presentation, Loader2, AlertCircle, CheckCircle2, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HistoryTableProps {
  sessions: ResearchSession[]
}

const STATUS_CONFIG = {
  completed:   { label: 'TAMAMLANDI', color: '#22c55e',  icon: CheckCircle2, spin: false },
  in_progress: { label: 'İŞLENİYOR',  color: '#facc15',  icon: Loader2,      spin: true  },
  pending:     { label: 'SIRАДА',      color: '#64748b',  icon: Loader2,      spin: false },
  failed:      { label: 'HATA',        color: '#ef4444',  icon: AlertCircle,  spin: false },
} as const

export function HistoryTable({ sessions }: HistoryTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateString))

  const handleDelete = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/research/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme işlemi başarısız oldu')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className="blur-fade blur-fade-d5 flex flex-col gap-0">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50 tracking-widest uppercase">
            // Araştırma Geçmişi
          </span>
          {sessions.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#22c55e]/10 border border-[#22c55e]/20 font-['JetBrains_Mono'] text-[9px] text-[#22c55e]">
              {sessions.length} kayıt
            </span>
          )}
        </div>
        <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest">
          TERMINAL_LOG
        </span>
      </div>

      <div className="bg-[#080808] border border-[#22c55e]/12 rounded-xl overflow-hidden">
        {sessions.length === 0 ? (
          /* ── Empty state: RetroGrid + terminal message ── */
          <div className="retro-grid relative flex flex-col items-center justify-center py-16 gap-6 overflow-hidden">
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8">
              <div className="w-14 h-14 rounded border border-[#22c55e]/30 bg-black flex items-center justify-center">
                <span className="material-symbols-outlined text-[#22c55e]/50 text-2xl">terminal</span>
              </div>
              <div className="font-['JetBrains_Mono'] text-sm text-[#22c55e]/60 leading-relaxed">
                <p className="text-[#22c55e]/30 text-xs tracking-widest mb-3">ARAŞTIR_SYS &gt; log_viewer --all</p>
                <p className="terminal-cursor">Sistem analizleri bekleniyor</p>
                <p className="text-[10px] text-[#45474c] mt-3 tracking-wide">
                  Yukarıdan bir hisse kodu aratarak ilk analizinizi başlatın.
                </p>
              </div>
            </div>
            {/* Corner decorations */}
            <div className="absolute top-3 left-3 border-t border-l border-[#22c55e]/20 w-6 h-6" />
            <div className="absolute top-3 right-3 border-t border-r border-[#22c55e]/20 w-6 h-6" />
            <div className="absolute bottom-3 left-3 border-b border-l border-[#22c55e]/20 w-6 h-6" />
            <div className="absolute bottom-3 right-3 border-b border-r border-[#22c55e]/20 w-6 h-6" />
          </div>
        ) : (
          /* ── Data table ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#22c55e]/10 bg-[#050505]">
                  {['Zaman Damgası', 'Hisse / Konu', 'Durum', 'İşlemler'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-3 font-['JetBrains_Mono'] text-[9px] text-[#45474c] uppercase tracking-widest ${
                        i === 0 ? 'pl-5 pr-4' : i === 3 ? 'pl-4 pr-5 text-right' : 'px-4'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22c55e]/06">
                {sessions.map((session, idx) => {
                  const st = STATUS_CONFIG[session.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                  const Icon = st.icon
                  return (
                    <tr
                      key={session.id}
                      className="group hover:bg-[#22c55e]/03 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 pl-5 pr-4 whitespace-nowrap">
                        <span className="font-['JetBrains_Mono'] text-[11px] text-[#45474c]">
                          {formatDate(session.created_at)}
                        </span>
                      </td>

                      {/* Query */}
                      <td className="py-3.5 px-4">
                        <a
                          href={`/dashboard/history/${session.id}`}
                          className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity"
                        >
                          <span className="font-['JetBrains_Mono'] text-sm text-[#c5c6cc] hover:text-[#22c55e] transition-colors tracking-wide">
                            {(session as any).extracted_ticker || session.query}
                          </span>
                          {(session as any).extracted_ticker && (session as any).extracted_ticker !== session.query && (
                            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] truncate max-w-[200px]">
                              {session.query}
                            </span>
                          )}
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-['JetBrains_Mono'] text-[9px] tracking-widest"
                          style={{
                            color: st.color,
                            borderColor: `${st.color}30`,
                            backgroundColor: `${st.color}08`,
                          }}
                        >
                          <Icon size={10} className={st.spin ? 'animate-spin' : ''} />
                          {st.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-4 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {session.status === 'completed' && (
                            <>
                              <a
                                href={`/dashboard/history/${session.id}`}
                                title="İncele"
                                className="p-1.5 text-[#64748b] hover:text-[#22c55e] hover:bg-[#22c55e]/10 rounded transition-colors"
                              >
                                <Eye size={14} />
                              </a>
                              <a
                                href={`${session.result_url}/report.pdf`}
                                target="_blank"
                                rel="noreferrer"
                                title="PDF İndir"
                                className="p-1.5 text-[#64748b] hover:text-[#60a5fa] hover:bg-[#60a5fa]/10 rounded transition-colors"
                              >
                                <FileText size={14} />
                              </a>
                              <a
                                href={`${session.result_url}/presentation.pptx`}
                                target="_blank"
                                rel="noreferrer"
                                title="PPTX İndir"
                                className="p-1.5 text-[#64748b] hover:text-[#fb923c] hover:bg-[#fb923c]/10 rounded transition-colors"
                              >
                                <Presentation size={14} />
                              </a>
                            </>
                          )}
                          {session.status === 'failed' && (
                            <span className="text-[10px] text-red-500 mr-2 font-['JetBrains_Mono']">
                              {session.error_message || 'ERR_UNKNOWN'}
                            </span>
                          )}
                          {session.status === 'running' && (
                            <span className="text-[10px] text-[#facc15]/60 font-['JetBrains_Mono'] tracking-wider">
                              hazırlanıyor...
                            </span>
                          )}
                          {(session.status === 'completed' || session.status === 'failed') && (
                            <button
                              onClick={() => handleDelete(session.id)}
                              title="Sil"
                              className="p-1.5 text-[#64748b] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
