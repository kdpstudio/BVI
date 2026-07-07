'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { StatusDot } from '@/components/ui/status-dot'
import { Agent } from '@/types'

const AGENT_GLOW: Record<Agent, string> = {
  FINN: 'rgba(0,200,255,0.25)',
  SAGE: 'rgba(0,255,136,0.25)',
  ARIA: 'rgba(123,47,255,0.25)',
  MAX: 'rgba(255,204,0,0.25)',
  REX: 'rgba(251,146,60,0.25)',
}

const AGENT_COLOR: Record<Agent, string> = {
  FINN: '#00c8ff',
  SAGE: '#00ff88',
  ARIA: '#7b2fff',
  MAX: '#ffcc00',
  REX: '#fb923c',
}

interface AgentRosterProps {
  agents: { id: Agent; emoji: string; role: string }[]
  lastActions: Record<Agent, string>
}

export function AgentRoster({ agents, lastActions }: AgentRosterProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {agents.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{
            y: -4,
            boxShadow: `0 0 30px ${AGENT_GLOW[agent.id]}`,
            borderColor: AGENT_COLOR[agent.id] + '60',
          }}
          className="bg-surface border border-border p-4 transition-colors cursor-default"
        >
          <motion.div
            className="text-3xl mb-2"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          >
            {agent.emoji}
          </motion.div>
          <div className="font-orbitron text-sm text-text mb-0.5" style={{ color: AGENT_COLOR[agent.id] }}>{agent.id}</div>
          <div className="text-textMuted text-xs font-rajdhani mb-2">{agent.role}</div>
          <StatusDot status="active" label />
          <p className="text-textDim text-xs font-rajdhani mt-2 leading-tight line-clamp-2">{lastActions[agent.id]}</p>
          <Link
            href={`/agents/${agent.id.toLowerCase()}`}
            className="mt-3 flex items-center text-xs font-orbitron hover:opacity-80 transition-opacity"
            style={{ color: AGENT_COLOR[agent.id] }}
          >
            ENGAGE →
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
