import { CyberCard } from '@/components/ui/cyber-card'
import { MetricCard } from '@/components/ui/metric-card'
import { AgentBadge } from '@/components/ui/agent-badge'
import { StatusDot } from '@/components/ui/status-dot'
import { Agent } from '@/types'
import Link from 'next/link'

const MOCK_AGENTS: { id: Agent; emoji: string; role: string; lastAction: string }[] = [
  { id: 'FINN', emoji: '💰', role: 'AI CFO', lastAction: 'Categorised 12 transactions' },
  { id: 'SAGE', emoji: '🧾', role: 'AI Tax Advisor', lastAction: 'Estimated Q4 tax liability' },
  { id: 'ARIA', emoji: '💼', role: 'AI CEO Advisor', lastAction: 'Generated morning brief' },
  { id: 'MAX', emoji: '📈', role: 'AI Growth Manager', lastAction: 'Analysed revenue trends' },
  { id: 'REX', emoji: '🗂️', role: 'AI Operations', lastAction: 'Created proposal template' },
]

const MOCK_ACTIVITY = [
  { time: '09:14:32', agent: 'ARIA' as Agent, action: 'Generated morning intelligence brief' },
  { time: '09:12:11', agent: 'FINN' as Agent, action: 'Flagged unusual transaction: £4,200 — verify category' },
  { time: '08:55:04', agent: 'SAGE' as Agent, action: 'Updated Q4 2026 tax estimate based on new transactions' },
  { time: '08:40:22', agent: 'MAX' as Agent, action: 'MoM revenue growth at +14.3% — highest in 6 months' },
  { time: '08:30:00', agent: 'REX' as Agent, action: 'Compliance check complete — 2 items need attention' },
  { time: 'Yesterday', agent: 'FINN' as Agent, action: 'CSV import: 47 transactions categorised' },
  { time: 'Yesterday', agent: 'SAGE' as Agent, action: 'Self Assessment deadline reminder — 127 days remaining' },
  { time: 'Yesterday', agent: 'MAX' as Agent, action: 'Top client analysis: Client A = 34% of revenue' },
  { time: '2d ago', agent: 'REX' as Agent, action: 'Proposal generated for new project' },
  { time: '2d ago', agent: 'ARIA' as Agent, action: 'Business health score updated: 7.4/10' },
]

const MOCK_TRANSACTIONS = [
  { date: '21 Jun 2026', description: 'Client Invoice — Acme Corp', category: 'Revenue', amount: '£4,500.00', type: 'income' as const },
  { date: '20 Jun 2026', description: 'Adobe Creative Cloud', category: 'Software', amount: '-£54.99', type: 'expense' as const },
  { date: '19 Jun 2026', description: 'Google Ads Campaign', category: 'Marketing', amount: '-£320.00', type: 'expense' as const },
  { date: '18 Jun 2026', description: 'Freelance Project — Brand Refresh', category: 'Revenue', amount: '£2,800.00', type: 'income' as const },
  { date: '17 Jun 2026', description: 'Accountant fee — Monthly', category: 'Professional Services', amount: '-£150.00', type: 'expense' as const },
]

