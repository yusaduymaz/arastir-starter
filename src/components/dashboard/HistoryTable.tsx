import { ResearchSession } from '@/types/research'
import { FileText, Presentation, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface HistoryTableProps {
  sessions: ResearchSession[]
}

export function HistoryTable({ sessions }: HistoryTableProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out-expo delay-150 fill-mode-both">
        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Araştırma Geçmişi</h2>
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p>Henüz bir araştırma yapmadınız. Yukarıdan bir hisse senedi aratarak başlayabilirsiniz.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out-expo delay-150 fill-mode-both">
      <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Araştırma Geçmişi</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <th className="pb-3 pr-4 font-semibold">Tarih</th>
              <th className="pb-3 px-4 font-semibold">Hisse / Konu</th>
              <th className="pb-3 px-4 font-semibold">Durum</th>
              <th className="pb-3 pl-4 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 pr-4 whitespace-nowrap">
                  {formatDate(session.created_at)}
                </td>
                <td className="py-4 px-4 font-medium text-gray-900">
                  {session.query}
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {session.status === 'completed' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      <CheckCircle2 size={14} />
                      Tamamlandı
                    </span>
                  )}
                  {session.status === 'in_progress' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                      <Loader2 size={14} className="animate-spin" />
                      İşleniyor
                    </span>
                  )}
                  {session.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                      <Loader2 size={14} />
                      Sırada
                    </span>
                  )}
                  {session.status === 'failed' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                      <AlertCircle size={14} />
                      Hata
                    </span>
                  )}
                </td>
                <td className="py-4 pl-4 text-right whitespace-nowrap">
                  {session.status === 'completed' ? (
                    <div className="flex items-center justify-end gap-2">
                      {/* For now, just simulating download buttons. If we had actual files, these would be <a> tags. */}
                      <button 
                        title="PDF İndir"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        title="PPTX İndir"
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                      >
                        <Presentation size={18} />
                      </button>
                    </div>
                  ) : session.status === 'failed' ? (
                    <span className="text-xs text-red-500">{session.error_message || 'Bilinmeyen Hata'}</span>
                  ) : (
                     <span className="text-xs text-gray-400">Rapor Hazırlanıyor...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
