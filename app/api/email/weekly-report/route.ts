import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWeeklyReport } from '@/lib/email'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (!profile?.notification_prefs?.weekly_report) {
      return NextResponse.json({ skipped: true })
    }

    const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`
    const { data: txs } = await supabase.from('transactions').select('amount, amount_gbp, type').eq('user_id', user.id).gte('date', monthStart)

    const income = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp || t.amount), 0)
    const expenses = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount_gbp || t.amount), 0)

    await sendWeeklyReport(user.email!, {
      name: profile.full_name?.split(' ')[0] || 'there',
      income,
      expenses,
      net: income - expenses,
      currency: profile.currency || 'GBP',
    })

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send report' }, { status: 500 })
  }
}
