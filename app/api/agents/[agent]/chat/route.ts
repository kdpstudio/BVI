import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAgent } from '@/lib/agents/config'
import { Agent } from '@/types'

const anthropic = new Anthropic()

async function buildContext(agent: Agent, userId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [{ data: profile }, { data: txs }, { data: logs }] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('transactions').select('*').eq('user_id', userId).gte('date', monthStart).order('date', { ascending: false }).limit(30),
    supabase.from('agent_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ])

  const income = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp || t.amount), 0)
  const expenses = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount_gbp || t.amount), 0)

  const base = `User: ${profile?.full_name || 'Unknown'}, Business: ${profile?.business_name || 'Unknown'} (${profile?.business_type || 'Unknown'}), Country: ${profile?.country || 'UK'}, Currency: ${profile?.currency || 'GBP'}, Tier: ${profile?.tier || 'free'}.`
  const financial = `This month — Income: £${income.toFixed(2)}, Expenses: £${expenses.toFixed(2)}, Net: £${(income - expenses).toFixed(2)}.`

  switch (agent) {
    case 'FINN':
      return `${base} ${financial} Recent transactions: ${JSON.stringify((txs || []).slice(0, 10))}`
    case 'SAGE':
      return `${base} ${financial} Estimated annual income: £${(income * 12).toFixed(0)}.`
    case 'ARIA':
      return `${base} ${financial} Recent agent activity: ${(logs || []).slice(0, 5).map(l => l.action).join('; ')}`
    case 'MAX': {
      const cats = (txs || []).reduce((acc: Record<string, number>, t) => { acc[t.category || 'Other'] = (acc[t.category || 'Other'] || 0) + 1; return acc }, {})
      return `${base} ${financial} Transaction categories: ${JSON.stringify(cats)}`
    }
    case 'REX':
      return `${base} Business type: ${profile?.business_type || 'Freelancer'}. Country: ${profile?.country || 'UK'}.`
    default:
      return base
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ agent: string }> }) {
  try {
    const { agent: agentParam } = await params
    const agent = agentParam.toUpperCase() as Agent
    const agentConfig = getAgent(agent)
    if (!agentConfig) return new Response('Agent not found', { status: 404 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { message, history = [] } = await request.json()
    const contextString = await buildContext(agent, user.id, supabase)

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: agentConfig.systemPrompt + '\n\nUser context:\n' + contextString,
      messages: [
        ...history.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        { role: 'user', content: message }
      ],
    })

    const encoder = new TextEncoder()
    let fullResponse = ''

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullResponse += chunk.delta.text
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()

        await supabase.from('agent_chats').insert([
          { user_id: user.id, agent, role: 'user', content: message },
          { user_id: user.id, agent, role: 'assistant', content: fullResponse },
        ])
        await supabase.from('agent_logs').insert({
          user_id: user.id, agent, action: 'Chat session', result: message.slice(0, 100),
        })
      },
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (error) {
    console.error('Agent chat error:', error)
    return new Response('Failed', { status: 500 })
  }
}
