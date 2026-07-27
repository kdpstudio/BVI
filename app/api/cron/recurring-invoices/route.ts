import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendRecurringInvoiceEmail } from '@/lib/email'
import { renderInvoiceHtml, InvoiceLineItem } from '@/lib/invoice/template'

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().slice(0, 10)

  const { data: due } = await admin
    .from('recurring_invoices')
    .select('*')
    .eq('active', true)
    .lte('next_run_date', today)

  let sent = 0

  for (const inv of due || []) {
    if (!inv.client_email) continue

    try {
      const { data: owner } = await admin
        .from('users')
        .select('addon_branded_invoices, invoice_logo_url, invoice_brand_color, email')
        .eq('id', inv.user_id)
        .single()

      const invoiceNo = `INV-${new Date().getFullYear()}-${String(inv.invoice_seq).padStart(3, '0')}`
      const html = renderInvoiceHtml(
        {
          invoiceNo,
          date: today,
          currency: inv.currency,
          fromName: inv.from_name || '',
          fromEmail: inv.from_email || undefined,
          fromAddress: inv.from_address || undefined,
          toName: inv.client_name,
          toEmail: inv.client_email,
          toAddress: inv.client_address || undefined,
          notes: inv.notes || undefined,
          vatRate: inv.vat_rate,
          items: inv.items as InvoiceLineItem[],
          branding: {
            active: owner?.addon_branded_invoices ?? false,
            logoUrl: owner?.invoice_logo_url,
            brandColor: owner?.invoice_brand_color,
          },
        },
        { bodyOnly: true }
      )

      await sendRecurringInvoiceEmail(inv.client_email, {
        clientName: inv.client_name,
        fromName: inv.from_name || '',
        invoiceHtml: html,
        invoiceNo,
      })

      const next = new Date(inv.next_run_date)
      if (inv.frequency === 'weekly') next.setDate(next.getDate() + 7)
      else next.setMonth(next.getMonth() + 1)

      await admin.from('recurring_invoices').update({
        next_run_date: next.toISOString().slice(0, 10),
        invoice_seq: inv.invoice_seq + 1,
      }).eq('id', inv.id)

      await admin.from('agent_logs').insert({
        user_id: inv.user_id, agent: 'REX', action: 'Recurring invoice sent', result: `${invoiceNo} → ${inv.client_email}`,
      })

      sent++
    } catch (err) {
      console.error(`Recurring invoice ${inv.id} failed:`, err)
    }
  }

  return NextResponse.json({ sent, checked: (due || []).length })
}
