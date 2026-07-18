import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Analytics' }

const AGENT_COLOR: Record<string, string> = {
  FINN: '#00c8ff', SAGE: '#00ff88', ARIA: '#a855f7', MAX: '#ffb800', REX: '#ff2d78',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString()

  const [{ data: chats }, { data: logs }, { data: txs }] = await Promise.all([
    supabase.from('agent_chats').select('agent, created_at').eq('user_id', user.id).eq('role', 'user').gte('created_at', since),
    supabase.from('agent_logs').select('agent, created_at').eq('user_id', user.id).gte('created_at', since),
    supabase.from('transactions').select('created_at').eq('user_id', user.id).gte('created_at', since),
  ])

  const agentCounts = (chats || []).reduce((acc: Record<string, number>, c) => {
    acc[c.agent] = (acc[c.agent] || 0) + 1
    return acc
  }, {})

  const totalMessages = Object.values(agentCounts).reduce((s, n) => s + n, 0)
  const sortedAgents = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])

  const dailyActivity: Record<string, number> = {}
  for (const chat of (chats || [])) {
    const day = chat.created_at.slice(0, 10)
    dailyActivity[day] = (dailyActivity[day] || 0) + 1
  }
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const maxActivity = Math.max(...last7Days.map(d => dailyActivity[d] || 0), 1)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-1">{'// VAULT INTELLIGENCE'}</div>
        <div className="font-orbitron text-2xl text-text">
          USAGE <span className="text-cyan" style={{ textShadow: '0 0 10px rgba(0,200,255,0.4)' }}>ANALYTICS</span>
        </div>
        <div className="font-mono-tech text-[9px] tracking-[2px] text-textMuted mt-1">{'// LAST 30 DAYS'}</div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL MESSAGES', value: totalMessages, color: 'cyan' },
          { label: 'AGENT SESSIONS', value: (logs || []).length, color: 'purple' },
          { label: 'TRANSACTIONS', value: (txs || []).length, color: 'green' },
          { label: 'AGENTS USED', value: Object.keys(agentCounts).length, color: 'yellow' },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative bg-surface border border-cyan/15 p-4">
            <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l border-${color}/40`} />
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r border-${color}/40`} />
            <div className="font-mono-tech text-[9px] tracking-[2px] text-textMuted mb-1">{label}</div>
            <div className={`font-orbitron text-2xl text-${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Agent usage breakdown */}
      <div className="relative bg-surface border border-cyan/20 p-5">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
        <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// AGENT USAGE'}</div>
        {sortedAgents.length === 0 ? (
          <p className="text-textMuted font-rajdhani text-sm">No agent activity yet. <Link href="/agents" className="text-cyan hover:underline">Start chatting →</Link></p>
        ) : (
          <div className="flex flex-col gap-3">
            {(['FINN', 'SAGE', 'ARIA', 'MAX', 'REX'] as const).map(agent => {
              const count = agentCounts[agent] || 0
              const pct = totalMessages > 0 ? (count / totalMessages) * 100 : 0
              return (
                <div key={agent} className="flex items-center gap-3">
                  <div className="font-orbitron text-[10px] w-10 flex-shrink-0" style={{ color: AGENT_COLOR[agent] }}>{agent}</div>
                  <div className="flex-1 h-2 bg-surface2 relative overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: AGENT_COLOR[agent] }} />
                  </div>
                  <div className="font-mono-tech text-[10px] text-textMuted w-16 text-right flex-shrink-0">{count} msg{count !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Daily activity heatmap - last 7 days */}
      <div className="relative bg-surface border border-cyan/20 p-5">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
        <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// DAILY ACTIVITY — LAST 7 DAYS'}</div>
        <div className="flex gap-2 items-end h-20">
          {last7Days.map(day => {
            const count = dailyActivity[day] || 0
            const heightPct = (count / maxActivity) * 100
            const label = new Date(day + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' })
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                  <div
                    className="w-full transition-all duration-500"
                    style={{ height: `${Math.max(heightPct, count > 0 ? 8 : 2)}%`, background: count > 0 ? '#00c8ff' : '#0d2137', minHeight: '2px' }}
                  />
                </div>
                <div className="font-mono-tech text-[8px] text-textMuted">{label}</div>
                <div className="font-mono-tech text-[8px] text-cyan/60">{count || ''}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
