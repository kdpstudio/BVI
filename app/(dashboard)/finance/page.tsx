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

interface PLData {
  income: number
  expenses: number
  net: number
  margin: number
  incomeChange: number
  netChange: number
}

const MOCK_CHART_DATA = [
  { month: 'Jan', income: 8200, expenses: 3100 },
  { month: 'Feb', income: 9400, expenses: 2800 },
  { month: 'Mar', income: 7800, expenses: 3400 },
  { month: 'Apr', income: 11200, expenses: 3200 },
  { month: 'May', income: 10800, expenses: 2900 },
  { month: 'Jun', income: 12450, expenses: 4220 },
]

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pl, setPl] = useState<PLData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('transactions')
      .select('*')
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">💰</span>
            <h1 className="font-orbitron text-xl text-text">FINN — AI CFO</h1>
            <StatusDot status="active" label />
          </div>
          <p className="text-textMuted font-rajdhani text-sm">Financial intelligence and bookkeeping</p>
        </div>
        <Link href="/agents/finn" className="border border-cyan text-cyan font-orbitron text-xs px-4 py-2 hover:bg-cyanGlow transition-colors">
          CHAT WITH FINN →
        </Link>
      </div>

      {/* P&L Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border p-4 h-24 animate-pulse" />
          ))}
        </div>
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
      <CyberCard variant="purple" title="REVENUE VS EXPENSES — LAST 6 MONTHS">
        <PlChart data={MOCK_CHART_DATA} />
      </CyberCard>

      {/* Transaction List */}
      <CyberCard variant="ghost" title="TRANSACTIONS">
        <TransactionTable transactions={transactions} onRefresh={fetchData} />
      </CyberCard>
    </div>
  )
}
