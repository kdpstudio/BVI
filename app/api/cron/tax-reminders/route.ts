import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTaxReminder } from '@/lib/email'
import { calculateUKTax, calculateUSTax, calculateCATax } from '@/lib/tax/calculator'

function calculateTax(income: number, country: string) {
  if (country === 'US') return calculateUSTax(income)
  if (country === 'CA') return calculateCATax(income)
  return calculateUKTax(income)
}

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
    .select('id, email, full_name, country, currency, notification_prefs')
    .not('email', 'is', null)

  const today = new Date()
  let sent = 0

  for (const user of users || []) {
    if (!user.notification_prefs?.tax_reminders) continue
    try {
      const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
      const { data: txs } = await admin
        .from('transactions')
        .select('amount, amount_gbp, type')
        .eq('user_id', user.id)
        .gte('date', monthStart)

      const income = (txs || []).filter((t: { type: string }) => t.type === 'income').reduce((s: number, t: { amount_gbp?: number; amount: number }) => s + (t.amount_gbp || t.amount), 0)
      const taxData = calculateTax(income * 12, user.country || 'UK')

      // Check if next deadline is within 30 days
      if (taxData.nextDeadline) {
        const deadlineMatch = taxData.nextDeadline.match(/(\d{1,2})\s(\w+)\s(\d{4})/)
        if (deadlineMatch) {
          const deadlineDate = new Date(`${deadlineMatch[2]} ${deadlineMatch[1]} ${deadlineMatch[3]}`)
          const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft > 0 && daysLeft <= 30 && [30, 14, 7, 3].includes(daysLeft)) {
            await sendTaxReminder(user.email, {
              name: user.full_name?.split(' ')[0] || 'there',
              deadline: taxData.nextDeadline,
              description: `${user.country === 'UK' ? 'HMRC Self Assessment' : 'Tax filing'} deadline`,
              daysLeft,
            })
            sent++
          }
        }
      }
    } catch {
      // Continue to next user
    }
  }

  return NextResponse.json({ sent, total: users?.length || 0 })
}
