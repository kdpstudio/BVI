import { SupabaseClient } from '@supabase/supabase-js'
import { Tier } from '@/types'

const DAILY_LIMITS: Record<Tier, number> = {
  free: 10,
  solo: 50,
  studio: 150,
  agency: 500,
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  tier: Tier
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = DAILY_LIMITS[tier] ?? 10
  const today = new Date().toISOString().slice(0, 10)

  const { count } = await supabase
    .from('agent_chats')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', `${today}T00:00:00.000Z`)

  const used = count ?? 0
  const remaining = Math.max(0, limit - used)

  return { allowed: used < limit, remaining, limit }
}
