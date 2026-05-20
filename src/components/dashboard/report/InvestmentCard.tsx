'use client'

interface InvestmentRecommendation {
  action: 'AL' | 'TUT' | 'SAT'
  score: number
  confidence: string
  shortTermOutlook: string
  longTermOutlook: string
  keyFactors: string[]
}

interface InvestmentCardProps {
  recommendation: InvestmentRecommendation | null
  ticker: string
}

const ACTION_STYLES = {
  AL: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.4)', text: '#22c55e', label: 'AL (Buy)' },
  TUT: { bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.4)', text: '#facc15', label: 'TUT (Hold)' },
  SAT: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', label: 'SAT (Sell)' },
}

const CONFIDENCE_STYLES: Record<string, { bg: string; text: string }> = {
  'yüksek': { bg: 'rgba(34,197,94,0.1)', text: '#22c55e' },
  'orta': { bg: 'rgba(250,204,21,0.1)', text: '#facc15' },
  'düşük': { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
}

export function InvestmentCard({ recommendation, ticker }: InvestmentCardProps) {
  if (!recommendation) {
    return (
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
        <p className="font-['JetBrains_Mono'] text-[11px] text-[#45474c]">
          // Yatırım tavsiyesi analiz edilemedi.
        </p>
      </div>
    )
  }

  const r = recommendation
  const actionStyle = ACTION_STYLES[r.action] || ACTION_STYLES.TUT
  const confStyle = CONFIDENCE_STYLES[r.confidence] || CONFIDENCE_STYLES['orta']

  // Score ring
  const scorePercent = (r.score / 10) * 100
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference

  return (
    <div
      className="bg-[#080808] border rounded-xl overflow-hidden"
      style={{ borderColor: actionStyle.border }}
    >
      {/* Header accent */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${actionStyle.text}, transparent)` }} />

      <div className="p-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-widest uppercase mb-1">
              // Yatirim Tavsiyesi
            </p>
            <h3 className="font-['Montserrat'] text-lg font-bold text-white">
              {ticker} Degerlendirmesi
            </h3>
          </div>
          <div
            className="px-4 py-2 rounded-lg border font-['Montserrat'] text-xl font-black tracking-wider"
            style={{
              backgroundColor: actionStyle.bg,
              borderColor: actionStyle.border,
              color: actionStyle.text,
            }}
          >
            {actionStyle.label}
          </div>
        </div>

        {/* Score + Confidence row */}
        <div className="flex items-center gap-8 mb-6">
          {/* Score ring */}
          <div className="relative flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={actionStyle.text}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-['Montserrat'] text-2xl font-black" style={{ color: actionStyle.text }}>
                {r.score}
              </span>
              <span className="font-['JetBrains_Mono'] text-[8px] text-[#64748b]">/10</span>
            </div>
          </div>

          {/* Confidence + Outlook */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b]">Guven:</span>
              <span
                className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 rounded border capitalize"
                style={{
                  backgroundColor: confStyle.bg,
                  color: confStyle.text,
                  borderColor: `${confStyle.text}40`,
                }}
              >
                {r.confidence}
              </span>
            </div>
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-wider uppercase mb-1">Kisa Vade (1-3 ay)</p>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8] leading-relaxed">{r.shortTermOutlook}</p>
            </div>
            <div>
              <p className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-wider uppercase mb-1">Uzun Vade (6-12 ay)</p>
              <p className="font-['JetBrains_Mono'] text-[11px] text-[#94a3b8] leading-relaxed">{r.longTermOutlook}</p>
            </div>
          </div>
        </div>

        {/* Key Factors */}
        {r.keyFactors && r.keyFactors.length > 0 && (
          <div>
            <p className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] tracking-wider uppercase mb-2">
              Temel Faktorler
            </p>
            <div className="flex flex-wrap gap-2">
              {r.keyFactors.map((factor, i) => (
                <span
                  key={i}
                  className="font-['JetBrains_Mono'] text-[10px] text-[#94a3b8] px-3 py-1.5 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-4 font-['JetBrains_Mono'] text-[8px] text-[#45474c] leading-relaxed border-t border-[#1a1a1a] pt-3">
          Bu yatirim tavsiyesi yapay zeka tarafindan mevcut verilere dayanarak olusturulmustur. Yatirim karari vermeden once profesyonel danismanlara basvurunuz. Bu bir yatirim danismanligi degildir.
        </p>
      </div>
    </div>
  )
}
