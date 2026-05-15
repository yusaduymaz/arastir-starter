# Phase 13: Dashboard Extensions - Pattern Map

**Mapped:** 2026-05-15
**Files analyzed:** 8
**Analogs found:** 5 / 8

## File Classification

| Existing File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/app/dashboard/layout.tsx` | layout | static/view | N/A | exact |
| `src/app/dashboard/page.tsx` | page | data-fetching | N/A | exact |
| `src/components/dashboard/ProminentSearch.tsx` | component | user-input/trigger | N/A | exact |
| `src/components/dashboard/ActivePipeline.tsx` | component | event-driven/realtime | N/A | exact |
| `src/components/dashboard/HistoryTable.tsx` | component | presentation | N/A | exact |

## Pattern Assignments & Design Aesthetics

### `src/app/dashboard/layout.tsx` (Terminal Layout)

**Background & Navigation pattern** (lines 17-21, 57-70):
```tsx
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-black text-on-surface h-screen overflow-hidden flex font-body-md mesh-bg">
      <aside className="relative flex h-full flex-col bg-[#050505] border-r border-[#22c55e]/12 w-60 shrink-0 z-10 shadow-[4px_0_32px_rgba(0,0,0,0.8)]">
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />
        ...
        <Link className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group relative overflow-hidden ${
          item.active ? 'bg-[#22c55e]/08 border-l-2 border-[#facc15] text-white' : 'border-l-2 border-transparent text-[#64748b] hover:text-[#c5c6cc] hover:bg-white/03'
        }`}>...
```

### `src/app/dashboard/page.tsx` (Bento Grid Dashboard)

**Bento Container & Typography pattern** (lines 80-100):
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 blur-fade blur-fade-d4">
  <div className="md:col-span-2 bg-[#080808] border border-[#22c55e]/12 rounded-xl p-5 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <span className="font-['JetBrains_Mono'] text-[10px] text-[#22c55e]/50 tracking-widest uppercase">
        // Trend Hisseler — BIST
      </span>
      <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c]">Son 1g</span>
    </div>
    ...
```

### `src/components/dashboard/ProminentSearch.tsx` (Terminal Interactions & Glows)

**Glowing Input pattern** (lines 92-105):
```tsx
<div className="relative group/input">
  {/* Outer glow ring */}
  <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-[#22c55e]/0 via-[#22c55e]/0 to-[#22c55e]/0 group-focus-within/input:from-[#22c55e]/50 group-focus-within/input:via-[#facc15]/30 group-focus-within/input:to-[#22c55e]/50 transition-all duration-500 blur-[2px]" />
  <div className="relative flex items-center bg-[#0d0d0d] border border-[#22c55e]/20 rounded-lg group-focus-within/input:border-[#22c55e]/50 transition-colors overflow-hidden">
    <span className="material-symbols-outlined text-[#22c55e]/50 text-[20px] ml-4 shrink-0 group-focus-within/input:text-[#22c55e] transition-colors">
      search
    </span>
    <input className="flex-1 h-14 bg-transparent pl-3 pr-4 text-white font-['JetBrains_Mono'] text-sm focus:outline-none placeholder:text-[#45474c] tracking-wide" ... />
```

### `src/components/dashboard/ActivePipeline.tsx` (Real-time Status Updates)

**Agent Badges & Logs pattern** (lines 142-160):
```tsx
<div className="flex items-start gap-2">
  <span className="font-['JetBrains_Mono'] text-[9px] text-[#45474c] shrink-0 mt-0.5 tabular-nums">
    {time}
  </span>
  <span className={`text-[10px] shrink-0 mt-0.5 font-bold ${log.status === 'completed' ? 'text-[#22c55e]' : ...}`}>
    {statusIcon}
  </span>
  <span className="font-['JetBrains_Mono'] text-[8px] tracking-wider px-1.5 py-0.5 rounded shrink-0 border"
    style={{ color: agentInfo.color, borderColor: `${agentInfo.color}30`, backgroundColor: `${agentInfo.color}08` }}>
    {agentInfo.label}
  </span>
  <span className="font-['JetBrains_Mono'] text-[10px] text-[#94a3b8] leading-relaxed">
    {log.message}
  </span>
</div>
```

---

## Shared Patterns

### Typography System
**Source:** Multiple Files
**Apply to:** All dashboard components
- **Primary Data:** `font-['Montserrat']`
- **Secondary Data / Paragraphs:** `font-['Inter']`, `font-body-md`
- **Terminal Labels / Code / Numbers:** `font-['JetBrains_Mono'] text-[9px] text-[#22c55e]/50 tracking-widest uppercase`
- **Prefixes:** Use `// ` before section labels (e.g., `// AKTİF ANALİZ`).

### Color Palette (Terminal V1.0)
**Source:** `src/app/dashboard/layout.tsx` & `page.tsx`
**Apply to:** All components
- **Backgrounds:** `#050505` (sidebar), `#080808` (cards), `#0d0d0d` (inputs/sub-cards).
- **Primary Accent:** `#22c55e` (Neon Green) used for success, primary borders (`border-[#22c55e]/12`), glowing effects.
- **Secondary Accent:** `#facc15` (Neon Yellow) used for running/active states, orchestrator, and highlights.
- **Muted Text:** `#64748b` (Slate 500) and `#45474c` (Dark Gray).
- **Borders:** Usually `border border-[accent-color]/10` to `30`.

### Status Pings and Magic UI Effects
**Source:** `src/app/dashboard/layout.tsx` & `src/components/dashboard/page.tsx`
**Apply to:** Status indicators and entrance animations
```tsx
{/* Status Ping */}
<span className="relative flex h-2 w-2">
  <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
</span>

{/* Magic UI Fades */}
<div className="blur-fade blur-fade-d1">...</div>
<div className="blur-fade blur-fade-d2">...</div>
```

### Empty States
**Source:** `src/components/dashboard/HistoryTable.tsx`
**Apply to:** Empty lists / uninitialized data
```tsx
<div className="retro-grid relative flex flex-col items-center justify-center py-16 gap-6 overflow-hidden">
  <div className="w-14 h-14 rounded border border-[#22c55e]/30 bg-black flex items-center justify-center">
    <span className="material-symbols-outlined text-[#22c55e]/50 text-2xl">terminal</span>
  </div>
  <p className="text-[#22c55e]/30 text-xs tracking-widest mb-3">ARAŞTIR_SYS &gt; log_viewer --all</p>
  <p className="terminal-cursor">Sistem analizleri bekleniyor</p>
</div>
```

## Metadata

**Analog search scope:** `src/app/dashboard/`, `src/components/dashboard/`
**Files scanned:** 8
**Pattern extraction date:** 2026-05-15
