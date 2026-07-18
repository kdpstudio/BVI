'use client'

import { useState } from 'react'
import { CyberCard } from '@/components/ui/cyber-card'
import { StatusDot } from '@/components/ui/status-dot'
import { Plus, Trash2, Printer } from 'lucide-react'

interface LineItem {
  id: string
  description: string
  qty: number
  rate: number
}

const CURRENCIES = [
  { value: 'GBP', symbol: '£' },
  { value: 'USD', symbol: '$' },
  { value: 'EUR', symbol: '€' },
]

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
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: '', qty: 1, rate: 0 },
  ])

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function addItem() {
    setItems(p => [...p, { id: Date.now().toString(), description: '', qty: 1, rate: 0 }])
  }

  function updateItem(id: string, k: keyof LineItem, v: string | number) {
    setItems(p => p.map(i => i.id === id ? { ...i, [k]: v } : i))
  }

  function removeItem(id: string) {
    setItems(p => p.filter(i => i.id !== id))
  }

  const currencySymbol = CURRENCIES.find(c => c.value === form.currency)?.symbol ?? '£'
  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0)
  const vatRate = parseFloat(form.vatRate) || 0
  const vatAmount = subtotal * (vatRate / 100)
  const total = subtotal + vatAmount

  const fmt = (n: number) => `${currencySymbol}${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  function generateInvoice() {
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Invoice ${form.invoiceNo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 3px solid #00c8ff; padding-bottom: 24px; }
  .brand { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #00c8ff; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 22px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
  .invoice-meta p { font-size: 13px; color: #666; margin-bottom: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
  .party h3 { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #00c8ff; margin-bottom: 8px; }
  .party p { font-size: 13px; line-height: 1.7; color: #444; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #f0faff; }
  th { text-align: left; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 10px 12px; color: #00c8ff; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid #eef2f7; }
  .text-right { text-align: right; }
  .totals { margin-left: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #eef2f7; }
  .totals .total { font-weight: 700; font-size: 16px; color: #00c8ff; border-bottom: none; margin-top: 4px; }
  .notes { margin-top: 40px; padding-top: 24px; border-top: 1px solid #eef2f7; font-size: 12px; color: #888; }
  .footer { margin-top: 48px; text-align: center; font-size: 10px; color: #ccc; letter-spacing: 2px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">BVI</div>
    <p style="font-size:11px;color:#aaa;letter-spacing:2px;margin-top:4px;">BLACK VAULT INTELLIGENCE</p>
  </div>
  <div class="invoice-meta">
    <h2>INVOICE</h2>
    <p><strong>${form.invoiceNo}</strong></p>
    <p>Date: ${form.date}</p>
    ${form.dueDate ? `<p>Due: ${form.dueDate}</p>` : ''}
  </div>
</div>
<div class="parties">
  <div class="party">
    <h3>From</h3>
    <p><strong>${form.fromName || '—'}</strong><br>${form.fromEmail ? form.fromEmail + '<br>' : ''}${(form.fromAddress || '').replace(/\n/g, '<br>')}</p>
  </div>
  <div class="party">
    <h3>Bill To</h3>
    <p><strong>${form.toName || '—'}</strong><br>${form.toEmail ? form.toEmail + '<br>' : ''}${(form.toAddress || '').replace(/\n/g, '<br>')}</p>
  </div>
</div>
<table>
  <thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
  <tbody>
    ${items.map(i => `<tr><td>${i.description || '—'}</td><td class="text-right">${i.qty}</td><td class="text-right">${fmt(i.rate)}</td><td class="text-right">${fmt(i.qty * i.rate)}</td></tr>`).join('')}
  </tbody>
</table>
<div class="totals">
  <div class="row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
  ${vatRate ? `<div class="row"><span>VAT (${vatRate}%)</span><span>${fmt(vatAmount)}</span></div>` : ''}
  <div class="row total"><span>TOTAL (${form.currency})</span><span>${fmt(total)}</span></div>
</div>
${form.notes ? `<div class="notes"><strong>Notes:</strong><br>${form.notes}</div>` : ''}
<div class="footer">Generated by Black Vault Intelligence · blackvaultintelligence.com</div>
<script>window.onload=()=>window.print()</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
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
              {items.map(item => (
                <tr key={item.id} className="border-b border-border/40">
                  <td className="py-2 pr-3">
                    <input className={inputCls} placeholder="Design work" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                  </td>
                  <td className="py-2 pr-3 w-20">
                    <input type="number" min="1" className={inputCls} value={item.qty} onChange={e => updateItem(item.id, 'qty', parseFloat(e.target.value) || 1)} />
                  </td>
                  <td className="py-2 pr-3 w-32">
                    <input type="number" min="0" step="0.01" className={inputCls} value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="py-2 pr-3 w-32 font-orbitron text-sm text-cyan whitespace-nowrap">
                    {fmt(item.qty * item.rate)}
                  </td>
                  <td className="py-2 w-8">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} aria-label="Remove line item" className="text-textMuted hover:text-red transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan rounded">
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
    </div>
  )
}
