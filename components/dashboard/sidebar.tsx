'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Bot, DollarSign, Receipt, TrendingUp, FolderOpen, Settings, LogOut, Menu, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/supabase/auth'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'COMMAND', icon: LayoutDashboard },
  { href: '/agents', label: 'AGENTS', icon: Bot },
  { href: '/finance', label: 'FINANCE', icon: DollarSign },
  { href: '/tax', label: 'TAX', icon: Receipt },
  { href: '/growth', label: 'GROWTH', icon: TrendingUp },
  { href: '/documents', label: 'DOCUMENTS', icon: FolderOpen },
  { href: '/settings', label: 'SETTINGS', icon: Settings },
]

const TIER_STYLES: Record<string, string> = {
  free: 'bg-textDim text-textMuted',
  solo: 'bg-cyan/20 text-cyan border border-cyan/30',
  studio: 'bg-purple/20 text-purple border border-purple/30',
  agency: 'bg-yellow/20 text-yellow border border-yellow/30',
}

interface SidebarProps {
  user?: { full_name?: string | null; tier?: string | null; email?: string }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const tier = user?.tier || 'free'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="font-orbitron text-xl text-cyan tracking-[0.2em]">BVI</div>
        <div className="text-textMuted text-xs font-rajdhani tracking-widest mt-0.5">INTELLIGENCE PLATFORM</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-orbitron tracking-wider transition-all duration-150',
                active
                  ? 'text-cyan bg-cyan/5 border-l-2 border-cyan pl-[10px]'
                  : 'text-textMuted hover:text-text border-l-2 border-transparent pl-[10px]'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-cyan font-orbitron text-sm">
            {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-text text-sm font-rajdhani truncate">{user?.full_name || user?.email}</div>
            <span className={cn('text-xs font-orbitron px-1.5 py-0.5 rounded-sm uppercase', TIER_STYLES[tier])}>
              {tier}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-textMuted text-xs font-orbitron hover:text-red transition-colors w-full"
        >
          <LogOut size={12} />
          SIGN OUT
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-surface border border-border p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} className="text-cyan" /> : <Menu size={18} className="text-cyan" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-40 transition-transform duration-200 md:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 bg-surface border-r border-border h-screen sticky top-0 flex-col">
        <SidebarContent />
      </div>
    </>
  )
}
