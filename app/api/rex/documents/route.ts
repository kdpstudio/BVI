import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAgent } from '@/lib/agents/config'

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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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
