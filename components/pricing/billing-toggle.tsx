'use client'

import { cn } from '@/lib/utils'

type BillingCycle = 'monthly' | 'annual' | 'lifetime'

export function BillingToggle({ value, onChange }: { value: BillingCycle; onChange: (v: BillingCycle) => void }) {
  const options: { value: BillingCycle; label: string; badge?: string }[] = [
    { value: 'monthly', label: 'MONTHLY' },
    { value: 'annual', label: 'ANNUAL', badge: 'SAVE 37%' },
    { value: 'lifetime', label: 'LIFETIME', badge: 'BEST VALUE' },
  ]

  return (
    <div className="flex border border-border">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2.5 font-orbitron text-xs uppercase tracking-wider transition-all relative',
            value === opt.value
              ? 'bg-cyan text-background'
              : 'text-textMuted hover:text-text'
          )}
        >
          {opt.label}
          {opt.badge && (
            <span className={cn(
              'absolute -top-2 -right-1 text-[9px] px-1 font-orbitron',
              value === opt.value ? 'bg-background text-cyan' : 'bg-cyan/20 text-cyan'
            )}>
              {opt.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
