'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { Agent } from '@/types'
import { MessageBubble } from './message-bubble'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const AGENT_THEME: Record<Agent, { text: string; border: string; bg: string; emoji: string }> = {
  FINN: { text: 'text-cyan', border: 'border-cyan', bg: 'bg-cyan', emoji: '💰' },
  SAGE: { text: 'text-green', border: 'border-green', bg: 'bg-green', emoji: '🧾' },
  ARIA: { text: 'text-purple', border: 'border-purple', bg: 'bg-purple', emoji: '💼' },
  MAX:  { text: 'text-yellow', border: 'border-yellow', bg: 'bg-yellow', emoji: '📈' },
  REX:  { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400', emoji: '🗂️' },
}

export function ChatInterface({ agent, initialMessage }: { agent: Agent; initialMessage?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(initialMessage || '')
  const [streaming, setStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const theme = AGENT_THEME[agent]

  useEffect(() => {
    const supabase = createClient()
    supabase.from('agent_chats').select('*').eq('agent', agent).order('created_at', { ascending: true }).limit(50)
      .then(({ data }) => {
        if (data) {
          setMessages(data.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString(),
          })))
        }
      })
  }, [agent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentResponse])

  const sendMessage = useCallback(async (msg?: string) => {
    const text = (msg || input).trim()
    if (!text || streaming) return

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setStreaming(true)
    setCurrentResponse('')

    try {
      const history = messages.slice(-20).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch(`/api/agents/${agent.toLowerCase()}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (res.status === 403) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: `**Access restricted.** ${err.message || 'Upgrade your plan to access this agent.'}\n\n[View pricing →](/pricing)`, timestamp: new Date().toLocaleTimeString() }])
        setStreaming(false)
        return
      }
      if (!res.ok) throw new Error('Failed to get response')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value)
          setCurrentResponse(full)
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full, timestamp: new Date().toLocaleTimeString() }])
      setCurrentResponse('')
    } catch {
      toast.error(`Failed to get response from ${agent}`)
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, messages, agent])

  // Listen for quick-action events
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message: string }>).detail.message
      setInput(msg)
    }
    window.addEventListener('quick-action', handler)
    return () => window.removeEventListener('quick-action', handler)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {messages.length === 0 && !streaming && (
          <div className="flex items-center justify-center h-full">
            <p className={`font-orbitron text-xs ${theme.text} opacity-40`}>START A CONVERSATION WITH {agent}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} agent={agent} timestamp={msg.timestamp} />
        ))}
        {streaming && currentResponse && (
          <MessageBubble role="assistant" content={currentResponse} agent={agent} />
        )}
        {streaming && !currentResponse && (
          <div className="flex gap-3 mb-4 items-center">
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border ${theme.border} bg-surface2 text-sm`}>
              {theme.emoji}
            </div>
            <span className={`font-orbitron text-xs ${theme.text} animate-pulse`}>{agent} PROCESSING...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={`border-t ${theme.border}/30 p-4 flex-shrink-0`}>
        <div className={`flex border ${theme.border}/30 bg-surface2`}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={`Message ${agent}...`}
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent px-4 py-3 text-text font-rajdhani text-sm outline-none resize-none disabled:opacity-50 placeholder-textDim"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className={`px-4 ${theme.bg} text-background font-orbitron text-xs disabled:opacity-30 flex items-center gap-2 flex-shrink-0 transition-opacity`}
          >
            <Send size={14} />
            TRANSMIT
          </button>
        </div>
        <p className="text-textDim text-xs mt-1 font-rajdhani">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
