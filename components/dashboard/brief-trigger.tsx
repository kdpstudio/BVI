'use client'

import { useEffect } from 'react'

export function BriefTrigger() {
  useEffect(() => {
    fetch('/api/daily-brief').catch(() => null)
  }, [])
  return null
}
