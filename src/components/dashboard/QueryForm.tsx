'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

export function QueryForm() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker: query.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu.')
      }

      setMessage({ type: 'success', text: 'Araştırma başlatıldı! Sonuçlar tabloya düşecek.' })
      setQuery('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
      <div className="mb-6 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Yeni Araştırma Başlat</h2>
        <p className="text-gray-600 text-sm">
          İncelemek istediğiniz şirketin BIST kodunu (örneğin THYAO) girin. Sistem sizin için haberleri tarayıp resmi bildirimleri sentezleyerek bir rapor hazırlayacaktır.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400 pointer-events-none">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Örn: THYAO, ASELS, TUPRS..."
            className="w-full pl-12 pr-36 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-lg font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
            disabled={isLoading}
            required
          />
          <div className="absolute right-2">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[42px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Başlıyor
                </>
              ) : (
                'Araştır'
              )}
            </button>
          </div>
        </div>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-md text-sm text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
