import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { CyberBackground } from '@/components/ui/cyber-background'
import { format } from 'date-fns'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, tier, email')
    .eq('id', user.id)
    .single()

  const today = format(new Date(), 'EEE dd.MM.yyyy').toUpperCase()
  const tier = profile?.tier || 'free'
  const displayName = (profile?.full_name || user.email || 'USER').toUpperCase()

  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      <CyberBackground />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="relative flex-shrink-0 h-14 bg-surface/95 backdrop-blur border-b border-cyan/25 flex items-center px-6 gap-5">
          {/* Animated bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
            <div
              className="h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #00c8ff, #7b2fff, transparent)',
                animation: 'topbarScan 4s linear infinite',
              }}
            />
          </div>

          {/* Date + system tags */}
          <div className="flex items-center gap-4">
            <span className="font-mono-tech text-[9px] text-textMuted tracking-[3px] hidden md:block">{'// '}{today}</span>
            <span className="font-mono-tech text-[9px] text-textMuted tracking-[2px] px-2.5 py-1 border border-cyan/15 hidden lg:block">
              SYSTEM ONLINE
            </span>
            <span className="font-mono-tech text-[9px] tracking-[2px] px-2.5 py-1 border border-green/20 text-green/60 hidden lg:block">
              5 AGENTS ACTIVE
            </span>
          </div>

          {/* Agent status indicators */}
          <div className="ml-auto flex items-center gap-5">
            <div className="hidden md:flex items-center gap-1.5 font-mono-tech text-[10px] text-textDim">
              <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_6px_#00ff88] status-blink" />
              FINN ACTIVE
            </div>
            <div className="hidden md:flex items-center gap-1.5 font-mono-tech text-[10px] text-textDim">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_#ffb800] status-blink" style={{ animationDelay: '0.7s' }} />
              SAGE STANDBY
            </div>
            <div className="hidden lg:flex items-center gap-1.5 font-mono-tech text-[10px] text-textDim">
              <span className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_6px_#00ff88] status-blink" style={{ animationDelay: '1.4s' }} />
              ARIA ACTIVE
            </div>

            {/* User badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan/15 bg-cyan/5 font-mono-tech text-[11px] text-cyan/70 tracking-wider">
              ◈ &nbsp;{displayName.split(' ')[0]} &nbsp;//&nbsp; {tier.toUpperCase()} TIER
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
