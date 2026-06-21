import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'

function mapColumns(row: Record<string, string>) {
  const get = (variants: string[]) => {
    for (const v of variants) {
      const k = Object.keys(row).find(k => k.toLowerCase().trim() === v)
      if (k && row[k]) return row[k]
    }
    return ''
  }

  const dateStr = get(['date', 'transaction date', 'value date', 'posted date'])
  const description = get(['description', 'narrative', 'details', 'merchant', 'memo', 'reference'])
  const amountStr = get(['amount', 'value', 'debit/credit', 'transaction amount'])
  const currency = get(['currency', 'ccy']) || 'GBP'

  const amount = parseFloat(amountStr.replace(/[£$,\s]/g, '')) || 0

  return { date: dateStr, description, amount, currency }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileSize = file.size
    if (fileSize > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const text = await file.text()
    const { data: rows } = Papa.parse<Record<string, string>>(text, {
      header: true, skipEmptyLines: true,
    })

    if (!rows.length) return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 })

    const mapped = rows.map(mapColumns).filter(r => r.description && r.date)

    // Call FINN categorise
    const categoriseRes = await fetch(new URL('/api/finn/categorise', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('Cookie') || '' },
      body: JSON.stringify({ transactions: mapped }),
    })
    const { categorised } = await categoriseRes.json()

    const toInsert = mapped.map((tx, i) => ({
      user_id: user.id,
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount),
      currency: tx.currency,
      amount_gbp: Math.abs(tx.amount),
      category: categorised?.[i]?.category || 'Other',
      type: categorised?.[i]?.type || (tx.amount > 0 ? 'income' : 'expense'),
      is_flagged: categorised?.[i]?.is_flagged || false,
      finn_note: categorised?.[i]?.finn_note || null,
    }))

    const { error: insertError } = await supabase.from('transactions').insert(toInsert)
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    // Log agent action
    await supabase.from('agent_logs').insert({
      user_id: user.id,
      agent: 'FINN',
      action: `CSV import: ${toInsert.length} transactions categorised`,
      result: `${toInsert.filter(t => t.is_flagged).length} flagged`,
    })

    return NextResponse.json({ imported: toInsert.length, flagged: toInsert.filter(t => t.is_flagged).length, errors: [] })
  } catch (_error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
