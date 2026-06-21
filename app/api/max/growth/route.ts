import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const startDate = sixMonthsAgo.toISOString().slice(0, 10)

    const { data: txs } = await supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', startDate).order('date', { ascending: true })

    const byMonth: Record<string, { income: number; expenses: number }> = {}
    for (const tx of txs || []) {
      const month = tx.date.slice(0, 7)
      if (!byMonth[month]) byMonth[month] = { income: 0, expenses: 0 }
      if (tx.type === 'income') byMonth[month].income += tx.amount_gbp || tx.amount
      else byMonth[month].expenses += Math.abs(tx.amount_gbp || tx.amount)
    }

    const months = Object.entries(byMonth).map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleString('en-GB', { month: 'short' }),
      income: Math.round(data.income),
      expenses: Math.round(data.expenses),
      net: Math.round(data.income - data.expenses),
    }))

    const incomes = months.map(m => m.income)
    const avgIncome = incomes.length ? incomes.reduce((a, b) => a + b, 0) / incomes.length : 0
    const bestMonth = months.length ? months.reduce((best, m) => m.income > best.income ? m : best, months[0]) : { month: '-', income: 0 }
    const momGrowth = incomes.length >= 2 && incomes[incomes.length - 2] > 0
      ? ((incomes[incomes.length - 1] - incomes[incomes.length - 2]) / incomes[incomes.length - 2]) * 100
      : 0

    return NextResponse.json({ months, avgIncome, bestMonth, momGrowth })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch growth data' }, { status: 500 })
  }
}
