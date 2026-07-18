'use client'

import { useState, useEffect, useCallback } from 'react'
import { CyberCard } from '@/components/ui/cyber-card'
import { StatusDot } from '@/components/ui/status-dot'
import { EmptyState } from '@/components/ui/empty-state'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string | null
  contact: string | null
  country: string | null
  notes: string | null
  total_billed: number
  created_at: string
}

const inputCls = 'w-full bg-surface border border-border px-3 py-2 text-text text-sm font-rajdhani outline-none focus:border-cyan/60 transition-colors'
const labelCls = 'block text-xs font-orbitron text-cyan/60 uppercase tracking-widest mb-1'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', contact: '', country: '', notes: '', total_billed: '' })

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setClients((data || []) as Client[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        name: form.name.trim(),
        email: form.email.trim() || null,
        contact: form.contact.trim() || null,
        country: form.country.trim() || null,
        notes: form.notes.trim() || null,
        total_billed: parseFloat(form.total_billed) || 0,
      })
      if (error) throw error
      toast.success('Client added')
      setForm({ name: '', email: '', contact: '', country: '', notes: '', total_billed: '' })
      setShowForm(false)
      fetchClients()
    } catch {
      toast.error('Failed to add client')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this client?')) return
    const supabase = createClient()
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { toast.error('Failed to remove client'); return }
    toast.success('Client removed')
    fetchClients()
  }

  const totalBilled = clients.reduce((s, c) => s + (c.total_billed || 0), 0)
  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🗂️</span>
            <h1 className="font-orbitron text-xl text-text">CLIENT VAULT</h1>
            <StatusDot status="active" label />
          </div>
          <p className="text-textMuted font-rajdhani text-sm">Track clients, billing history, and project context</p>
        </div>
        <div className="flex gap-2">
          <Link href="/invoice" className="flex items-center gap-1.5 border border-orange-400/40 text-orange-400/70 font-orbitron text-xs px-3 py-2 hover:bg-orange-400/10 hover:text-orange-400 transition-colors">
            <ExternalLink size={12} /> NEW INVOICE
          </Link>
          <button
            onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-2 bg-orange-400 text-background font-orbitron text-xs px-4 py-2 hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> ADD CLIENT
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: clients.length.toString() },
          { label: 'Total Billed', value: fmt(totalBilled) },
          { label: 'Avg per Client', value: clients.length ? fmt(totalBilled / clients.length) : '£0.00' },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border bg-surface2 p-4">
            <p className="font-mono-tech text-[9px] text-textMuted tracking-[2px] mb-1">{label.toUpperCase()}</p>
            <p className="font-orbitron text-lg text-orange-400">{value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <CyberCard variant="ghost" title="NEW CLIENT">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client / Company Name *</label>
              <input className={inputCls} placeholder="Acme Corp" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} placeholder="accounts@acme.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Contact Name</label>
              <input className={inputCls} placeholder="Jane Smith" value={form.contact} onChange={e => set('contact', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input className={inputCls} placeholder="UK" value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Total Billed (£)</label>
              <input type="number" min="0" step="0.01" className={inputCls} placeholder="0.00" value={form.total_billed} onChange={e => set('total_billed', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Notes</label>
              <input className={inputCls} placeholder="Project details, payment terms..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={!form.name.trim() || saving} className="bg-orange-400 text-background font-orbitron text-xs px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40">
              {saving ? 'SAVING...' : 'ADD CLIENT'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-border text-textMuted font-orbitron text-xs px-5 py-2.5 hover:border-orange-400/30 transition-colors">
              CANCEL
            </button>
          </div>
        </CyberCard>
      )}

      {/* Client list */}
      <CyberCard variant="ghost" title={`CLIENTS (${clients.length})`}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface2 animate-pulse" />)}
          </div>
        ) : clients.length === 0 ? (
          <EmptyState symbol="🗂️" title="NO CLIENTS YET" description="Add your first client to start tracking billing and project history." color="#fb923c" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Client', 'Contact', 'Country', 'Total Billed', 'Notes', ''].map(h => (
                    <th key={h} className="text-left text-xs font-orbitron text-textMuted pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-surface2/50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-orbitron text-xs text-text">{c.name}</p>
                      {c.email && <p className="font-rajdhani text-xs text-textMuted">{c.email}</p>}
                    </td>
                    <td className="py-3 pr-4 text-sm font-rajdhani text-textMuted">{c.contact || '—'}</td>
                    <td className="py-3 pr-4 text-sm font-rajdhani text-textMuted">{c.country || '—'}</td>
                    <td className="py-3 pr-4 font-orbitron text-sm text-orange-400">{fmt(c.total_billed || 0)}</td>
                    <td className="py-3 pr-4 text-xs font-rajdhani text-textMuted max-w-xs truncate">{c.notes || '—'}</td>
                    <td className="py-3">
                      <button onClick={() => handleDelete(c.id)} aria-label={`Remove ${c.name}`} className="text-textMuted hover:text-red transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan rounded">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CyberCard>

      {/* REX prompt */}
      <div className="border border-orange-400/20 bg-orange-400/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="font-orbitron text-xs text-orange-400 mb-1">🗂️ REX — AI OPERATIONS MANAGER</p>
          <p className="font-rajdhani text-sm text-textMuted">Ask REX to draft proposals, contracts, or compliance checks tailored to specific clients.</p>
        </div>
        <Link href="/agents/rex?message=Help me draft a proposal for a new client" className="border border-orange-400/40 text-orange-400 font-orbitron text-xs px-4 py-2 hover:bg-orange-400/10 transition-colors whitespace-nowrap">
          ASK REX →
        </Link>
      </div>
    </div>
  )
}
