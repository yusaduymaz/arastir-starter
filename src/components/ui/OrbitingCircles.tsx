'use client'

const AGENTS = [
  { label: 'KAP', color: '#22c55e', r: '55px', d: '9s',  angle: 0,   cw: true  },
  { label: 'TCMB', color: '#facc15', r: '55px', d: '9s',  angle: 180, cw: true  },
  { label: 'NEWS', color: '#60a5fa', r: '85px', d: '14s', angle: 60,  cw: false },
  { label: 'MKT',  color: '#c084fc', r: '85px', d: '14s', angle: 240, cw: false },
  { label: 'PDF',  color: '#fb923c', r: '115px',d: '20s', angle: 30,  cw: true  },
]

export function OrbitingCircles() {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[200px]">
      {/* Center: AI core */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-full bg-black border border-[#facc15]/40 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.2)]">
          <span className="text-[#facc15] text-xl">⬡</span>
        </div>
        <span className="font-['JetBrains_Mono'] text-[9px] text-[#facc15]/70 tracking-widest uppercase">
          AI Core
        </span>
      </div>

      {/* Orbit rings */}
      {[55, 85, 115].map((radius) => (
        <div
          key={radius}
          className="absolute rounded-full border border-[#22c55e]/08"
          style={{ width: radius * 2, height: radius * 2 }}
        />
      ))}

      {/* Orbiting agent nodes */}
      {AGENTS.map((agent) => (
        <div
          key={agent.label}
          className={`absolute ${agent.cw ? 'orbit-cw' : 'orbit-ccw'}`}
          style={{
            '--r': agent.r,
            '--d': agent.d,
            animationDelay: `${-(agent.angle / 360) * parseFloat(agent.d)}s`,
          } as React.CSSProperties}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full border text-[9px] font-['JetBrains_Mono'] font-bold"
            style={{
              backgroundColor: `${agent.color}12`,
              borderColor: `${agent.color}50`,
              color: agent.color,
              boxShadow: `0 0 10px ${agent.color}30`,
            }}
          >
            {agent.label}
          </div>
        </div>
      ))}
    </div>
  )
}
