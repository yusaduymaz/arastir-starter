'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TopSearchBar() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker: query.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Bir hata oluştu.')
      }

      setQuery('')
      // Sayfayı yenileyerek listeye "pending" olarak düşmesini sağla
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      {/* Search Bar */}
      <label className="flex flex-col min-w-64 h-10">
        <div className={`flex w-full flex-1 items-stretch rounded h-full bg-primary-container border border-outline-variant focus-within:border-secondary focus-within:shadow-[0_0_15px_rgba(78,222,163,0.2)] transition-all ${isLoading ? 'opacity-50' : ''}`}>
          <div className="text-on-surface-variant flex items-center justify-center pl-3 pr-2">
            <span className="material-symbols-outlined text-[20px]">
              search
            </span>
          </div>
          <input
            className="form-input flex w-full min-w-0 flex-1 bg-transparent text-on-surface border-none focus:ring-0 h-full placeholder:text-on-surface-variant px-2 font-body-md"
            placeholder="Hisse kodu giriniz (Örn: THYAO)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
      </label>
      {/* Quick Start Button */}
      <button 
        type="submit"
        disabled={isLoading || !query.trim()}
        className="bg-secondary text-primary-container px-6 py-2 rounded h-10 font-headline font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(78,222,163,0.3)] hover:shadow-[0_0_25px_rgba(78,222,163,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-primary-container" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
        )}
        {isLoading ? 'BAŞLIYOR...' : 'YENİ ARAŞTIRMA BAŞLAT'}
      </button>
    </form>
  )
}
