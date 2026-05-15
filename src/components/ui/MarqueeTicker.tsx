'use client'

const TICKERS = [
  { symbol: 'THYAO', price: '312.40', change: '+2.34%', up: true },
  { symbol: 'EREGL', price: '48.72', change: '-0.82%', up: false },
  { symbol: 'SASA',  price: '73.18', change: '+4.11%', up: true },
  { symbol: 'ASELS', price: '186.90', change: '+1.05%', up: true },
  { symbol: 'GARAN', price: '149.60', change: '-1.44%', up: false },
  { symbol: 'AKBNK', price: '58.32', change: '+0.62%', up: true },
  { symbol: 'KCHOL', price: '224.80', change: '+3.20%', up: true },
  { symbol: 'TUPRS', price: '543.50', change: '-0.39%', up: false },
  { symbol: 'BIMAS', price: '418.00', change: '+1.76%', up: true },
  { symbol: 'FROTO', price: '1847.00', change: '-2.10%', up: false },
  { symbol: 'PGSUS', price: '621.00', change: '+5.33%', up: true },
  { symbol: 'TOASO', price: '396.50', change: '+0.87%', up: true },
  { symbol: 'VESTL', price: '52.14', change: '-1.28%', up: false },
  { symbol: 'DOLAR', price: '38.42', change: '+0.21%', up: true },
  { symbol: 'EURO',  price: '41.89', change: '+0.14%', up: true },
  { symbol: 'ALTIN', price: '4.127', change: '+1.89%', up: true },
]

function TickerItem({ symbol, price, change, up }: typeof TICKERS[0]) {
  return (
    <div className="flex items-center gap-2 px-6 border-r border-[#22c55e]/10 shrink-0">
      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#c5c6cc] tracking-widest">
        {symbol}
      </span>
      <span className="font-['JetBrains_Mono'] text-xs text-white">{price}</span>
      <span
        className={`font-['JetBrains_Mono'] text-xs font-bold ${
          up ? 'text-[#22c55e]' : 'text-red-400'
        }`}
      >
        {up ? '▲' : '▼'} {change}
      </span>
    </div>
  )
}

export function MarqueeTicker() {
  const doubled = [...TICKERS, ...TICKERS]

  return (
    <div className="relative w-full bg-[#050505] border border-[#22c55e]/15 rounded-lg overflow-hidden scanlines">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      <div className="flex items-center py-2.5 marquee-wrapper">
        <div className="marquee-track">
          {doubled.map((t, i) => (
            <TickerItem key={`${t.symbol}-${i}`} {...t} />
          ))}
        </div>
      </div>

      {/* LIVE indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
        </span>
        <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e] tracking-widest font-bold">
          CANLI
        </span>
      </div>
    </div>
  )
}
