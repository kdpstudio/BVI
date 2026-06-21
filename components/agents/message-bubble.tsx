import ReactMarkdown from 'react-markdown'
import { Agent } from '@/types'
import { cn } from '@/lib/utils'

const AGENT_BORDER: Record<Agent, string> = {
  FINN: 'border-cyan',
  SAGE: 'border-green',
  ARIA: 'border-purple',
  MAX: 'border-yellow',
  REX: 'border-orange-400',
}

const AGENT_EMOJIS: Record<Agent, string> = {
  FINN: '💰', SAGE: '🧾', ARIA: '💼', MAX: '📈', REX: '🗂️',
}

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  agent: Agent
  timestamp?: string
}

export function MessageBubble({ role, content, agent, timestamp }: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%]">
          <div className="bg-cyan/10 border border-cyan/30 px-4 py-3 text-text font-rajdhani text-sm leading-relaxed">
            {content}
          </div>
          {timestamp && <p className="text-textDim text-xs mt-1 text-right font-mono">{timestamp}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className={cn('w-8 h-8 flex-shrink-0 flex items-center justify-center border bg-surface2 text-sm', AGENT_BORDER[agent])}>
        {AGENT_EMOJIS[agent]}
      </div>
      <div className="max-w-[85%]">
        <div className={cn('bg-surface2 border-l-2 px-4 py-3', AGENT_BORDER[agent])}>
          <div className="text-text font-rajdhani text-sm leading-relaxed [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 [&_strong]:text-cyan [&_code]:bg-surface [&_code]:px-1 [&_code]:text-cyan [&_code]:text-xs [&_pre]:bg-surface [&_pre]:p-3 [&_pre]:my-2 [&_pre]:overflow-x-auto">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        {timestamp && <p className="text-textDim text-xs mt-1 font-mono">{timestamp}</p>}
      </div>
    </div>
  )
}
