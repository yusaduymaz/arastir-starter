'use client'

import { useEffect, useId, useRef, useState } from 'react'

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>
  fromRef: React.RefObject<HTMLElement>
  toRef: React.RefObject<HTMLElement>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
}

function getCoords(
  el: HTMLElement,
  container: HTMLElement,
): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  const c = container.getBoundingClientRect()
  return {
    x: r.left - c.left + r.width / 2,
    y: r.top - c.top + r.height / 2,
  }
}

function buildPath(
  x1: number, y1: number,
  x2: number, y2: number,
  curvature: number,
): string {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const cx = midX - (dy / len) * curvature
  const cy = midY + (dx / len) * curvature
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2.5,
  delay = 0,
  pathColor = '#22c55e',
  pathWidth = 1.5,
  pathOpacity = 0.2,
  gradientStartColor = '#4edea3',
  gradientStopColor = '#facc15',
}: AnimatedBeamProps) {
  const id = useId()
  const [path, setPath] = useState('')

  useEffect(() => {
    function update() {
      const from = fromRef.current
      const to = toRef.current
      const container = containerRef.current
      if (!from || !to || !container) return
      const { x: x1, y: y1 } = getCoords(from, container)
      const { x: x2, y: y2 } = getCoords(to, container)
      setPath(buildPath(x1, y1, x2, y2, curvature))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [fromRef, toRef, containerRef, curvature])

  const gradId = `beam-grad-${id}`
  const maskId = `beam-mask-${id}`

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="30%" stopColor={gradientStartColor} />
          <stop offset="70%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Static dim track */}
      <path
        d={path}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        fill="none"
        strokeLinecap="round"
      />

      {/* Animated beam */}
      <path
        d={path}
        stroke={`url(#${gradId})`}
        strokeWidth={pathWidth + 0.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="80 9999"
        strokeDashoffset={reverse ? -9999 : 9999}
        style={{
          animation: `beam-travel-${reverse ? 'rev' : 'fwd'} ${duration}s linear ${delay}s infinite`,
        }}
      />

      <style>{`
        @keyframes beam-travel-fwd {
          from { stroke-dashoffset: 9999; }
          to   { stroke-dashoffset: -9999; }
        }
        @keyframes beam-travel-rev {
          from { stroke-dashoffset: -9999; }
          to   { stroke-dashoffset: 9999; }
        }
      `}</style>
    </svg>
  )
}
