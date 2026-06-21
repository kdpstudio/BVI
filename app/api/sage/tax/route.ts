import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateUKTax, calculateUSTax, calculateCATax } from '@/lib/tax/calculator'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('country').eq('id', user.id).single()
    const country = profile?.country || 'UK'

    const now = new Date()
    const yearStart = `${now.getFullYear()}-01-01`
    const { data: txs } = await supabase.from('transactions').select('amount, amount_gbp, type').eq('user_id', user.id).gte('date', yearStart)

    const annualIncome = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp || t.amount), 0)

    const result = country === 'US' ? calculateUSTax(annualIncome)
      : country === 'CA' ? calculateCATax(annualIncome)
      : calculateUKTax(annualIncome)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to calculate tax' }, { status: 500 })
  }
}
