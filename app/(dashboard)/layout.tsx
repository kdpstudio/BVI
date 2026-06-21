import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { format } from 'date-fns'
import { Bell } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, tier, email')
    .eq('id', user.id)
    .single()

  const today = format(new Date(), 'EEEE, dd MMM yyyy').toUpperCase()

  return (
    <div className="flex min-h-screen">
      <Sidebar user={profile || { email: user.email }} />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-border bg-surface/50 flex items-center justify-between px-6 flex-shrink-0">
          <span className="font-orbitron text-xs text-textMuted tracking-widest hidden sm:block">{today}</span>
          <div className="flex items-center gap-3 ml-auto">
            <button className="text-textMuted hover:text-cyan transition-colors">
              <Bell size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-surface2 border border-border flex items-center justify-center text-cyan font-orbitron text-xs">
              {((profile?.full_name || user.email) || 'U')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
