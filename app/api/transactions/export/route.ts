import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: txs } = await supabase
    .from('transactions')
    .select('date, description, category, amount, currency, type, is_flagged, finn_note')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const rows = [
    ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Type', 'Flagged', 'FINN Note'],
    ...(txs || []).map(t => [
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.category || '',
      Math.abs(t.amount).toFixed(2),
      t.currency || 'GBP',
      t.type,
      t.is_flagged ? 'Yes' : 'No',
      `"${(t.finn_note || '').replace(/"/g, '""')}"`,
    ]),
  ]

  const csv = rows.map(r => r.join(',')).join('\n')
  const date = new Date().toISOString().slice(0, 10)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="bvi-transactions-${date}.csv"`,
    },
  })
}
