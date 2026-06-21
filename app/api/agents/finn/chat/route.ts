import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAgent } from '@/lib/agents/config'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { message, history = [] } = await request.json()

    // Get financial context
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart)
      .order('date', { ascending: false })
      .limit(50)

    const income = (transactions || []).filter(t => t.type === 'income').reduce((s: number, t: { amount_gbp?: number; amount: number }) => s + (t.amount_gbp || t.amount), 0)
    const expenses = (transactions || []).filter(t => t.type === 'expense').reduce((s: number, t: { amount_gbp?: number; amount: number }) => s + Math.abs(t.amount_gbp || t.amount), 0)

    const contextString = `Current month P&L: Income £${income.toFixed(2)}, Expenses £${expenses.toFixed(2)}, Net £${(income - expenses).toFixed(2)}. Recent transactions: ${JSON.stringify((transactions || []).slice(0, 10))}`

    const agent = getAgent('FINN')!
    const systemPrompt = agent.systemPrompt + '\n\nUser financial context:\n' + contextString

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
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
            const text = chunk.delta.text
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }
        }
        controller.close()

        // Save to DB after stream
        await supabase.from('agent_chats').insert([
          { user_id: user.id, agent: 'FINN', role: 'user', content: message },
          { user_id: user.id, agent: 'FINN', role: 'assistant', content: fullResponse },
        ])
        await supabase.from('agent_logs').insert({
          user_id: user.id, agent: 'FINN', action: 'Chat session', result: message.slice(0, 100),
        })
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    })
  } catch {
    return new Response('Failed', { status: 500 })
  }
}
