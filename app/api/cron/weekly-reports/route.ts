import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWeeklyReport } from '@/lib/email'

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: users } = await admin
    .from('users')
    .select('id, email, full_name, currency, notification_prefs')
    .not('email', 'is', null)

  const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`
  let sent = 0

  for (const user of users || []) {
    if (!user.notification_prefs?.weekly_report) continue
    try {
      const { data: txs } = await admin
        .from('transactions')
        .select('amount, amount_gbp, type')
        .eq('user_id', user.id)
        .gte('date', monthStart)

      const income = (txs || []).filter(t => t.type === 'income').reduce((s: number, t: { amount_gbp?: number; amount: number }) => s + (t.amount_gbp || t.amount), 0)
      const expenses = (txs || []).filter(t => t.type === 'expense').reduce((s: number, t: { amount_gbp?: number; amount: number }) => s + Math.abs(t.amount_gbp || t.amount), 0)

      await sendWeeklyReport(user.email, {
        name: user.full_name?.split(' ')[0] || 'there',
        income,
        expenses,
        net: income - expenses,
        currency: user.currency || 'GBP',
      })
      sent++
    } catch {
      // Continue to next user on error
    }
  }

  return NextResponse.json({ sent, total: users?.length || 0 })
}
