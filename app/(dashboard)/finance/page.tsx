'use client'

import { useState, useEffect, useCallback } from 'react'
import { CyberCard } from '@/components/ui/cyber-card'
import { MetricCard } from '@/components/ui/metric-card'
import { CsvUpload } from '@/components/finance/csv-upload'
import { PlChart } from '@/components/finance/pl-chart'
import { TransactionTable } from '@/components/finance/transaction-table'
import { ManualEntryForm } from '@/components/finance/manual-entry-form'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types'
import Link from 'next/link'
import { StatusDot } from '@/components/ui/status-dot'
import { MetricCardSkeleton } from '@/components/ui/metric-card-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Download } from 'lucide-react'

interface PLData {
  income: number
  expenses: number
  net: number
  margin: number
  incomeChange: number
  netChange: number
}

function buildChartData(txs: Transaction[]) {
  const months: { month: string; income: number; expenses: number; net: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleString('default', { month: 'short' })
    const monthTxs = txs.filter(t => t.date.startsWith(key))
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount_gbp || t.amount), 0)
    const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount_gbp || t.amount), 0)
    months.push({ month: label, income, expenses, net: income - expenses })
  }
  return months
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pl, setPl] = useState<PLData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(500)
    setTransactions((data || []) as Transaction[])

    const month = new Date().toISOString().slice(0, 7)
    const res = await fetch(`/api/finn/pl?month=${month}`)
    if (res.ok) setPl(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">💰</span>
            <h1 className="font-orbitron text-xl text-text">FINN — AI CFO</h1>
            <StatusDot status="active" label />
          </div>
          <p className="text-textMuted font-rajdhani text-sm">Financial intelligence and bookkeeping</p>
        </div>
        <div className="flex gap-2">
          {transactions.length > 0 && (
            <a
              href="/api/transactions/export"
              download
              className="flex items-center gap-1.5 border border-cyan/30 text-cyan/70 font-orbitron text-xs px-3 py-2 hover:bg-cyan/10 hover:text-cyan transition-colors"
            >
              <Download size={12} /> EXPORT CSV
            </a>
          )}
          <Link href="/agents/finn" className="border border-cyan text-cyan font-orbitron text-xs px-4 py-2 hover:bg-cyanGlow transition-colors">
            CHAT WITH FINN →
          </Link>
        </div>
      </div>

      {/* P&L Cards */}
      {loading ? (
        <MetricCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Income" value={pl ? fmt(pl.income) : '£0.00'} trend={pl && pl.incomeChange >= 0 ? 'up' : 'down'} trendValue={pl ? pct(pl.incomeChange) : undefined} />
          <MetricCard label="Total Expenses" value={pl ? fmt(pl.expenses) : '£0.00'} variant="purple" />
          <MetricCard label="Net Profit" value={pl ? fmt(pl.net) : '£0.00'} trend={pl && pl.netChange >= 0 ? 'up' : 'down'} trendValue={pl ? pct(pl.netChange) : undefined} />
          <MetricCard label="Profit Margin" value={pl ? `${pl.margin.toFixed(1)}%` : '0%'} subtitle="This month" variant="purple" />
        </div>
      )}

      {/* CSV Upload */}
      <CyberCard variant="cyan" title="IMPORT TRANSACTIONS">
        <CsvUpload onSuccess={fetchData} />
      </CyberCard>

      {/* Manual Entry */}
      <div>
        <ManualEntryForm onSuccess={fetchData} />
      </div>

      {/* P&L Chart */}
      {transactions.length > 0 ? (
        <CyberCard variant="purple" title="REVENUE VS EXPENSES — LAST 6 MONTHS">
          <PlChart data={buildChartData(transactions)} />
        </CyberCard>
      ) : null}

      {/* Transaction List */}
      <CyberCard variant="ghost" title="TRANSACTIONS">
        {transactions.length === 0 && !loading ? (
          <EmptyState
            symbol="▦"
            title="NO TRANSACTIONS YET"
            description="Upload a bank CSV or add transactions manually to start tracking your finances."
            color="#00c8ff"
          />
        ) : (
          <TransactionTable transactions={transactions} onRefresh={fetchData} />
        )}
      </CyberCard>
    </div>
  )
}
