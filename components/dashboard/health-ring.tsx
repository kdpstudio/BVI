'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface HealthRingProps {
  score: number
  breakdown: { label: string; score: number; maxScore: number }[]
}

export function HealthRing({ score, breakdown }: HealthRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState(0)

  const radius = 54
  const circ = 2 * Math.PI * radius
  const pct = score / 10
  const dash = pct * circ

  const scoreColor =
    score >= 8 ? '#00ff88' : score >= 6 ? '#00c8ff' : score >= 4 ? '#ffcc00' : '#ff4444'

  useEffect(() => {
    if (!inView) return
    let frame: number
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / 1200, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(ease * score * 10) / 10)
      if (t < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [inView, score])

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          {/* Glow filter */}
          <defs>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(123,47,255,0.15)" strokeWidth="8" />

          {/* Animated arc */}
          <motion.circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={inView ? { strokeDashoffset: circ - dash } : { strokeDashoffset: circ }}
            transition={{ duration: 1.2, ease: [0.32, 0, 0.67, 0] }}
            transform="rotate(-90 64 64)"
            filter="url(#ring-glow)"
            style={{ stroke: scoreColor }}
          />

          {/* Tick marks */}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * 2 * Math.PI - Math.PI / 2
            const r1 = 46, r2 = 50
            const x1 = 64 + r1 * Math.cos(angle)
            const y1 = 64 + r1 * Math.sin(angle)
            const x2 = 64 + r2 * Math.cos(angle)
            const y2 = 64 + r2 * Math.sin(angle)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          })}
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-orbitron text-3xl text-text" style={{ color: scoreColor }}>
            {displayed.toFixed(1)}
          </span>
          <span className="text-textMuted text-xs font-rajdhani">/10</span>
        </div>

        {/* Pulsing glow */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 0px ${scoreColor}` }}
          animate={{ boxShadow: [`0 0 0px ${scoreColor}`, `0 0 20px ${scoreColor}40`, `0 0 0px ${scoreColor}`] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
        />
      </div>

      <p className="text-textMuted text-xs font-orbitron mt-3 tracking-widest">POWERED BY ARIA</p>

      {/* Breakdown bars */}
      <div className="w-full flex flex-col gap-2 mt-4">
        {breakdown.map(({ label, score: s, maxScore }, i) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-textMuted font-rajdhani">{label}</span>
              <span className="text-text font-orbitron">{s}/{maxScore}</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #7b2fff, ${scoreColor})` }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${(s / maxScore) * 100}%` } : { width: 0 }}
                transition={{ duration: 0.8, delay: 1.3 + i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
