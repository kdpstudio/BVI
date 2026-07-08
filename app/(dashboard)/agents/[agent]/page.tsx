'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { ChatInterface } from '@/components/agents/chat-interface'
import { QuickActions } from '@/components/agents/quick-actions'
import { StatusDot } from '@/components/ui/status-dot'
import { AiDisclaimer } from '@/components/ui/ai-disclaimer'
import { Agent } from '@/types'
import { AGENTS } from '@/lib/agents/config'

const VALID_AGENTS = ['finn', 'sage', 'aria', 'max', 'rex']

const CAPABILITIES: Record<Agent, string[]> = {
  FINN: ['Transaction categorisation', 'P&L reports', 'Cash flow analysis', 'CSV import', 'Financial Q&A'],
  SAGE: ['Tax estimates (UK/US/CA)', 'Deadline tracking', 'Deduction finder', 'Self-assessment help', 'VAT guidance'],
  ARIA: ['Business health scoring', 'Strategic briefings', 'Risk assessment', 'Opportunity analysis', 'CEO-level insights'],
  MAX:  ['Revenue trend analysis', 'Client profitability', 'Rate recommendations', 'Growth forecasting', 'Market insights'],
  REX:  ['Proposal generation', 'Contract templates', 'Compliance checks', 'Document management', 'Admin automation'],
}

const THEME: Record<Agent, string> = {
  FINN: 'text-cyan border-cyan',
  SAGE: 'text-green border-green',
  ARIA: 'text-purple border-purple',
  MAX:  'text-yellow border-yellow',
  REX:  'text-orange-400 border-orange-400',
}

export default function AgentPage({ params }: { params: Promise<{ agent: string }> }) {
  const { agent: agentParam } = use(params)

  if (!VALID_AGENTS.includes(agentParam.toLowerCase())) notFound()

  const agentId = agentParam.toUpperCase() as Agent
  const config = AGENTS.find(a => a.id === agentId)
  if (!config) notFound()

  const theme = THEME[agentId]
  const textColor = theme.split(' ')[0]
  const borderColor = theme.split(' ')[1]

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Chat */}
      <div className="flex-1 bg-surface border border-border flex flex-col min-h-0">
        <div className={`flex items-center gap-3 p-4 border-b ${borderColor}/30 flex-shrink-0`}>
          <span className="text-2xl">{config.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`font-orbitron text-lg ${textColor}`}>{config.name}</h1>
              <StatusDot status="active" label />
            </div>
            <p className="text-textMuted text-xs font-rajdhani">{config.role}</p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChatInterface agent={agentId} />
        </div>
        <AiDisclaimer />
      </div>

      {/* Side panel */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto hidden lg:flex">
        <div className="bg-surface border border-border p-4">
          <p className={`font-orbitron text-xs uppercase tracking-widest mb-3 ${textColor}`}>CAPABILITIES</p>
          <ul className="flex flex-col gap-1.5">
            {CAPABILITIES[agentId].map(cap => (
              <li key={cap} className="flex items-center gap-2 text-textMuted text-xs font-rajdhani">
                <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                {cap}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface border border-border p-4">
          <p className={`font-orbitron text-xs uppercase tracking-widest mb-3 ${textColor}`}>QUICK ACTIONS</p>
          <QuickActions
            agent={agentId}
            onSelect={msg => window.dispatchEvent(new CustomEvent('quick-action', { detail: { message: msg } }))}
          />
        </div>
      </div>
    </div>
  )
}
