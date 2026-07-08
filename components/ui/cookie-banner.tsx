'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('bvi-cookie-consent')
    if (!consent) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem('bvi-cookie-consent', 'accepted')
    setShow(false)
  }

  function decline() {
    localStorage.setItem('bvi-cookie-consent', 'essential-only')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan/20 bg-background/95 backdrop-blur p-4 md:p-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="font-orbitron text-xs text-cyan mb-1 tracking-widest">{'// COOKIE NOTICE'}</p>
          <p className="text-textMuted font-rajdhani text-sm">
            We use essential cookies to keep you logged in, and functional cookies to remember your preferences.
            No tracking or advertising cookies. See our{' '}
            <Link href="/cookies" className="text-cyan hover:underline">Cookie Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="font-orbitron text-xs text-textMuted border border-border px-4 py-2 hover:border-cyan/40 hover:text-text transition-colors"
          >
            ESSENTIAL ONLY
          </button>
          <button
            onClick={accept}
            className="font-orbitron text-xs text-cyan border border-cyan/40 px-4 py-2 hover:bg-cyan/10 transition-colors"
          >
            ACCEPT ALL
          </button>
        </div>
      </div>
    </div>
  )
}
