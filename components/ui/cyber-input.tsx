'use client'

import { forwardRef, InputHTMLAttributes, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ label, error, showPasswordToggle, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-cyan text-xs font-orbitron uppercase tracking-widest">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full px-4 py-3 bg-surface border text-text placeholder-textDim font-rajdhani text-base outline-none transition-all duration-200',
              error
                ? 'border-red focus:border-red focus:shadow-[0_0_10px_rgba(255,51,102,0.3)]'
                : 'border-border focus:border-cyan focus:shadow-[0_0_10px_rgba(0,200,255,0.2)]',
              showPasswordToggle && 'pr-12',
              className
            )}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-cyan transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-red text-xs font-rajdhani">{error}</p>
        )}
      </div>
    )
  }
)

CyberInput.displayName = 'CyberInput'
