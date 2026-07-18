import { createClient } from '@/lib/supabase/server'
import { AgentBadge } from '@/components/ui/agent-badge'
import { Agent } from '@/types'
import Link from 'next/link'
import { getWeatherEmoji } from '@/lib/weather'
import { calculateHealthScore } from '@/lib/aria/health'
import { timeAgo } from '@/lib/utils'
import { HealthRing } from '@/components/dashboard/health-ring'
import { DashboardMetrics } from '@/components/dashboard/dashboard-metrics'
import { BriefTrigger } from '@/components/dashboard/brief-trigger'

const AGENTS: { id: Agent; emoji: string; role: string }[] = [
  { id: 'FINN', emoji: '💰', role: 'AI Chief Financial Officer' },
  { id: 'SAGE', emoji: '🧾', role: 'AI Tax Advisor' },
  { id: 'ARIA', emoji: '💼', role: 'AI Chief Executive Officer' },
  { id: 'MAX', emoji: '📈', role: 'AI Growth Manager' },
  { id: 'REX', emoji: '🗂️', role: 'AI Operations Manager' },
]

const AGENT_STATUS: Record<Agent, string> = {
  FINN: 'RUNNING',
  SAGE: 'READY',
  ARIA: 'ACTIVE',
  MAX: 'SCANNING',
  REX: 'READY',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`
  const prevMonthDate = new Date(monthStart)
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
  const prevStart = prevMonthDate.toISOString().slice(0, 10)

  const [
    { data: brief },
    { data: txs },
    { data: prevTxs },
    { data: recentTxs },
    { data: agentLogs },
  ] = await Promise.all([
    supabase.from('daily_briefs').select('*').eq('user_id', user.id).eq('date', today).single(),
    supabase.from('transactions').select('amount, amount_gbp, type').eq('user_id', user.id).gte('date', monthStart),
    supabase.from('transactions').select('amount, type').eq('user_id', user.id).gte('date', prevStart).lt('date', monthStart),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
    supabase.from('agent_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
  ])

  const income = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp || t.amount), 0)
  const expenses = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount_gbp || t.amount), 0)
  const prevIncome = (prevTxs || []).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const net = income - expenses
  const margin = income > 0 ? ((net) / income) * 100 : 0
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0
  const cashRunwayMonths = expenses > 0 ? net / expenses * 3 : 0
  const taxEst = income * 0.20

  const healthData = calculateHealthScore({
    income, prevIncome, margin, cashRunwayMonths,
    txCount: txs?.length || 0, prevTxCount: prevTxs?.length || 0, taxCompliant: true,
  })

  const weather = brief?.weather as { city?: string; temp?: number; feels_like?: number; description?: string; icon?: string } | null
  const ariaBrief = brief?.aria_brief as string | null

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const agentLastAction: Record<Agent, string> = {
    FINN: 'No activity yet', SAGE: 'No activity yet', ARIA: 'No activity yet',
    MAX: 'No activity yet', REX: 'No activity yet',
  }
  for (const log of (agentLogs || [])) {
    if (agentLastAction[log.agent as Agent] === 'No activity yet') {
      agentLastAction[log.agent as Agent] = log.action
    }
  }

  const metricsData = [
    {
      label: 'MONTHLY REVENUE',
      value: income > 0 ? fmt(income) : '—',
      change: prevIncome > 0 ? `${incomeChange >= 0 ? '▲' : '▼'} ${Math.abs(incomeChange).toFixed(1)}% vs last month` : undefined,
      changePositive: incomeChange >= 0,
      barPct: Math.min((income / (income + expenses || 1)) * 100, 100),
      barStyle: 'cyan' as const,
    },
    {
      label: 'TAX LIABILITY',
      value: income > 0 ? fmt(taxEst) : '—',
      change: 'EST. 20% RATE',
      changePositive: null,
      barPct: 42,
      barStyle: 'gold' as const,
    },
    {
      label: 'NET PROFIT',
      value: income > 0 ? fmt(net) : '—',
      change: income > 0 ? `▲ MARGIN ${margin.toFixed(1)}%` : undefined,
      changePositive: true,
      barPct: Math.max(0, Math.min(margin, 100)),
      barStyle: 'green' as const,
    },
    {
      label: 'CASH RUNWAY',
      value: cashRunwayMonths > 0 ? `${cashRunwayMonths.toFixed(1)}mo` : '—',
      change: cashRunwayMonths >= 6 ? '◈ STRONG POSITION' : cashRunwayMonths >= 3 ? '◈ STABLE POSITION' : '◈ LOW RUNWAY',
      changePositive: cashRunwayMonths >= 3,
      barPct: Math.min(cashRunwayMonths * 10, 100),
      barStyle: 'purple' as const,
    },
  ]

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <BriefTrigger />

      {/* Page header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-orbitron text-lg font-bold tracking-[3px]" style={{ color: 'rgba(200,230,255,0.9)' }}>
            VAULT <span style={{ color: '#00c8ff', textShadow: '0 0 10px #00c8ff' }}>OVERVIEW</span>
          </div>
          <div className="font-mono-tech text-[9px] tracking-[2px] mt-1" style={{ color: 'rgba(100,140,170,0.4)' }}>
            {'// '}{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase()} &nbsp;{'|'}&nbsp;
            {weather?.temp !== undefined ? `${getWeatherEmoji(weather.icon || '')} ${weather.temp}°C ${weather.city || ''}` : 'WEATHER LOADING'}
            &nbsp;{'|'}&nbsp; UPTIME 99.8%
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/finance" className="px-4 py-2 font-orbitron text-[11px] tracking-[2px] border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors"
            style={{ boxShadow: '0 0 10px rgba(0,200,255,0.15)' }}>
            + ADD TRANSACTION
          </Link>
          <Link href="/agents/finn" className="px-4 py-2 font-orbitron text-[11px] tracking-[2px] border border-cyan/40 text-cyan hover:bg-cyan/10 transition-colors">
            ASK FINN
          </Link>
        </div>
      </div>

      {/* Metrics row */}
      <DashboardMetrics metrics={metricsData} />

      {/* 3-col content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-4 flex-1">

        {/* LEFT — Agent Roster */}
        <div className="relative border border-cyan/15 overflow-hidden" style={{ background: '#060f1a' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.4), transparent)' }} />
          <div className="flex items-center justify-between px-4 py-3 border-b border-cyan/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <span className="font-orbitron text-[11px] tracking-[3px] text-textDim">{'// '}AGENT <span className="text-cyan">ROSTER</span></span>
            <span className="font-mono-tech text-[9px] px-2 py-0.5 border tracking-[2px]"
              style={{ borderColor: 'rgba(0,255,136,0.3)', color: 'rgba(0,255,136,0.6)' }}>ALL SYSTEMS GO</span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {AGENTS.map(agent => (
              <Link key={agent.id} href={`/agents/${agent.id.toLowerCase()}`}>
                <div className="flex items-center gap-3 p-3 border border-cyan/10 hover:border-cyan/30 transition-all cursor-pointer relative overflow-hidden"
                  style={{ background: '#081220' }}>
                  <div className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.15), transparent)' }} />
                  {/* Avatar */}
                  <div className="w-10 h-10 flex items-center justify-center border font-orbitron text-[10px] font-bold flex-shrink-0"
                    style={AGENT_AVATAR_STYLE[agent.id]}>
                    {agent.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-orbitron text-[11px] font-bold tracking-[2px] mb-0.5" style={{ color: AGENT_COLOR[agent.id] }}>
                      {agent.id}
                    </div>
                    <div className="text-[11px] text-textDim font-medium">{agent.role}</div>
                    <div className="font-mono-tech text-[9px] text-textMuted mt-0.5 truncate">
                      ↳ {agentLastAction[agent.id]}
                    </div>
                  </div>
                  <div className="font-mono-tech text-[9px] px-2 py-1 border flex-shrink-0 tracking-wider"
                    style={AGENT_BADGE_STYLE[AGENT_STATUS[agent.id] as keyof typeof AGENT_BADGE_STYLE]}>
                    {AGENT_STATUS[agent.id]}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* MIDDLE — ARIA Brief + Activity Log */}
        <div className="flex flex-col gap-4">

          {/* ARIA Brief */}
          <div className="relative border border-cyan/15 overflow-hidden flex-1" style={{ background: '#060f1a' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.4), transparent)' }} />
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <span className="font-orbitron text-[11px] tracking-[3px] text-textDim">{'// '}ARIA <span className="text-purple-400">MORNING BRIEF</span></span>
              <span className="font-mono-tech text-[9px] px-2 py-0.5 border badge-pulse tracking-[2px]"
                style={{ borderColor: 'rgba(0,200,255,0.3)', color: 'rgba(0,200,255,0.7)' }}>ARIA ONLINE</span>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-purple/40 font-orbitron text-[11px] font-bold text-purple flex-shrink-0"
                  style={{ background: 'rgba(123,47,255,0.05)' }}>
                  ARIA
                </div>
                <div>
                  <div className="font-orbitron text-[9px] text-purple tracking-[2px] mb-2">{'ARIA // MORNING BRIEF'}</div>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(200,230,255,0.85)' }}>
                    {ariaBrief || `Good morning, ${profile?.full_name?.split(' ')[0] || 'there'}. Your vault is ready. ${income > 0 ? `Revenue this month: ${fmt(income)}. Net profit: ${fmt(net)}.` : 'Upload transactions to unlock full financial intelligence.'}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="relative border border-cyan/15 overflow-hidden" style={{ background: '#060f1a' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.4), transparent)' }} />
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <span className="font-orbitron text-[11px] tracking-[3px] text-textDim">{'// '}AGENT <span className="text-cyan">ACTIVITY LOG</span></span>
              <span className="font-mono-tech text-[9px] px-2 py-0.5 border badge-pulse tracking-[2px]"
                style={{ borderColor: 'rgba(0,255,136,0.3)', color: 'rgba(0,255,136,0.6)' }}>LIVE FEED</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {(agentLogs || []).length === 0 ? (
                <p className="px-4 py-6 text-textMuted text-sm font-rajdhani">No agent activity yet. Start chatting with your agents.</p>
              ) : (
                (agentLogs || []).slice(0, 6).map((log, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-cyan/[0.02] transition-colors">
                    <span className="font-mono-tech text-[9px] text-textMuted whitespace-nowrap mt-0.5 w-12 flex-shrink-0">
                      {timeAgo(log.created_at)}
                    </span>
                    <AgentBadge agent={log.agent as Agent} />
                    <span className="text-[11px] text-textDim leading-snug">{log.action}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Health + Transactions */}
        <div className="flex flex-col gap-4">

          {/* Health ring */}
          <div className="relative border border-cyan/15 overflow-hidden" style={{ background: '#060f1a' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,47,255,0.5), transparent)' }} />
            <div className="px-4 py-3 border-b border-cyan/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <span className="font-orbitron text-[11px] tracking-[3px] text-textDim">{'// '}BUSINESS <span style={{ color: '#a855f7' }}>HEALTH</span></span>
            </div>
            <div className="p-4">
              <HealthRing score={healthData.score} breakdown={healthData.breakdown} />
            </div>
          </div>

          {/* Recent transactions */}
          <div className="relative border border-cyan/15 overflow-hidden" style={{ background: '#060f1a' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.4), transparent)' }} />
            <div className="flex items-center justify-between px-4 py-3 border-b border-cyan/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <span className="font-orbitron text-[11px] tracking-[3px] text-textDim">{'// '}RECENT <span className="text-cyan">TRANSACTIONS</span></span>
              <Link href="/finance" className="font-mono-tech text-[9px] px-2 py-0.5 border tracking-[2px] transition-colors hover:border-cyan/40"
                style={{ borderColor: 'rgba(0,200,255,0.2)', color: 'rgba(0,200,255,0.6)' }}>FINN LIVE</Link>
            </div>
            {(recentTxs || []).length === 0 ? (
              <div className="px-4 py-6 text-textMuted text-sm font-rajdhani">
                No transactions yet. <Link href="/finance" className="text-cyan hover:underline">Upload →</Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {(recentTxs || []).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-cyan/[0.02] transition-colors cursor-pointer">
                    <div>
                      <div className="text-[12px] font-semibold tracking-wider truncate max-w-[120px]"
                        style={{ color: 'rgba(200,230,255,0.9)' }}>{tx.description}</div>
                      <div className="font-mono-tech text-[9px] tracking-[1px] uppercase mt-0.5"
                        style={{ color: 'rgba(100,140,170,0.4)' }}>{'// '}{tx.category || 'OTHER'}</div>
                    </div>
                    <div className="font-orbitron text-[13px] font-semibold"
                      style={{ color: tx.type === 'income' ? '#00ff88' : '#ff2d78' }}>
                      {tx.type === 'income' ? '+' : '-'}£{Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

const AGENT_COLOR: Record<Agent, string> = {
  FINN: '#00c8ff',
  SAGE: '#00ff88',
  ARIA: '#a855f7',
  MAX: '#ffb800',
  REX: '#ff2d78',
}

const AGENT_AVATAR_STYLE: Record<Agent, React.CSSProperties> = {
  FINN: { borderColor: 'rgba(0,200,255,0.5)', color: '#00c8ff', background: 'rgba(0,200,255,0.05)' },
  SAGE: { borderColor: 'rgba(0,255,136,0.5)', color: '#00ff88', background: 'rgba(0,255,136,0.05)' },
  ARIA: { borderColor: 'rgba(168,85,247,0.5)', color: '#a855f7', background: 'rgba(168,85,247,0.05)' },
  MAX:  { borderColor: 'rgba(255,184,0,0.5)',  color: '#ffb800', background: 'rgba(255,184,0,0.05)' },
  REX:  { borderColor: 'rgba(255,45,120,0.5)', color: '#ff2d78', background: 'rgba(255,45,120,0.05)' },
}

const AGENT_BADGE_STYLE = {
  RUNNING:  { background: 'rgba(0,200,255,0.08)',  borderColor: 'rgba(0,200,255,0.3)',  color: '#00c8ff',  animation: 'badgePulse 2s ease-in-out infinite' },
  SCANNING: { background: 'rgba(0,200,255,0.08)',  borderColor: 'rgba(0,200,255,0.3)',  color: '#00c8ff',  animation: 'badgePulse 2s ease-in-out infinite' },
  ACTIVE:   { background: 'rgba(0,255,136,0.08)',  borderColor: 'rgba(0,255,136,0.3)',  color: '#00ff88' },
  READY:    { background: 'rgba(0,255,136,0.08)',  borderColor: 'rgba(0,255,136,0.3)',  color: '#00ff88' },
}
