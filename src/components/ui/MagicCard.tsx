'use client'

import { useRef, useState, type ReactNode } from 'react'

interface MagicCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function MagicCard({
  children,
  className = '',
  glowColor = 'rgba(250,204,21,0.15)',
}: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setOpacity(1)
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOpacity(0)}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
      {children}
    </div>
  )
}