const HEALTH_SCORES = [
  { label: 'Revenue Growth', score: 8 },
  { label: 'Profit Margin', score: 7 },
  { label: 'Client Diversity', score: 6 },
  { label: 'Cash Position', score: 8 },
  { label: 'Tax Compliance', score: 7 },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Section 1 — Intelligence Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather */}
        <CyberCard variant="cyan" title="LOCAL CONDITIONS">
          <div className="flex items-center gap-4">
            <span className="text-4xl">⛅</span>
            <div>
              <div className="font-orbitron text-2xl text-text">18°C</div>
              <div className="text-textMuted text-sm font-rajdhani">London · Partly Cloudy</div>
              <div className="text-textMuted text-xs font-rajdhani mt-0.5">Feels like 16°C · Humidity 72%</div>
            </div>
          </div>
        </CyberCard>

        {/* News */}
        <CyberCard variant="purple" title="MARKET INTELLIGENCE">
          <div className="flex flex-col gap-3">
            {[
              { src: 'BBC', title: 'HMRC self-assessment deadline extended for online filers', time: '2h ago' },
              { src: 'FT', title: 'Freelancer rates rise 8% year-on-year across creative sectors', time: '4h ago' },
              { src: 'Tech', title: 'AI tools reduce admin time for SMEs by average 6hrs/week', time: '6h ago' },
            ].map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-purple text-xs font-orbitron bg-purple/10 border border-purple/20 px-1.5 py-0.5 flex-shrink-0">{item.src}</span>
                <div>
                  <p className="text-text text-xs font-rajdhani leading-tight">{item.title}</p>
                  <p className="text-textMuted text-xs">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CyberCard>

        {/* ARIA Brief */}
        <CyberCard variant="purple" title="ARIA — MORNING BRIEF">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💼</span>
            <StatusDot status="active" label />
          </div>
          <p className="text-text text-sm font-rajdhani leading-relaxed">
            Revenue is tracking 14% above last month with strong Q2 momentum. Your largest tax liability window opens in 43 days — SAGE recommends setting aside £2,400 now. Cash runway is healthy at 4.2 months; consider accelerating the rate increase MAX flagged last week.
          </p>
        </CyberCard>
      </div>

      {/* Section 2 — Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Monthly Revenue" value="£12,450" trend="up" trendValue="+12% vs last month" icon="💰" />
        <MetricCard label="Net Profit" value="£8,230" trend="up" trendValue="+8%" subtitle="66% margin" variant="purple" />
        <MetricCard label="Tax Liability" value="£2,180" subtitle="Est. Q4 2026" icon="⚠️" />
        <MetricCard label="Cash Runway" value="4.2 mo" subtitle="Healthy" trend="up" trendValue="" variant="purple" />
      </div>

      {/* Section 3 — Agent Roster */}
      <div>
        <h2 className="font-orbitron text-xs text-cyan uppercase tracking-widest mb-3">AGENT ROSTER</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MOCK_AGENTS.map(agent => (
            <div key={agent.id} className="bg-surface border border-border p-4 hover:border-cyan/40 hover:shadow-[0_0_15px_rgba(0,200,255,0.1)] transition-all group">
              <div className="text-3xl mb-2">{agent.emoji}</div>
              <div className="font-orbitron text-sm text-text mb-0.5">{agent.id}</div>
              <div className="text-textMuted text-xs font-rajdhani mb-2">{agent.role}</div>
              <StatusDot status="active" label />
              <p className="text-textDim text-xs font-rajdhani mt-2 leading-tight">{agent.lastAction}</p>
              <Link
                href={`/agents/${agent.id.toLowerCase()}`}
                className="mt-3 flex items-center text-cyan text-xs font-orbitron hover:text-white transition-colors"
              >
                ENGAGE →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Activity Log + Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <CyberCard variant="ghost" title="AGENT ACTIVITY LOG">
            <div className="flex flex-col divide-y divide-border">
              {MOCK_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5">
                  <span className="text-textMuted font-mono text-xs w-20 flex-shrink-0 mt-0.5">{item.time}</span>
                  <AgentBadge agent={item.agent} />
                  <span className="text-text text-sm font-rajdhani leading-tight">{item.action}</span>
                </div>
              ))}
            </div>
          </CyberCard>
        </div>

        <div className="lg:col-span-2">
          <CyberCard variant="purple" title="BUSINESS HEALTH">
            <div className="flex flex-col items-center py-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple/30" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple" style={{ transform: 'rotate(0deg)' }} />
                <div className="text-center">
                  <div className="font-orbitron text-3xl text-text">7.4</div>
                  <div className="text-textMuted text-xs">/10</div>
                </div>
              </div>
              <p className="text-textMuted text-xs font-orbitron mt-2">Powered by ARIA</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {HEALTH_SCORES.map(({ label, score }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-textMuted font-rajdhani">{label}</span>
                    <span className="text-text font-orbitron">{score}/10</span>
                  </div>
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple rounded-full transition-all"
                      style={{ width: `${score * 10}%` }}
                    />
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
          <Link href="/finance" className="text-textMuted text-xs font-rajdhani hover:text-cyan transition-colors">
            View all in Finance →
          </Link>
        </div>
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
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface2/50 transition-colors">
                  <td className="py-2.5 pr-4 text-textMuted text-xs font-mono">{tx.date}</td>
                  <td className="py-2.5 pr-4 text-text text-sm font-rajdhani">{tx.description}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs font-orbitron px-2 py-0.5 bg-surface2 border border-border text-textMuted">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`py-2.5 font-orbitron text-sm ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
