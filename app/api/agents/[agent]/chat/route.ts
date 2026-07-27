import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAgent } from '@/lib/agents/config'
import { canAgentAccess } from '@/lib/pricing'
import { checkRateLimit, consumeBonusMessage } from '@/lib/rate-limit'
import { CHAT_MODEL } from '@/lib/agents/models'
import { Agent, Tier } from '@/types'

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

    const { data: profile } = await supabase.from('users').select('tier').eq('id', user.id).single()
    const tier = (profile?.tier || 'free') as Tier
    if (!canAgentAccess(tier, agent)) {
      return new Response(JSON.stringify({ error: 'upgrade_required', message: `${agent} requires a higher tier. Visit /pricing to upgrade.` }), { status: 403, headers: { 'Content-Type': 'application/json' } })
    }

    const rateLimit = await checkRateLimit(supabase, user.id, tier)
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: 'rate_limited', message: `Daily message limit reached (${rateLimit.limit}/day on your plan). Buy a Message Boost or upgrade for more messages.`, canBoost: true }), { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Limit': String(rateLimit.limit), 'X-RateLimit-Remaining': '0' } })
    }

    const { message, history = [] } = await request.json()
    const contextString = await buildContext(agent, user.id, supabase)

    // The agent persona is static and cacheable; the per-user financial context
    // changes every request, so it must come after the cache breakpoint.
    // Note: Haiku 4.5's minimum cacheable prefix is 4096 tokens — personas
    // shorter than that won't actually cache (no error, just no discount).
    const stream = await anthropic.messages.stream({
      model: CHAT_MODEL,
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: agentConfig.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
        { type: 'text', text: 'User context:\n' + contextString },
      ],
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

        if (rateLimit.usingBonus) {
          await consumeBonusMessage(supabase, user.id)
        }

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
