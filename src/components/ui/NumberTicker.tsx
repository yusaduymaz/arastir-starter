'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface NumberTickerProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  delay?: number
  style?: React.CSSProperties
}

export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  delay = 0,
  style,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [motionValue, isInView, value, delay])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent =
          prefix + latest.toFixed(decimals) + suffix
      }
    })
    return unsubscribe
  }, [springValue, prefix, suffix, decimals])

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}0{suffix}
    </span>
  )
}
