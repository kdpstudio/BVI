'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="font-mono-tech text-[10px] tracking-[4px] text-red/40 mb-4">{'// SYSTEM ERROR'}</div>
        <h1 className="font-orbitron text-4xl text-red mb-2">VAULT BREACH</h1>
        <p className="text-textMuted font-rajdhani text-sm mb-8">An unexpected error occurred. The incident has been logged.</p>
        <button
          onClick={reset}
          className="font-orbitron text-xs text-cyan border border-cyan/40 px-6 py-3 hover:bg-cyan/10 transition-colors tracking-wider"
        >
          RETRY →
        </button>
      </div>
    </div>
  )
}
