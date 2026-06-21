'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'purple' | 'ghost' | 'danger'
  loading?: boolean
  fullWidth?: boolean
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ variant = 'cyan', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    const variants = {
      cyan: 'bg-cyan text-background border-cyan hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,200,255,0.4)]',
      purple: 'bg-purple text-white border-purple hover:brightness-110 hover:shadow-[0_0_20px_rgba(123,47,255,0.4)]',
      ghost: 'bg-transparent text-cyan border-cyan hover:bg-cyanGlow',
      danger: 'bg-red text-white border-red hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,51,102,0.4)]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'px-6 py-3 border font-orbitron text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2',
          variants[variant],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </button>
    )
  }
)

CyberButton.displayName = 'CyberButton'
