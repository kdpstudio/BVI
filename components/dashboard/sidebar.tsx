'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { signOut } from '@/lib/supabase/auth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'OVERVIEW', symbol: '⬡', badge: 'LIVE' },
  { href: '/agents', label: 'AGENTS', symbol: '◈', badge: '5' },
  { href: '/finance', label: 'FINANCE', symbol: '▦' },
  { href: '/tax', label: 'TAX VAULT', symbol: '◎' },
  { href: '/growth', label: 'GROWTH', symbol: '⟁' },
  { href: '/documents', label: 'DOCUMENTS', symbol: '⊡' },
  { href: '/clients', label: 'CLIENTS', symbol: '⊞' },
  { href: '/invoice', label: 'INVOICES', symbol: '🧾' },
  { href: '/analytics', label: 'ANALYTICS', symbol: '◬' },
]

const AGENT_MINI = [
  { name: 'FINN', status: 'PROCESSING 47 TXN', color: '#00c8ff' },
  { name: 'SAGE', status: 'VAT CALC READY', color: '#00ff88' },
  { name: 'ARIA', status: 'WEEKLY BRIEF SENT', color: '#a855f7' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-cyan/15">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 border border-cyan flex items-center justify-center"
            style={{
              transform: 'rotate(45deg)',
              boxShadow: '0 0 10px rgba(0,200,255,0.2), inset 0 0 10px rgba(0,200,255,0.1)',
              animation: 'logoPulse 3s ease-in-out infinite',
            }}
          >
            <div className="w-3 h-3 bg-cyan opacity-80" style={{ transform: 'rotate(0deg)' }} />
          </div>
          <div>
            <div className="font-orbitron text-sm font-bold text-cyan tracking-[3px]" style={{ textShadow: '0 0 10px #00c8ff' }}>BVI</div>
            <div className="font-mono-tech text-[8px] text-textMuted tracking-[2px] mt-0.5">BLACK VAULT INTELLIGENCE</div>
          </div>
        </div>
      </div>

      {/* Sidebar glow line */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <div
          className="absolute top-0 right-0 w-px h-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent, #00c8ff, #7b2fff, transparent)',
            animation: 'sidebarGlow 6s ease-in-out infinite',
          }}
        />

        {/* Nav section */}
        <div className="px-0 pt-4 pb-1">
          <div className="px-5 mb-2 font-mono-tech text-[9px] text-textMuted tracking-[3px]">{'// COMMAND'}</div>
          {NAV.map(({ href, label, symbol, badge }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-5 py-2.5 relative transition-all duration-150 text-[13px] font-medium tracking-wider',
                  active
                    ? 'text-cyan bg-cyan/5'
                    : 'text-textDim hover:text-text hover:bg-cyan/[0.03]'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan" style={{ boxShadow: '0 0 8px #00c8ff' }} />
                )}
                <span className="w-5 text-center text-sm leading-none">{symbol}</span>
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="font-mono-tech text-[9px] px-1.5 py-0.5 border tracking-wider"
                    style={{ background: 'rgba(0,200,255,0.08)', borderColor: 'rgba(0,200,255,0.25)', color: '#00c8ff' }}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Agent mini status */}
        <div className="px-0 pt-4 pb-2">
          <div className="px-5 mb-2 font-mono-tech text-[9px] text-textMuted tracking-[3px]">{'// AGENT STATUS'}</div>
          <div className="flex flex-col gap-2 px-3">
            {AGENT_MINI.map(a => (
              <div
                key={a.name}
                className="px-3 py-2.5 border relative overflow-hidden"
                style={{ background: '#081220', borderColor: 'rgba(0,200,255,0.12)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${a.color}50, transparent)` }} />
                <div className="font-orbitron text-[10px] font-bold tracking-[2px] mb-1" style={{ color: a.color }}>{a.name}</div>
                <div className="font-mono-tech text-[9px] flex items-center gap-1.5" style={{ color: `${a.color}90` }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full status-blink" style={{ background: a.color }} />
                  {a.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings + signout at bottom */}
        <div className="mt-auto border-t border-cyan/10">
          <Link href="/settings" className="flex items-center gap-2.5 px-5 py-3 text-[13px] text-textDim hover:text-text tracking-wider transition-colors">
            <span className="w-5 text-center">⚙</span> SETTINGS
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-5 py-3 text-[13px] text-textMuted hover:text-red transition-colors w-full tracking-wider"
          >
            <span className="w-5 text-center text-xs">⏻</span> SIGN OUT
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden border border-cyan/30 bg-surface p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={16} className="text-cyan" /> : <Menu size={16} className="text-cyan" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed left-0 top-0 h-full w-[220px] z-40 transition-transform duration-200 md:hidden',
        'border-r border-cyan/15',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )} style={{ background: '#060f1a' }}>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex w-[220px] flex-shrink-0 flex-col h-full border-r border-cyan/15"
        style={{ background: '#060f1a' }}
      >
        <NavContent />
      </div>
    </>
  )
}
