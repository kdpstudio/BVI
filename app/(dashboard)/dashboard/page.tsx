import { createClient } from '@/lib/supabase/server'
import { CyberCard } from '@/components/ui/cyber-card'
import { MetricCard } from '@/components/ui/metric-card'
import { AgentBadge } from '@/components/ui/agent-badge'
import { StatusDot } from '@/components/ui/status-dot'
import { Agent } from '@/types'
import Link from 'next/link'
import { getWeatherEmoji } from '@/lib/weather'
import { calculateHealthScore } from '@/lib/aria/health'
import { timeAgo, formatDate } from '@/lib/utils'

const AGENTS: { id: Agent; emoji: string; role: string }[] = [
  { id: 'FINN', emoji: '💰', role: 'AI CFO' },
  { id: 'SAGE', emoji: '🧾', role: 'AI Tax Advisor' },
  { id: 'ARIA', emoji: '💼', role: 'AI CEO Advisor' },
  { id: 'MAX', emoji: '📈', role: 'AI Growth Manager' },
  { id: 'REX', emoji: '🗂️', role: 'AI Operations Manager' },
]

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

  const avgMonthlyExpenses = expenses || 1
  const cashRunwayMonths = expenses > 0 ? net / avgMonthlyExpenses * 3 : 0

  const healthData = calculateHealthScore({
    income, prevIncome, margin, cashRunwayMonths,
    txCount: txs?.length || 0, prevTxCount: prevTxs?.length || 0, taxCompliant: true,
  })

  const weather = brief?.weather as { city?: string; temp?: number; feels_like?: number; description?: string; icon?: string; humidity?: number } | null
  const news = (brief?.news as { title: string; source: string; publishedAt: string }[]) || []
  const ariaBrief = brief?.aria_brief

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const agentLastAction: Record<Agent, string> = { FINN: 'No activity yet', SAGE: 'No activity yet', ARIA: 'No activity yet', MAX: 'No activity yet', REX: 'No activity yet' }
  for (const log of (agentLogs || [])) {
    if (!agentLastAction[log.agent as Agent] || agentLastAction[log.agent as Agent] === 'No activity yet') {
      agentLastAction[log.agent as Agent] = log.action
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1 — Intelligence Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CyberCard variant="cyan" title="LOCAL CONDITIONS">
          {weather?.temp !== undefined ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getWeatherEmoji(weather.icon || 'Clouds')}</span>
              <div>
                <div className="font-orbitron text-2xl text-text">{weather.temp}°C</div>
                <div className="text-textMuted text-sm font-rajdhani">{weather.city} · {weather.description}</div>
                <div className="text-textMuted text-xs font-rajdhani mt-0.5">Feels like {weather.feels_like}°C · Humidity {weather.humidity}%</div>
              </div>
            </div>
          ) : (
            <p className="text-textMuted text-sm font-rajdhani">Weather unavailable</p>
          )}
        </CyberCard>

        <CyberCard variant="purple" title="MARKET INTELLIGENCE">
          {news.length > 0 ? (
            <div className="flex flex-col gap-3">
              {news.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-purple text-xs font-orbitron bg-purple/10 border border-purple/20 px-1.5 py-0.5 flex-shrink-0">{item.source?.slice(0, 4)}</span>
                  <div>
                    <p className="text-text text-xs font-rajdhani leading-tight">{item.title}</p>
                    <p className="text-textMuted text-xs">{timeAgo(item.publishedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-textMuted text-sm font-rajdhani">News feed unavailable</p>
          )}
        </CyberCard>

        <CyberCard variant="purple" title="ARIA — MORNING BRIEF">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💼</span>
            <StatusDot status="active" label />
          </div>
          <p className="text-text text-sm font-rajdhani leading-relaxed">
            {ariaBrief || `Good morning, ${profile?.full_name?.split(' ')[0] || 'there'}. Your dashboard is ready. Upload transactions to unlock full intelligence.`}
          </p>
        </CyberCard>
      </div>

      {/* Section 2 — Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Monthly Revenue" value={income > 0 ? fmt(income) : '—'} trend={incomeChange >= 0 ? 'up' : 'down'} trendValue={prevIncome > 0 ? `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}%` : undefined} icon="💰" />
        <MetricCard label="Net Profit" value={income > 0 ? fmt(net) : '—'} subtitle={income > 0 ? `${margin.toFixed(0)}% margin` : undefined} variant="purple" />
        <MetricCard label="Tax Liability" value={income > 0 ? fmt(income * 0.20) : '—'} subtitle="Est. (20% rate)" />
        <MetricCard label="Cash Runway" value={cashRunwayMonths > 0 ? `${cashRunwayMonths.toFixed(1)} mo` : '—'} subtitle={cashRunwayMonths >= 6 ? 'Healthy' : cashRunwayMonths >= 3 ? 'Monitor' : 'Low'} variant="purple" />
      </div>

      {/* Section 3 — Agent Roster */}
      <div>
        <h2 className="font-orbitron text-xs text-cyan uppercase tracking-widest mb-3">AGENT ROSTER</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {AGENTS.map(agent => (
            <div key={agent.id} className="bg-surface border border-border p-4 hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(0,200,255,0.1)] transition-all">
              <div className="text-3xl mb-2">{agent.emoji}</div>
              <div className="font-orbitron text-sm text-text mb-0.5">{agent.id}</div>
              <div className="text-textMuted text-xs font-rajdhani mb-2">{agent.role}</div>
              <StatusDot status="active" label />
              <p className="text-textDim text-xs font-rajdhani mt-2 leading-tight line-clamp-2">{agentLastAction[agent.id]}</p>
              <Link href={`/agents/${agent.id.toLowerCase()}`} className="mt-3 flex items-center text-cyan text-xs font-orbitron hover:text-white transition-colors">
                ENGAGE →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Activity + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CyberCard variant="ghost" title="AGENT ACTIVITY LOG">
            {(agentLogs || []).length === 0 ? (
              <p className="text-textMuted text-sm font-rajdhani">No agent activity yet. Start chatting with your agents.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {(agentLogs || []).map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5">
                    <span className="text-textMuted font-mono text-xs w-20 flex-shrink-0 mt-0.5">{timeAgo(log.created_at)}</span>
                    <AgentBadge agent={log.agent as Agent} />
                    <span className="text-text text-sm font-rajdhani leading-tight">{log.action}</span>
                  </div>
                ))}
              </div>
            )}
          </CyberCard>
        </div>

        <div className="lg:col-span-2">
          <CyberCard variant="purple" title="BUSINESS HEALTH">
            <div className="flex flex-col items-center py-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple/30" />
                <div className="text-center">
                  <div className="font-orbitron text-3xl text-text">{healthData.score}</div>
                  <div className="text-textMuted text-xs">/10</div>
                </div>
              </div>
              <p className="text-textMuted text-xs font-orbitron mt-2">Powered by ARIA</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {healthData.breakdown.map(({ label, score, maxScore }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-textMuted font-rajdhani">{label}</span>
                    <span className="text-text font-orbitron">{score}/{maxScore}</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-purple rounded-full" style={{ width: `${(score / maxScore) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CyberCard>
        </div>
      </div>

      {/* Section 5 — Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-orbitron text-xs text-cyan uppercase tracking-widest">RECENT TRANSACTIONS — FINN</h2>
          <Link href="/finance" className="text-textMuted text-xs font-rajdhani hover:text-cyan transition-colors">View all in Finance →</Link>
        </div>
        {(recentTxs || []).length === 0 ? (
          <p className="text-textMuted text-sm font-rajdhani">No transactions yet. <Link href="/finance" className="text-cyan hover:underline">Upload a CSV →</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Date', 'Description', 'Category', 'Amount'].map(h => (
                    <th key={h} className="text-left text-xs font-orbitron text-textMuted pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentTxs || []).map((tx, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-surface2/50 transition-colors">
                    <td className="py-2.5 pr-4 text-textMuted text-xs font-mono whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="py-2.5 pr-4 text-text text-sm font-rajdhani truncate max-w-xs">{tx.description}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs font-orbitron px-2 py-0.5 bg-surface2 border border-border text-textMuted">{tx.category || 'Other'}</span>
                    </td>
                    <td className={`py-2.5 font-orbitron text-sm ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                      {tx.type === 'income' ? '+' : '-'}£{Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
