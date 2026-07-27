'use client'

import { useState, useEffect, useCallback } from 'react'
import { CyberCard } from '@/components/ui/cyber-card'
import { StatusDot } from '@/components/ui/status-dot'
import { createClient } from '@/lib/supabase/client'
import { renderInvoiceHtml, InvoiceLineItem } from '@/lib/invoice/template'
import { toast } from 'sonner'
import { Plus, Trash2, Printer, Sparkles, Repeat } from 'lucide-react'

const CURRENCIES = [
  { value: 'GBP', symbol: '£' },
  { value: 'USD', symbol: '$' },
  { value: 'EUR', symbol: '€' },
]

interface RecurringInvoiceRow {
  id: string
  client_name: string
  frequency: string
  next_run_date: string
  active: boolean
}

export default function InvoicePage() {
  const [form, setForm] = useState({
    invoiceNo: `INV-${new Date().getFullYear()}-001`,
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    currency: 'GBP',
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    notes: '',
    vatRate: '',
  })
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { description: '', qty: 1, rate: 0 },
  ])

  const [brandedActive, setBrandedActive] = useState(false)
  const [recurringActive, setRecurringActive] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [brandColor, setBrandColor] = useState('#00c8ff')
  const [savingBranding, setSavingBranding] = useState(false)
  const [buyingAddon, setBuyingAddon] = useState<string | null>(null)

  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly'>('monthly')
  const [savingRecurring, setSavingRecurring] = useState(false)
  const [recurringList, setRecurringList] = useState<RecurringInvoiceRow[]>([])

  const loadAddons = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('addon_branded_invoices, addon_recurring_invoices, invoice_logo_url, invoice_brand_color')
      .eq('id', user.id)
      .single()
    if (data) {
      setBrandedActive(data.addon_branded_invoices ?? false)
      setRecurringActive(data.addon_recurring_invoices ?? false)
      setLogoUrl(data.invoice_logo_url ?? '')
      setBrandColor(data.invoice_brand_color ?? '#00c8ff')
    }
    const { data: recurring } = await supabase
      .from('recurring_invoices')
      .select('id, client_name, frequency, next_run_date, active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRecurringList(recurring ?? [])
  }, [])

  useEffect(() => { loadAddons() }, [loadAddons])

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function addItem() {
    setItems(p => [...p, { description: '', qty: 1, rate: 0 }])
  }

  function updateItem(index: number, k: keyof InvoiceLineItem, v: string | number) {
    setItems(p => p.map((it, i) => i === index ? { ...it, [k]: v } : it))
  }

  function removeItem(index: number) {
    setItems(p => p.filter((_, i) => i !== index))
  }

  const currencySymbol = CURRENCIES.find(c => c.value === form.currency)?.symbol ?? '£'
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
  const vatRate = parseFloat(form.vatRate) || 0
  const vatAmount = subtotal * (vatRate / 100)
  const total = subtotal + vatAmount

  const fmt = (n: number) => `${currencySymbol}${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  function generateInvoice() {
    const html = renderInvoiceHtml({
      invoiceNo: form.invoiceNo,
      date: form.date,
      dueDate: form.dueDate,
      currency: form.currency,
      fromName: form.fromName,
      fromEmail: form.fromEmail,
      fromAddress: form.fromAddress,
      toName: form.toName,
      toEmail: form.toEmail,
      toAddress: form.toAddress,
      notes: form.notes,
      vatRate,
      items,
      branding: { active: brandedActive, logoUrl, brandColor },
    })

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html + '<script>window.onload=()=>window.print()</script>')
      win.document.close()
    }
  }

  async function handleBuyAddon(product: 'branded_invoices' | 'recurring_invoices') {
    setBuyingAddon(product)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error()
    } catch {
      toast.error('Failed to start checkout')
      setBuyingAddon(null)
    }
  }

  async function handleSaveBranding() {
    setSavingBranding(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error()
      const { error } = await supabase.from('users').update({
        invoice_logo_url: logoUrl || null,
        invoice_brand_color: brandColor,
      }).eq('id', user.id)
      if (error) throw error
      toast.success('Branding saved')
    } catch {
      toast.error('Failed to save branding')
    } finally {
      setSavingBranding(false)
    }
  }

  async function handleSaveRecurring() {
    if (!form.toName.trim()) {
      toast.error('Add a client name first')
      return
    }
    setSavingRecurring(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error()

      const next = new Date()
      if (recurringFrequency === 'weekly') next.setDate(next.getDate() + 7)
      else next.setMonth(next.getMonth() + 1)

      const { error } = await supabase.from('recurring_invoices').insert({
        user_id: user.id,
        client_name: form.toName,
        client_email: form.toEmail || null,
        client_address: form.toAddress || null,
        from_name: form.fromName || null,
        from_email: form.fromEmail || null,
        from_address: form.fromAddress || null,
        currency: form.currency,
        vat_rate: vatRate,
        items,
        notes: form.notes || null,
        frequency: recurringFrequency,
        next_run_date: next.toISOString().slice(0, 10),
      })
      if (error) throw error
      toast.success(`Recurring invoice set up — next send ${next.toLocaleDateString('en-GB')}`)
      loadAddons()
    } catch {
      toast.error('Failed to set up recurring invoice')
    } finally {
      setSavingRecurring(false)
    }
  }

  async function handleCancelRecurring(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('recurring_invoices').update({ active: false }).eq('id', id)
    if (error) { toast.error('Failed to cancel'); return }
    toast.success('Recurring invoice cancelled')
    loadAddons()
  }

  const inputCls = 'w-full bg-surface border border-border px-3 py-2 text-text text-sm font-rajdhani outline-none focus:border-cyan/60 transition-colors'
  const labelCls = 'block text-xs font-orbitron text-cyan/60 uppercase tracking-widest mb-1'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🧾</span>
            <h1 className="font-orbitron text-xl text-text">INVOICE FORGE</h1>
            <StatusDot status="active" label />
          </div>
          <p className="text-textMuted font-rajdhani text-sm">Generate professional invoices — print or save as PDF</p>
        </div>
        <button
          onClick={generateInvoice}
          className="flex items-center gap-2 bg-cyan text-background font-orbitron text-xs px-5 py-2.5 hover:opacity-90 transition-opacity"
        >
          <Printer size={14} /> GENERATE PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice details */}
        <CyberCard variant="cyan" title="INVOICE DETAILS">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Invoice No.</label>
              <input className={inputCls} value={form.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select className={inputCls} value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Issue Date</label>
              <input type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" className={inputCls} value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
        </CyberCard>

        {/* VAT */}
        <CyberCard variant="ghost" title="TAX / VAT">
          <div>
            <label className={labelCls}>VAT Rate % (leave blank if none)</label>
            <input className={inputCls} placeholder="e.g. 20" value={form.vatRate} onChange={e => set('vatRate', e.target.value)} />
          </div>
          <div className="mt-4 p-3 border border-border bg-surface2 font-mono-tech text-xs space-y-1">
            <div className="flex justify-between text-textMuted"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {vatRate > 0 && <div className="flex justify-between text-textMuted"><span>VAT ({vatRate}%)</span><span>{fmt(vatAmount)}</span></div>}
            <div className="flex justify-between text-cyan font-bold pt-1 border-t border-border"><span>TOTAL</span><span>{fmt(total)}</span></div>
          </div>
        </CyberCard>

        {/* From */}
        <CyberCard variant="ghost" title="FROM (YOUR DETAILS)">
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>Name / Business</label>
              <input className={inputCls} placeholder="Smith Studio" value={form.fromName} onChange={e => set('fromName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} placeholder="hello@smithstudio.com" value={form.fromEmail} onChange={e => set('fromEmail', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <textarea className={inputCls} rows={3} placeholder="123 High St&#10;London, EC1A 1BB" value={form.fromAddress} onChange={e => set('fromAddress', e.target.value)} />
            </div>
          </div>
        </CyberCard>

        {/* To */}
        <CyberCard variant="ghost" title="BILL TO (CLIENT)">
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>Client Name / Company</label>
              <input className={inputCls} placeholder="Acme Corp" value={form.toName} onChange={e => set('toName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Client Email</label>
              <input className={inputCls} placeholder="accounts@acme.com" value={form.toEmail} onChange={e => set('toEmail', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Client Address</label>
              <textarea className={inputCls} rows={3} placeholder="1 Corporate Way&#10;London, W1A 0AX" value={form.toAddress} onChange={e => set('toAddress', e.target.value)} />
            </div>
          </div>
        </CyberCard>
      </div>

      {/* Line items */}
      <CyberCard variant="purple" title="LINE ITEMS">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Description', 'Qty', `Rate (${currencySymbol})`, `Amount (${currencySymbol})`, ''].map(h => (
                  <th key={h} className="text-left text-xs font-orbitron text-textMuted pb-2 pr-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-border/40">
                  <td className="py-2 pr-3">
                    <input className={inputCls} placeholder="Design work" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} />
                  </td>
                  <td className="py-2 pr-3 w-20">
                    <input type="number" min="1" className={inputCls} value={item.qty} onChange={e => updateItem(index, 'qty', parseFloat(e.target.value) || 1)} />
                  </td>
                  <td className="py-2 pr-3 w-32">
                    <input type="number" min="0" step="0.01" className={inputCls} value={item.rate} onChange={e => updateItem(index, 'rate', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="py-2 pr-3 w-32 font-orbitron text-sm text-cyan whitespace-nowrap">
                    {fmt(item.qty * item.rate)}
                  </td>
                  <td className="py-2 w-8">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(index)} aria-label="Remove line item" className="text-textMuted hover:text-red transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan rounded">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={addItem}
          className="mt-3 flex items-center gap-2 text-xs font-orbitron text-cyan/60 hover:text-cyan transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
        >
          <Plus size={12} /> ADD LINE ITEM
        </button>
      </CyberCard>

      {/* Notes */}
      <CyberCard variant="ghost" title="NOTES / PAYMENT TERMS">
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="Payment due within 30 days. Bank transfer preferred. Sort code: 00-00-00 Account: 12345678"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </CyberCard>

      {/* Branded Invoices add-on */}
      <CyberCard variant={brandedActive ? 'cyan' : 'ghost'} title="BRANDED INVOICES">
        {brandedActive ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Logo URL</label>
              <input className={inputCls} placeholder="https://.../logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Brand Colour</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="h-9 w-12 bg-surface border border-border cursor-pointer" />
                <input className={inputCls} value={brandColor} onChange={e => setBrandColor(e.target.value)} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <button onClick={handleSaveBranding} disabled={savingBranding} className="bg-cyan text-background font-orbitron text-xs px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40">
                {savingBranding ? 'SAVING...' : 'SAVE BRANDING'}
              </button>
              <p className="text-textMuted text-xs font-rajdhani mt-2">The BVI watermark is removed from every invoice you generate.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-orbitron text-xs text-cyan mb-1 flex items-center gap-1.5"><Sparkles size={12} /> ADD YOUR LOGO, REMOVE THE BVI WATERMARK</p>
              <p className="font-rajdhani text-sm text-textMuted">Invoices your clients see should look like they came from you, not a template tool. £5/month.</p>
            </div>
            <button onClick={() => handleBuyAddon('branded_invoices')} disabled={buyingAddon === 'branded_invoices'} className="bg-cyan text-background font-orbitron text-xs px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap">
              {buyingAddon === 'branded_invoices' ? 'LOADING...' : 'ADD BRANDING — £5/MO'}
            </button>
          </div>
        )}
      </CyberCard>

      {/* Recurring Invoices add-on */}
      <CyberCard variant={recurringActive ? 'purple' : 'ghost'} title="RECURRING INVOICES">
        {recurringActive ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div>
                <label className={labelCls}>Frequency</label>
                <select className={inputCls} value={recurringFrequency} onChange={e => setRecurringFrequency(e.target.value as 'weekly' | 'monthly')}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <button onClick={handleSaveRecurring} disabled={savingRecurring} className="flex items-center gap-2 bg-purple text-background font-orbitron text-xs px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap">
                <Repeat size={12} /> {savingRecurring ? 'SAVING...' : 'MAKE THIS INVOICE RECURRING'}
              </button>
            </div>
            <p className="text-textMuted text-xs font-rajdhani">Uses the client and line items above. BVI emails the invoice to the client automatically on schedule.</p>

            {recurringList.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="font-mono-tech text-[9px] text-textMuted tracking-[2px] mb-2">ACTIVE RECURRING INVOICES</p>
                <div className="flex flex-col gap-2">
                  {recurringList.filter(r => r.active).map(r => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2 border border-border bg-surface2">
                      <div>
                        <p className="font-orbitron text-xs text-text">{r.client_name}</p>
                        <p className="font-rajdhani text-xs text-textMuted">{r.frequency} · next {new Date(r.next_run_date).toLocaleDateString('en-GB')}</p>
                      </div>
                      <button onClick={() => handleCancelRecurring(r.id)} className="text-textMuted hover:text-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-orbitron text-xs text-purple mb-1 flex items-center gap-1.5"><Repeat size={12} /> AUTO-SEND INVOICES ON A SCHEDULE</p>
              <p className="font-rajdhani text-sm text-textMuted">Set it once for a retainer client and stop remembering to invoice them every month. £9/month.</p>
            </div>
            <button onClick={() => handleBuyAddon('recurring_invoices')} disabled={buyingAddon === 'recurring_invoices'} className="bg-purple text-background font-orbitron text-xs px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap">
              {buyingAddon === 'recurring_invoices' ? 'LOADING...' : 'ADD RECURRING — £9/MO'}
            </button>
          </div>
        )}
      </CyberCard>
    </div>
  )
}
