'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ResearchSession, AgentLogEntry, AgentRun } from '@/types/research'

interface ActivePipelineProps {
  initialTask: ResearchSession
}

const AGENT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  orchestrator: { label: 'Sistem', icon: 'settings', color: '#64748b' },
  search: { label: 'KAP Verisi', icon: 'travel_explore', color: '#22c55e' },
  news: { label: 'Haberler', icon: 'newspaper', color: '#60a5fa' },
  market: { label: 'Piyasa', icon: 'candlestick_chart', color: '#c084fc' },
  macro: { label: 'Makro', icon: 'monitoring', color: '#14b8a6' },
  analyst: { label: 'Yapay Zeka', icon: 'psychology', color: '#f472b6' },
  writer: { label: 'Rapor Üretici', icon: 'description', color: '#fb923c' },
}

const STATUS_ICON = {
  started: '◦',
  running: '◉',
  completed: '✓',
  failed: '✗',
  skipped: '⊘',
} as const

export function ActivePipeline({ initialTask }: ActivePipelineProps) {
  const [task, setTask] = useState<ResearchSession>(initialTask)
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([])
  const router = useRouter()
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    // Subscribe to task updates
    const taskChannel = supabase
      .channel(`public:research_sessions:id=eq.${initialTask.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'research_sessions',
        filter: `id=eq.${initialTask.id}`,
      }, (payload) => {
        const updated = payload.new as ResearchSession
        setTask(updated)
        if (updated.status === 'completed' || updated.status === 'failed') {
          setTimeout(() => router.refresh(), 2000)
        }
      })
      .subscribe()

    // Fetch initial agent runs
    supabase
      .from('agent_runs')
      .select('*')
      .eq('session_id', initialTask.id)
      .then(({ data }) => {
        if (data) setAgentRuns(data as AgentRun[])
      })

    // Subscribe to agent_runs updates
    const runsChannel = supabase
      .channel(`public:agent_runs:session_id=eq.${initialTask.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'agent_runs',
        filter: `session_id=eq.${initialTask.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAgentRuns(prev => {
            if (prev.find(r => r.id === payload.new.id)) return prev;
            return [...prev, payload.new as AgentRun]
          })
        } else if (payload.eventType === 'UPDATE') {
          setAgentRuns(prev => prev.map(run => run.id === payload.new.id ? payload.new as AgentRun : run))
        } else if (payload.eventType === 'DELETE') {
          setAgentRuns(prev => prev.filter(run => run.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(taskChannel)
      supabase.removeChannel(runsChannel)
    }
  }, [initialTask.id, router])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [task.agent_logs?.length])

  let calculatedProgress = task.progress || 0
  if (agentRuns.length > 0) {
    const completedRuns = agentRuns.filter(r => ['completed', 'failed', 'skipped'].includes(r.status)).length
    // Assuming max 6 agents (search, news, market, macro, analyst, writer)
    const agentsProgress = Math.round((completedRuns / 6) * 100)
    calculatedProgress = Math.max(calculatedProgress, agentsProgress)
  }
  if (task.status === 'completed') calculatedProgress = 100

  const progress = calculatedProgress
  const stepLabel = task.current_step || 'Başlatılıyor...'
  const logs: AgentLogEntry[] = task.agent_logs || []
  const displayTicker = task.extracted_ticker || task.query
  const isFailed = task.status === 'failed'

  const [retrying, setRetrying] = useState(false)

  async function handleRetry() {
    if (retrying) return
    setRetrying(true)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: task.query }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }))
        alert(`Yeniden deneme başarısız: ${body.error || res.statusText}`)
      }
    } catch (e: any) {
      alert(`Ağ hatası: ${e.message}`)
    } finally {
      setRetrying(false)
    }
  }

  if (task.status === 'completed') {
    return (
      <div className="bg-[#080808] border border-[#22c55e]/30 rounded-xl overflow-hidden relative p-10 flex flex-col items-center justify-center text-center gap-6">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/50 to-transparent" />

        <div className="w-20 h-20 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[#22c55e] text-4xl animate-pulse">check_circle</span>
        </div>

        <div>
          <h2 className="font-['Montserrat'] text-2xl font-bold text-white mb-2 tracking-tight">Analiz Tamamlandı</h2>
          <p className="font-['JetBrains_Mono'] text-xs text-[#22c55e]/60 tracking-wider">
            {displayTicker} için tüm raporlar başarıyla oluşturuldu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = `/dashboard/history/${task.id}`}
            className="px-8 py-3 bg-[#22c55e] text-black font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#1da850] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            RAPORU İNCELE
          </button>
        </div>

        {/* Backlink to history */}
        <p className="text-[10px] text-[#45474c] font-['JetBrains_Mono']">
          Sistem Kaydı: {task.id.slice(0, 8)}... | {new Date().toLocaleTimeString()}
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-[#080808] border rounded-xl overflow-hidden relative ${isFailed ? 'border-[#ef4444]/40' : 'border-[#facc15]/25'}`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isFailed ? 'via-[#ef4444]/60' : 'via-[#facc15]/60'} to-transparent`} />

      {/* ── Error Card (only when failed) ── */}
      {isFailed && task.error_message && (
        <div className="m-4 mb-0 p-4 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/05 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#ef4444] text-[20px] shrink-0 mt-0.5">error</span>
          <div className="flex-1 min-w-0">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#ef4444]/70 tracking-widest uppercase mb-1">
              // Pipeline Hatası
            </p>
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#fca5a5] leading-relaxed break-words whitespace-pre-wrap">
              {task.error_message}
            </p>
          </div>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="font-['JetBrains_Mono'] text-[10px] tracking-wider px-3 py-1.5 rounded border border-[#ef4444]/40 text-[#fca5a5] hover:bg-[#ef4444]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {retrying ? 'Gönderiliyor...' : 'Yeniden Dene'}
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-4 w-4 text-[#facc15]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] text-[#facc15]/50 tracking-widest uppercase mb-0.5">
                // Aktif Analiz
              </p>
              <div className="flex items-center gap-2">
                <p className="font-['Montserrat'] text-sm font-bold text-white">
                  {displayTicker}
                </p>
                {task.extracted_ticker && task.query !== task.extracted_ticker && (
                  <span className="font-['JetBrains_Mono'] text-[9px] text-[#64748b] bg-[#0d0d0d] px-1.5 py-0.5 rounded border border-[#22c55e]/10">
                    ← {task.query}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded border font-['JetBrains_Mono'] text-xs font-bold"
            style={{
              color: '#facc15',
              borderColor: 'rgba(250,204,21,0.3)',
              backgroundColor: 'rgba(250,204,21,0.08)',
            }}
          >
            {progress}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5 mt-4">
          <div className="w-full bg-[#0d0d0d] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: progress < 50
                  ? 'linear-gradient(90deg, #facc15, #fde047)'
                  : 'linear-gradient(90deg, #facc15, #22c55e)',
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#64748b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-[#facc15]/60">sync</span>
              {stepLabel}
            </p>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">
              {progress < 100 ? 'devam ediyor' : 'tamamlandı'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Agent Activity Log ── */}
      {logs.length > 0 && (
        <div className="mt-4 border-t border-[#facc15]/10">
          <div className="px-5 py-2.5 flex items-center justify-between bg-[#050505]">
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#facc15]/40 tracking-widest uppercase">
              // Agent Aktivite Logu
            </span>
            <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">
              {logs.length} event
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <div className="px-5 pb-4 flex flex-col gap-1">
              {logs.map((log, i) => {
                const agentInfo = AGENT_CONFIG[log.agent] || AGENT_CONFIG.orchestrator
                const statusIcon = STATUS_ICON[log.status] || '◦'
                const time = new Date(log.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })

                return (
                  <div
                    key={i}
                    className="flex flex-col gap-0.5 py-1.5 group hover:bg-[#0d0d0d] -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {/* Time */}
                      <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] shrink-0 mt-0.5 tabular-nums">
                        {time}
                      </span>

                      {/* Status icon */}
                      <span
                        className={`text-[10px] shrink-0 mt-0.5 font-bold ${log.status === 'completed' ? 'text-[#22c55e]' :
                            log.status === 'failed' ? 'text-[#ef4444]' :
                              log.status === 'started' ? 'text-[#64748b]' :
                                'text-[#facc15]'
                          }`}
                      >
                        {statusIcon}
                      </span>

                      {/* Agent badge */}
                      {log.agent !== 'orchestrator' ? (
                        <span
                          className="font-['JetBrains_Mono'] text-[8px] tracking-wider px-1.5 py-0.5 rounded shrink-0 border"
                          style={{
                            color: agentInfo.color,
                            borderColor: `${agentInfo.color}30`,
                            backgroundColor: `${agentInfo.color}08`,
                          }}
                        >
                          {agentInfo.label}
                        </span>
                      ) : (
                        <span className="font-['JetBrains_Mono'] text-[8px] tracking-wider px-1.5 py-0.5 rounded shrink-0 border border-white/10 text-[#64748b]">
                          {agentInfo.label.toUpperCase()}
                        </span>
                      )}

                      {/* Message */}
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#94a3b8] leading-relaxed">
                        {log.message}
                        {log.duration_ms && (
                          <span className="text-[#45474c] ml-1.5">
                            ({(log.duration_ms / 1000).toFixed(1)}s)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Details — surfaced on failed entries so user sees WHY without leaving dashboard */}
                    {log.status === 'failed' && log.details && (
                      <div
                        className="font-['JetBrains_Mono'] text-[9px] text-[#64748b] leading-relaxed ml-[88px] pl-2 border-l border-[#ef4444]/30 break-words"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                        title={log.details}
                      >
                        {log.details}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* ── Agent Status Grid ── */}
      <div className="px-5 pb-4 pt-2 border-t border-[#facc15]/06">
        <div className="flex flex-wrap gap-2">
          {agentRuns
            .filter(r => ['search', 'news', 'market', 'macro', 'analyst', 'writer'].includes(r.agent_name))
            .sort((a, b) => {
              const order = ['search', 'news', 'market', 'macro', 'analyst', 'writer'];
              return order.indexOf(a.agent_name) - order.indexOf(b.agent_name);
            })
            .map((agentRun) => {
              const agentKey = agentRun.agent_name;
              const config = AGENT_CONFIG[agentKey] || { label: agentKey, icon: 'hub', color: '#ffffff' };
              const latestStatus = agentRun.status;

              const isActive = latestStatus === 'running' || latestStatus === 'pending';
              const isDone = latestStatus === 'completed';
              const isFailed = latestStatus === 'failed';

              return (
                <div
                  key={agentKey}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/50 border transition-all"
                  style={{
                    borderColor: isDone ? `${config.color}40` :
                      isFailed ? '#ef444440' :
                        isActive ? `${config.color}60` : '#ffffff08',
                    backgroundColor: isDone ? `${config.color}08` :
                      isActive ? `${config.color}05` : 'transparent',
                  }}
                >
                  <span
                    className={`material-symbols-outlined text-[12px] ${isActive ? 'animate-pulse' : ''}`}
                    style={{ color: isDone ? config.color : isFailed ? '#ef4444' : isActive ? config.color : '#45474c' }}
                  >
                    {isDone ? 'check_circle' : isFailed ? 'error' : config.icon}
                  </span>
                  <span
                    className="font-['JetBrains_Mono'] text-[9px] font-medium"
                    style={{ color: isDone ? config.color : isFailed ? '#ef4444' : isActive ? config.color : '#45474c' }}
                  >
                    {config.label}
                  </span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
