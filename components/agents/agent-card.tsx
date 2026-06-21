import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Agent, Tier } from '@/types'
import { StatusDot } from '@/components/ui/status-dot'
import { cn } from '@/lib/utils'
import { canAgentAccess } from '@/lib/pricing'

const AGENT_INFO: Record<Agent, { emoji: string; role: string; description: string; color: string; border: string }> = {
  FINN: { emoji: '💰', role: 'AI CFO', description: 'Financial intelligence, bookkeeping, P&L reports, and cash flow analysis.', color: 'text-cyan', border: 'border-cyan/30 hover:border-cyan/60 hover:shadow-[0_0_20px_rgba(0,200,255,0.15)]' },
  SAGE: { emoji: '🧾', role: 'AI Tax Advisor', description: 'UK, US, and Canadian tax expertise. Estimates, deductions, deadlines.', color: 'text-green', border: 'border-green/30 hover:border-green/60 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]' },
  ARIA: { emoji: '💼', role: 'AI CEO Advisor', description: 'Strategic briefings, business health scoring, risk and opportunity analysis.', color: 'text-purple', border: 'border-purple/30 hover:border-purple/60 hover:shadow-[0_0_20px_rgba(123,47,255,0.15)]' },
  MAX:  { emoji: '📈', role: 'AI Growth Manager', description: 'Revenue trends, client profitability, pricing recommendations.', color: 'text-yellow', border: 'border-yellow/30 hover:border-yellow/60 hover:shadow-[0_0_20px_rgba(255,204,0,0.15)]' },
  REX:  { emoji: '🗂️', role: 'AI Operations Manager', description: 'Proposals, contracts, compliance, and business operations.', color: 'text-orange-400', border: 'border-orange-400/30 hover:border-orange-400/60 hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]' },
}

export function AgentCard({ agent, tier }: { agent: Agent; tier: Tier }) {
  const info = AGENT_INFO[agent]
  const locked = !canAgentAccess(tier, agent)

  return (
    <div className={cn('bg-surface border p-6 transition-all duration-200 relative', info.border, locked && 'opacity-60')}>
      {locked && <div className="absolute top-3 right-3"><Lock size={14} className="text-textMuted" /></div>}
      <div className="text-4xl mb-3">{info.emoji}</div>
      <div className={cn('font-orbitron text-lg mb-0.5', info.color)}>{agent}</div>
      <div className="text-textMuted text-xs font-rajdhani mb-3">{info.role}</div>
      <p className="text-textMuted text-xs font-rajdhani leading-relaxed mb-4">{info.description}</p>
      {locked ? (
        <Link href="/pricing" className="block text-center text-textMuted text-xs font-orbitron border border-textDim px-3 py-2 hover:border-cyan/40 hover:text-cyan transition-colors">
          UPGRADE TO UNLOCK →
        </Link>
      ) : (
        <div className="flex items-center justify-between">
          <StatusDot status="active" label />
          <Link href={`/agents/${agent.toLowerCase()}`} className={cn('font-orbitron text-xs hover:opacity-80 transition-opacity', info.color)}>
            ENGAGE →
          </Link>
        </div>
      )}
    </div>
  )
}
