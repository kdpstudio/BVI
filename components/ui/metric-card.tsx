'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  label: string
  value: string
  trend?: 'up' | 'down'
  trendValue?: string
  subtitle?: string
  variant?: 'cyan' | 'purple'
  icon?: string
  index?: number
}

export function MetricCard({ label, value, trend, trendValue, subtitle, variant = 'cyan', icon, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -3, boxShadow: variant === 'cyan' ? '0 0 25px rgba(0,200,255,0.2)' : '0 0 25px rgba(123,47,255,0.2)' }}
      className={cn(
        'bg-surface border p-4 relative overflow-hidden cursor-default',
        variant === 'cyan' ? 'border-cyan/30 shadow-[0_0_15px_rgba(0,200,255,0.08)]' : 'border-purple/30 shadow-[0_0_15px_rgba(123,47,255,0.08)]'
      )}
    >
      <motion.div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2',
          variant === 'cyan' ? 'bg-cyan' : 'bg-purple'
        )}
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
      />
      <p className={cn('font-orbitron text-xs uppercase tracking-widest mb-2', variant === 'cyan' ? 'text-cyan' : 'text-purple')}>
        {icon && <span className="mr-1">{icon}</span>}{label}
      </p>
      <motion.p
        className="font-orbitron text-2xl text-text mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {value}
      </motion.p>
      {(trend || subtitle) && (
        <div className="flex items-center gap-2">
          {trend && trendValue && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className={cn('flex items-center gap-0.5 text-xs font-rajdhani', trend === 'up' ? 'text-green' : 'text-red')}
            >
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}
            </motion.span>
          )}
          {subtitle && <span className="text-textMuted text-xs font-rajdhani">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  )
}
