import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAgent } from '@/lib/agents/config'
import { DOCUMENT_MODEL } from '@/lib/agents/models'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, data } = await request.json()
    const { data: profile } = await supabase.from('users').select('business_name, business_type, country').eq('id', user.id).single()

    const rex = getAgent('REX')!
    const prompt = `Generate a professional ${type} document for ${profile?.business_name || 'the business'} (${profile?.business_type || 'Freelancer'}) based in ${profile?.country || 'UK'}. Details: ${JSON.stringify(data)}. Format it clearly with proper sections and professional language.`

    // Thinking is on by default on Sonnet 5 and shares the max_tokens budget
    // with the response — disabled here for predictable cost and output length.
    const response = await anthropic.messages.create({
      model: DOCUMENT_MODEL,
      max_tokens: 4000,
      thinking: { type: 'disabled' },
      system: rex.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    await supabase.from('agent_logs').insert({
      user_id: user.id, agent: 'REX', action: `Generated ${type}`, result: `${text.length} chars`,
    })

    return NextResponse.json({ document: text })
  } catch {
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 })
  }
}
