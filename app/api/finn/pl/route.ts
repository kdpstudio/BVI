import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const startDate = `${month}-01`
    const endDate = new Date(month + '-01')
    endDate.setMonth(endDate.getMonth() + 1)
    const endDateStr = endDate.toISOString().slice(0, 10)

    // Previous month
    const prevDate = new Date(month + '-01')
    prevDate.setMonth(prevDate.getMonth() - 1)
    const prevMonth = prevDate.toISOString().slice(0, 7)
    const prevStart = `${prevMonth}-01`
    const prevEnd = startDate

    const [current, previous] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', startDate).lt('date', endDateStr),
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', prevStart).lt('date', prevEnd),
    ])

    const calc = (txs: { type: string; amount_gbp: number | null; amount: number; category: string }[]) => {
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp ?? t.amount), 0)
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount_gbp ?? t.amount), 0)
      const byCategory: Record<string, number> = {}
      txs.filter(t => t.type === 'expense').forEach(t => {
        byCategory[t.category || 'Other'] = (byCategory[t.category || 'Other'] || 0) + Math.abs(t.amount_gbp ?? t.amount)
      })
      return { income, expenses, net: income - expenses, margin: income > 0 ? ((income - expenses) / income) * 100 : 0, byCategory }
    }

    const cur = calc(current.data || [])
    const prev = calc(previous.data || [])

    return NextResponse.json({
      month,
      ...cur,
      prevIncome: prev.income,
      prevExpenses: prev.expenses,
      prevNet: prev.net,
      incomeChange: prev.income > 0 ? ((cur.income - prev.income) / prev.income) * 100 : 0,
      expensesChange: prev.expenses > 0 ? ((cur.expenses - prev.expenses) / prev.expenses) * 100 : 0,
      netChange: prev.net > 0 ? ((cur.net - prev.net) / prev.net) * 100 : 0,
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch P&L' }, { status: 500 })
  }
}
