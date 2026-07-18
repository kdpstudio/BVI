'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full py-24 px-6 text-center">
      <div className="font-mono-tech text-[10px] tracking-[4px] text-red/40 mb-4">{'// AGENT ERROR'}</div>
      <h2 className="font-orbitron text-2xl text-red mb-2" style={{ textShadow: '0 0 15px rgba(255,45,120,0.3)' }}>
        SYSTEM FAULT
      </h2>
      <p className="text-textMuted font-rajdhani text-sm mb-2 max-w-xs">
        Something went wrong loading this section. Your data is safe.
      </p>
      {error.digest && (
        <p className="font-mono-tech text-[9px] text-textDim mb-8 tracking-widest">REF: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="font-orbitron text-xs text-cyan border border-cyan/40 px-5 py-2.5 hover:bg-cyan/10 transition-colors tracking-wider"
        >
          RETRY →
        </button>
        <Link
          href="/dashboard"
          className="font-orbitron text-xs text-textMuted border border-border px-5 py-2.5 hover:border-cyan/30 hover:text-text transition-colors tracking-wider"
        >
          DASHBOARD
        </Link>
      </div>
    </div>
  )
}
