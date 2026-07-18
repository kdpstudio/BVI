'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

const ITEMS = [
  { label: 'Dashboard', path: '/dashboard', group: 'Pages' },
  { label: 'Finance', path: '/finance', group: 'Pages' },
  { label: 'Tax Intelligence', path: '/tax', group: 'Pages' },
  { label: 'Document Forge', path: '/documents', group: 'Pages' },
  { label: 'Analytics', path: '/analytics', group: 'Pages' },
  { label: 'Settings', path: '/settings', group: 'Pages' },
  { label: 'Pricing', path: '/pricing', group: 'Pages' },
  { label: 'FINN — AI CFO', path: '/agents/finn', group: 'Agents' },
  { label: 'SAGE — Tax Advisor', path: '/agents/sage', group: 'Agents' },
  { label: 'ARIA — Chief of Staff', path: '/agents/aria', group: 'Agents' },
  { label: 'MAX — Growth Manager', path: '/agents/max', group: 'Agents' },
  { label: 'REX — Operations', path: '/agents/rex', group: 'Agents' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : ITEMS

  const navigate = useCallback((path: string) => {
    router.push(path)
    setOpen(false)
    setQuery('')
    setSelected(0)
  }, [router])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && filtered[selected]) navigate(filtered[selected].path)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
          style={{ background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg bg-surface border border-cyan/30 overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(0,200,255,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={14} className="text-cyan/60 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Navigate to..."
                className="flex-1 bg-transparent text-text font-rajdhani text-sm outline-none placeholder-textDim"
              />
              <button onClick={() => setOpen(false)} className="text-textMuted hover:text-text transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-textMuted font-rajdhani text-sm">No results</div>
              ) : (
                (() => {
                  const groups = filtered.map(i => i.group).filter((g, idx, arr) => arr.indexOf(g) === idx)
                  let globalIdx = 0
                  return Array.from(groups).map(group => (
                    <div key={group}>
                      <div className="px-4 py-1.5 font-mono-tech text-[9px] tracking-[3px] text-cyan/40 border-b border-border/30">
                        {group.toUpperCase()}
                      </div>
                      {filtered.filter(i => i.group === group).map(item => {
                        const idx = globalIdx++
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={() => setSelected(idx)}
                            className={`w-full text-left px-4 py-2.5 font-rajdhani text-sm transition-colors flex items-center justify-between ${
                              selected === idx ? 'bg-cyan/10 text-cyan' : 'text-text hover:bg-surface2'
                            }`}
                          >
                            {item.label}
                            {selected === idx && <span className="font-mono-tech text-[9px] text-cyan/40">↵</span>}
                          </button>
                        )
                      })}
                    </div>
                  ))
                })()
              )}
            </div>

            <div className="px-4 py-2 border-t border-border flex items-center gap-4 bg-surface2">
              <span className="font-mono-tech text-[9px] text-textDim">↑↓ navigate</span>
              <span className="font-mono-tech text-[9px] text-textDim">↵ select</span>
              <span className="font-mono-tech text-[9px] text-textDim ml-auto">⌘K to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
