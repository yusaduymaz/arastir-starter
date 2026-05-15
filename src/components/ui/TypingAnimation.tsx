'use client'

import { useEffect, useState } from 'react'

interface TypingAnimationProps {
  text: string
  duration?: number
  delay?: number
  className?: string
  cursor?: boolean
}

export function TypingAnimation({
  text,
  duration = 60,
  delay = 0,
  className = '',
  cursor = true,
}: TypingAnimationProps) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          setDone(true)
          clearInterval(interval)
        }
      }, duration)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, duration, delay])

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <span className="inline-block w-0.5 h-[0.85em] bg-current ml-0.5 animate-[cur-blink_1s_step-end_infinite] align-middle" />
      )}
    </span>
  )
}
