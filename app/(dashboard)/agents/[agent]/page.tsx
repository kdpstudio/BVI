'use client'

import { use, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ChatInterface } from '@/components/agents/chat-interface'
import { QuickActions } from '@/components/agents/quick-actions'
import { StatusDot } from '@/components/ui/status-dot'
import { AiDisclaimer } from '@/components/ui/ai-disclaimer'
import { Agent } from '@/types'
import { AGENTS } from '@/lib/agents/config'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X } from 'lucide-react'

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
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('message') || undefined
  const [drawerOpen, setDrawerOpen] = useState(false)

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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-orbitron text-lg ${textColor}`}>{config.name}</h1>
              <StatusDot status="active" label />
            </div>
            <p className="text-textMuted text-xs font-rajdhani">{config.role}</p>
          </div>
          {/* Mobile quick actions button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 border ${borderColor}/40 ${textColor} font-orbitron text-[10px] tracking-wider`}
          >
            <Zap size={11} /> ACTIONS
          </button>
        </div>
        <div className="flex-1 min-h-0">
          <ChatInterface agent={agentId} initialMessage={initialMessage} />
        </div>
        <AiDisclaimer />
      </div>

      {/* Desktop side panel */}
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

      {/* Mobile bottom drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(2,4,8,0.7)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border p-5 lg:hidden max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`font-orbitron text-xs tracking-widest ${textColor}`}>{config.name} — QUICK ACTIONS</span>
                <button onClick={() => setDrawerOpen(false)} className="text-textMuted hover:text-text transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="mb-5">
                <p className={`font-orbitron text-[10px] uppercase tracking-widest mb-2 ${textColor} opacity-60`}>QUICK ACTIONS</p>
                <QuickActions
                  agent={agentId}
                  onSelect={msg => {
                    window.dispatchEvent(new CustomEvent('quick-action', { detail: { message: msg } }))
                    setDrawerOpen(false)
                  }}
                />
              </div>

              <div>
                <p className={`font-orbitron text-[10px] uppercase tracking-widest mb-2 ${textColor} opacity-60`}>CAPABILITIES</p>
                <ul className="flex flex-col gap-1.5">
                  {CAPABILITIES[agentId].map(cap => (
                    <li key={cap} className={`flex items-center gap-2 text-textMuted text-xs font-rajdhani`}>
                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${textColor.replace('text-', 'bg-')}`} />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
