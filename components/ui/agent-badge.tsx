import { cn } from '@/lib/utils'
import { Agent } from '@/types'

const AGENT_STYLES: Record<Agent, { color: string; bg: string; emoji: string }> = {
  FINN: { color: 'text-cyan', bg: 'bg-cyan/10 border-cyan/30', emoji: '💰' },
  SAGE: { color: 'text-green', bg: 'bg-green/10 border-green/30', emoji: '🧾' },
  ARIA: { color: 'text-purple', bg: 'bg-purple/10 border-purple/30', emoji: '💼' },
  MAX: { color: 'text-yellow', bg: 'bg-yellow/10 border-yellow/30', emoji: '📈' },
  REX: { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', emoji: '🗂️' },
}

export function AgentBadge({ agent, showEmoji = true }: { agent: Agent; showEmoji?: boolean }) {
  const style = AGENT_STYLES[agent]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 border text-xs font-orbitron', style.color, style.bg)}>
      {showEmoji && style.emoji} {agent}
    </span>
  )
}
