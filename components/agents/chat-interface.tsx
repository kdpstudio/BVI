'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Download } from 'lucide-react'
import { Agent } from '@/types'
import { MessageBubble } from './message-bubble'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTED_PROMPTS: Record<Agent, { label: string; message: string }[]> = {
  FINN: [
    { label: 'P&L this month', message: 'Generate a P&L report for this month with all categories broken down.' },
    { label: 'Cash flow check', message: 'Give me a cash flow summary and tell me what my runway looks like.' },
    { label: 'Flag anything unusual', message: 'Review my recent transactions and flag anything unusual or worth noting.' },
  ],
  SAGE: [
    { label: 'Estimate my tax bill', message: 'Estimate my tax liability for this tax year based on my income so far.' },
    { label: 'Find my deductions', message: 'Based on my transactions, what deductions am I potentially missing?' },
    { label: 'Next deadline?', message: 'What are my upcoming tax deadlines and payment dates?' },
  ],
  ARIA: [
    { label: 'Business health check', message: 'Give me a full business health check and score out of 10.' },
    { label: 'Strategic brief', message: 'Give me a strategic briefing on the state of my business this week.' },
    { label: 'Biggest risks', message: 'What are the biggest risks to my business right now and how should I address them?' },
  ],
  MAX: [
    { label: 'Revenue trends', message: "Analyse my revenue trends and tell me what's driving growth or decline." },
    { label: 'Should I raise my rates?', message: 'Based on my revenue data, should I raise my rates? By how much?' },
    { label: 'Growth report', message: 'Give me a growth report with specific recommendations for next month.' },
  ],
  REX: [
    { label: 'Draft a proposal', message: 'Help me draft a professional project proposal. Ask me for the details you need.' },
    { label: 'Contract template', message: 'Generate a freelance service agreement template for my business type.' },
    { label: 'Compliance check', message: 'What compliance items do I need to be aware of for my country and business type?' },
  ],
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const AGENT_THEME: Record<Agent, { text: string; border: string; bg: string; emoji: string; glow: string }> = {
  FINN: { text: 'text-cyan', border: 'border-cyan', bg: 'bg-cyan', emoji: '💰', glow: 'rgba(0,200,255,0.3)' },
  SAGE: { text: 'text-green', border: 'border-green', bg: 'bg-green', emoji: '🧾', glow: 'rgba(0,255,128,0.3)' },
  ARIA: { text: 'text-purple', border: 'border-purple', bg: 'bg-purple', emoji: '💼', glow: 'rgba(168,85,247,0.3)' },
  MAX:  { text: 'text-yellow', border: 'border-yellow', bg: 'bg-yellow', emoji: '📈', glow: 'rgba(255,200,0,0.3)' },
  REX:  { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400', emoji: '🗂️', glow: 'rgba(251,146,60,0.3)' },
}

interface UsageData { used: number; limit: number; tier: string }

export function ChatInterface({ agent, initialMessage }: { agent: Agent; initialMessage?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(initialMessage || '')
  const [streaming, setStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [usage, setUsage] = useState<UsageData | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const theme = AGENT_THEME[agent]

  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).then(d => { if (!d.error) setUsage(d) }).catch(() => null)
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('agent_chats').select('*').eq('agent', agent).eq('user_id', user.id).order('created_at', { ascending: true }).limit(50)
        .then(({ data }) => {
          if (data) {
            setMessages(data.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString(),
            })))
          }
        })
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
      if (res.status === 429) {
        const err = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: `**Daily limit reached.** ${err.message || 'You have used all your messages for today.'}\n\n[Upgrade your plan →](/pricing)`, timestamp: new Date().toLocaleTimeString() }])
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

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<{ message: string }>).detail.message
      setInput(msg)
    }
    window.addEventListener('quick-action', handler)
    return () => window.removeEventListener('quick-action', handler)
  }, [])

  function handleExport() {
    const lines = messages.map(m => `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent}-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full" role="region" aria-label={`Chat with ${agent}`}>
      <div className="flex-1 overflow-y-auto p-4 min-h-0" aria-live="polite" aria-atomic="false">
        {messages.length === 0 && !streaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-6 py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              {theme.emoji}
            </motion.div>
            <p className={`font-orbitron text-xs ${theme.text} opacity-40`}>START A CONVERSATION WITH {agent}</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTED_PROMPTS[agent].map(({ label, message }) => (
                <button
                  key={label}
                  onClick={() => { setInput(message); sendMessage(message) }}
                  className={`text-left px-4 py-2.5 border border-border text-textMuted text-xs font-rajdhani hover:${theme.border}/40 hover:text-text transition-all`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble role={msg.role} content={msg.content} agent={agent} timestamp={msg.timestamp} />
            </motion.div>
          ))}
        </AnimatePresence>
        {streaming && currentResponse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MessageBubble role="assistant" content={currentResponse} agent={agent} />
          </motion.div>
        )}
        {streaming && !currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-4 items-center"
          >
            <motion.div
              className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border ${theme.border} bg-surface2 text-sm`}
              animate={{ boxShadow: [`0 0 0px ${theme.glow}`, `0 0 15px ${theme.glow}`, `0 0 0px ${theme.glow}`] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {theme.emoji}
            </motion.div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${theme.bg}`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={`border-t ${theme.border}/30 p-4 flex-shrink-0`}>
        {usage && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1 h-0.5 bg-border overflow-hidden">
              <div
                className={`h-full transition-all ${usage.used >= usage.limit ? 'bg-red' : usage.used >= usage.limit * 0.8 ? 'bg-yellow' : theme.bg}`}
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
            <span className="font-mono-tech text-[9px] text-textDim whitespace-nowrap">
              {usage.used}/{usage.limit}
              {usage.tier === 'free' && usage.used >= usage.limit * 0.8 && (
                <a href="/pricing" className="ml-2 text-cyan hover:opacity-80 transition-opacity">↑ UPGRADE</a>
              )}
            </span>
            {messages.length > 0 && (
              <button onClick={handleExport} className="flex items-center gap-1 text-[9px] font-orbitron text-textDim hover:text-text transition-colors whitespace-nowrap">
                <Download size={9} /> EXPORT
              </button>
            )}
          </div>
        )}
        {!usage && messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 text-xs font-orbitron text-textMuted hover:text-text transition-colors">
              <Download size={11} /> EXPORT CHAT
            </button>
          </div>
        )}
        <div className={`flex border ${theme.border}/30 bg-surface2 focus-within:border-opacity-100 transition-all`}
          style={{ boxShadow: input ? `0 0 15px ${theme.glow}` : 'none' }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={`Message ${agent}...`}
            aria-label={`Message ${agent}`}
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent px-4 py-3 text-text font-rajdhani text-sm outline-none resize-none disabled:opacity-50 placeholder-textDim"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <motion.button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
            className={`px-4 ${theme.bg} text-background font-orbitron text-xs disabled:opacity-30 flex items-center gap-2 flex-shrink-0 transition-opacity`}
          >
            <Send size={14} />
            <span className="hidden sm:inline">TRANSMIT</span>
          </motion.button>
        </div>
        <p className="text-textDim text-xs mt-1 font-rajdhani">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
