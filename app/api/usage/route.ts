import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dailyLimitFor } from '@/lib/rate-limit'
import { Tier } from '@/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('tier, bonus_messages').eq('id', user.id).single()
    const tier = (profile?.tier || 'free') as Tier
    const limit = dailyLimitFor(tier)
    const today = new Date().toISOString().slice(0, 10)

    const { count } = await supabase
      .from('agent_chats')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', `${today}T00:00:00.000Z`)

    return NextResponse.json({
      used: count ?? 0,
      limit,
      tier,
      bonusMessages: profile?.bonus_messages ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
