'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Transaction } from '@/types'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TransactionTableProps {
  transactions: Transaction[]
  onRefresh: () => void
}

const PAGE_SIZE = 25

export function TransactionTable({ transactions, onRefresh }: TransactionTableProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'flagged'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  async function handleBulkDelete() {
    if (selected.size === 0) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('transactions').delete().in('id', Array.from(selected))
      if (error) throw error
      toast.success(`Deleted ${selected.size} transaction${selected.size > 1 ? 's' : ''}`)
      setSelected(new Set())
      onRefresh()
    } catch {
      toast.error('Failed to delete transactions')
    } finally {
      setDeleting(false)
    }
  }

  function toggleAll() {
    if (selected.size === paged.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map(t => t.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = transactions.filter(t => {
    if (filter === 'income' && t.type !== 'income') return false
    if (filter === 'expense' && t.type !== 'expense') return false
    if (filter === 'flagged' && !t.is_flagged) return false
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const FILTERS = ['all', 'income', 'expense', 'flagged'] as const

  return (
    <div>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-surface2 border border-cyan/20">
          <span className="font-mono-tech text-[10px] text-cyan/60">{selected.size} SELECTED</span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs font-orbitron text-red hover:opacity-80 transition-opacity disabled:opacity-40 ml-auto"
          >
            <Trash2 size={12} /> {deleting ? 'DELETING...' : 'DELETE SELECTED'}
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs font-orbitron text-textMuted hover:text-text transition-colors">
            CLEAR
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`px-3 py-2 text-xs font-orbitron uppercase transition-colors ${filter === f ? 'bg-cyan text-background' : 'border border-border text-textMuted hover:border-cyan/50'}`}
          >
            {f}
          </button>
        ))}
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search..."
          className="w-full sm:w-auto sm:ml-auto px-3 py-1 bg-surface border border-border text-text text-sm font-rajdhani outline-none focus:border-cyan"
        />
      </div>

      {paged.length === 0 ? (
        <div className="text-center py-12 text-textMuted font-rajdhani">
          {transactions.length === 0 ? 'Upload a CSV or add transactions manually to get started.' : 'No transactions match your filter.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-2 w-8">
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selected.size === paged.length}
                    onChange={toggleAll}
                    className="accent-cyan cursor-pointer"
                  />
                </th>
                {['Date', 'Description', 'Category', 'Amount', 'Flag'].map(h => (
                  <th key={h} className="text-left text-xs font-orbitron text-textMuted pb-2 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((tx) => (
                <tr key={tx.id} className={`border-b border-border/40 hover:bg-surface2/50 transition-colors ${selected.has(tx.id) ? 'bg-cyan/5' : ''}`}>
                  <td className="py-2.5 pr-2">
                    <input
                      type="checkbox"
                      checked={selected.has(tx.id)}
                      onChange={() => toggleOne(tx.id)}
                      className="accent-cyan cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 pr-4 text-textMuted text-xs font-mono whitespace-nowrap">{formatDate(tx.date)}</td>
                  <td className="py-2.5 pr-4 text-text text-sm font-rajdhani max-w-xs truncate">{tx.description}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <span className="text-xs font-orbitron px-2 py-0.5 bg-surface2 border border-border text-textMuted">{tx.category}</span>
                  </td>
                  <td className={`py-2.5 pr-4 font-orbitron text-sm whitespace-nowrap ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                    {tx.type === 'income' ? '+' : '-'}£{Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    {tx.is_flagged && (
                      <span title={tx.finn_note || 'Flagged for review'}>
                        <AlertTriangle size={14} className="text-yellow" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-7 h-7 text-xs font-orbitron transition-colors ${page === i ? 'bg-cyan text-background' : 'border border-border text-textMuted hover:border-cyan/50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
