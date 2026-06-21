import { cn } from '@/lib/utils'

interface CyberCardProps {
  children: React.ReactNode
  variant?: 'cyan' | 'purple' | 'ghost'
  className?: string
  title?: string
  subtitle?: string
}

export function CyberCard({ children, variant = 'cyan', className, title, subtitle }: CyberCardProps) {
  const variants = {
    cyan: 'border-cyan/30 shadow-[0_0_15px_rgba(0,200,255,0.1)]',
    purple: 'border-purple/30 shadow-[0_0_15px_rgba(123,47,255,0.1)]',
    ghost: 'border-border',
  }

  return (
    <div className={cn('bg-surface border p-4', variants[variant], className)}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h3 className={cn(
              'font-orbitron text-xs uppercase tracking-widest',
              variant === 'purple' ? 'text-purple' : 'text-cyan'
            )}>
              {title}
            </h3>
          )}
          {subtitle && <p className="text-textMuted text-xs mt-1 font-rajdhani">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
