import { SupabaseClient } from '@supabase/supabase-js'
import { Tier } from '@/types'

const DAILY_LIMITS: Record<Tier, number> = {
  free: 10,
  solo: 50,
  studio: 150,
  agency: 500,
}

export function dailyLimitFor(tier: Tier): number {
  return DAILY_LIMITS[tier] ?? 10
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  tier: Tier
): Promise<{ allowed: boolean; remaining: number; limit: number; usingBonus: boolean }> {
  const limit = dailyLimitFor(tier)
  const today = new Date().toISOString().slice(0, 10)

  const [{ count }, { data: profile }] = await Promise.all([
    supabase
      .from('agent_chats')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user')
      .gte('created_at', `${today}T00:00:00.000Z`),
    supabase.from('users').select('bonus_messages').eq('id', userId).single(),
  ])

  const used = count ?? 0
  const bonusMessages = profile?.bonus_messages ?? 0
  const remaining = Math.max(0, limit - used)

  if (used < limit) {
    return { allowed: true, remaining, limit, usingBonus: false }
  }

  // Over the daily cap — fall back to the purchased bonus pool, if any.
  return { allowed: bonusMessages > 0, remaining: 0, limit, usingBonus: true }
}

/** Call after a message is sent while usingBonus was true. Decrements atomically, floored at 0. */
export async function consumeBonusMessage(supabase: SupabaseClient, userId: string): Promise<void> {
  await supabase.rpc('decrement_bonus_messages', { p_user_id: userId })
}
