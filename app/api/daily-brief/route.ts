export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchWeather } from '@/lib/weather'
import { fetchNews } from '@/lib/news'
import { generateAriaBrief } from '@/lib/aria/brief'
import { calculateHealthScore } from '@/lib/aria/health'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = new Date().toISOString().slice(0, 10)

    // Check cache
    const { data: cached } = await supabase.from('daily_briefs').select('*').eq('user_id', user.id).eq('date', today).single()
    if (cached) return NextResponse.json(cached)

    // Get user profile
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    const city = profile?.city || 'London'
    const country = profile?.country || 'UK'
    const businessName = profile?.business_name || profile?.full_name || 'your business'

    // Get this month's transactions
    const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`
    const prevMonthStart = new Date(monthStart)
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
    const prevStart = prevMonthStart.toISOString().slice(0, 10)

    const [{ data: txs }, { data: prevTxs }] = await Promise.all([
      supabase.from('transactions').select('amount, amount_gbp, type').eq('user_id', user.id).gte('date', monthStart),
      supabase.from('transactions').select('amount, type').eq('user_id', user.id).gte('date', prevStart).lt('date', monthStart),
    ])

    const income = (txs || []).filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp || t.amount), 0)
    const expenses = (txs || []).filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount_gbp || t.amount), 0)
    const prevIncome = (prevTxs || []).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const margin = income > 0 ? ((income - expenses) / income) * 100 : 0
    const avgMonthlyExpenses = expenses || 1
    const cashRunwayMonths = income > expenses ? (income - expenses) / avgMonthlyExpenses * 3 : 0

    const healthData = calculateHealthScore({
      income, prevIncome, margin, cashRunwayMonths,
      txCount: txs?.length || 0, prevTxCount: prevTxs?.length || 0, taxCompliant: true,
    })

    // Fetch external data (run in parallel, failures are non-blocking)
    const [weather, news] = await Promise.all([
      fetchWeather(city).catch(() => null),
      fetchNews(country as 'UK' | 'US' | 'CA').catch(() => []),
    ])

    const ariaBrief = await generateAriaBrief({ businessName, weather, news, income, expenses, healthScore: healthData.score })

    const briefData = {
      user_id: user.id,
      date: today,
      weather: weather || {},
      news: news || [],
      aria_brief: ariaBrief,
      health_score: healthData.score,
    }

    // Cache in DB
    await supabase.from('daily_briefs').upsert(briefData)

    return NextResponse.json({ ...briefData, healthBreakdown: healthData.breakdown, income, expenses })
  } catch (error) {
    console.error('Daily brief error:', error)
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 })
  }
}
