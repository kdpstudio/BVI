import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  trend?: 'up' | 'down'
  trendValue?: string
  subtitle?: string
  variant?: 'cyan' | 'purple'
  icon?: string
}

export function MetricCard({ label, value, trend, trendValue, subtitle, variant = 'cyan', icon }: MetricCardProps) {
  return (
    <div className={cn(
      'bg-surface border p-4 relative overflow-hidden',
      variant === 'cyan' ? 'border-cyan/30 shadow-[0_0_15px_rgba(0,200,255,0.08)]' : 'border-purple/30 shadow-[0_0_15px_rgba(123,47,255,0.08)]'
    )}>
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2',
        variant === 'cyan' ? 'bg-cyan' : 'bg-purple'
      )} />
      <p className={cn('font-orbitron text-xs uppercase tracking-widest mb-2', variant === 'cyan' ? 'text-cyan' : 'text-purple')}>
        {icon && <span className="mr-1">{icon}</span>}{label}
      </p>
      <p className="font-orbitron text-2xl text-text mb-1">{value}</p>
      {(trend || subtitle) && (
        <div className="flex items-center gap-2">
          {trend && trendValue && (
            <span className={cn('flex items-center gap-0.5 text-xs font-rajdhani', trend === 'up' ? 'text-green' : 'text-red')}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trendValue}
            </span>
          )}
          {subtitle && <span className="text-textMuted text-xs font-rajdhani">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
