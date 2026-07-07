'use client'

import { motion } from 'framer-motion'

interface Metric {
  label: string
  value: string
  change?: string
  changePositive: boolean | null
  barPct: number
  barStyle: 'cyan' | 'gold' | 'green' | 'purple'
}

const BAR_GRADIENT: Record<string, string> = {
  cyan:   'linear-gradient(90deg, #00c8ff, #7b2fff)',
  gold:   'linear-gradient(90deg, #ffb800, #ff2d78)',
  green:  'linear-gradient(90deg, #00ff88, #00c8ff)',
  purple: 'linear-gradient(90deg, #a855f7, #00c8ff)',
}

const VALUE_STYLE: Record<string, string> = {
  cyan:   '#00c8ff',
  gold:   '#ffb800',
  green:  '#00ff88',
  purple: '#a855f7',
}

const VALUE_SHADOW: Record<string, string> = {
  cyan:   '0 0 10px rgba(0,200,255,0.5)',
  gold:   '0 0 10px rgba(255,184,0,0.4)',
  green:  '0 0 10px rgba(0,255,136,0.4)',
  purple: '0 0 10px rgba(168,85,247,0.4)',
}

export function DashboardMetrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          whileHover={{ y: -2, borderColor: 'rgba(0,200,255,0.35)' }}
          className="relative border border-cyan/15 p-4 overflow-hidden cursor-default"
          style={{ background: '#060f1a' }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.3), transparent)' }} />

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />

          <div className="font-mono-tech text-[9px] tracking-[3px] mb-2"
            style={{ color: 'rgba(100,140,170,0.4)' }}>{'// '}{m.label}</div>

          <motion.div
            className="font-orbitron text-[22px] font-bold leading-none mb-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            style={{ color: VALUE_STYLE[m.barStyle], textShadow: VALUE_SHADOW[m.barStyle] }}
          >
            {m.value}
          </motion.div>

          {m.change && (
            <div className="font-mono-tech text-[10px] mb-2"
              style={{ color: m.changePositive === true ? 'rgba(0,255,136,0.7)' : m.changePositive === false ? 'rgba(255,45,120,0.7)' : 'rgba(255,184,0,0.7)' }}>
              {m.change}
            </div>
          )}

          {/* Animated bar */}
          <div className="h-0.5 mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full"
              initial={{ width: 0 }}
              animate={{ width: `${m.barPct}%` }}
              transition={{ duration: 1.5, delay: i * 0.15, ease: 'easeOut' }}
              style={{ background: BAR_GRADIENT[m.barStyle] }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
