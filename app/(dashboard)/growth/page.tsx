'use client'

import { useState, useEffect } from 'react'
import { CyberCard } from '@/components/ui/cyber-card'
import { MetricCard } from '@/components/ui/metric-card'
import { PlChart } from '@/components/finance/pl-chart'
import { StatusDot } from '@/components/ui/status-dot'
import Link from 'next/link'

interface GrowthData {
  months: { month: string; income: number; expenses: number; net: number }[]
  avgIncome: number
  bestMonth: { month: string; income: number }
  momGrowth: number
}

export default function GrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/max/growth').then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const pct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📈</span>
            <h1 className="font-orbitron text-xl text-text">MAX — AI GROWTH MANAGER</h1>
            <StatusDot status="active" label />
          </div>
          <p className="text-textMuted font-rajdhani text-sm">Revenue analysis and growth intelligence</p>
        </div>
        <Link href="/agents/max" className="border border-yellow/40 text-yellow font-orbitron text-xs px-4 py-2 hover:bg-yellow/5 transition-colors">
          CHAT WITH MAX →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface border border-border p-4 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="MoM Growth" value={data ? pct(data.momGrowth) : '—'} trend={data && data.momGrowth >= 0 ? 'up' : 'down'} trendValue="" />
          <MetricCard label="Avg Monthly Revenue" value={data ? fmt(data.avgIncome) : '—'} variant="purple" />
          <MetricCard label="Best Month" value={data?.bestMonth?.month || '—'} subtitle={data ? fmt(data.bestMonth.income) : ''} />
          <MetricCard label="Next Month Forecast" value={data ? fmt(data.avgIncome * 1.05) : '—'} subtitle="Estimated" variant="purple" />
        </div>
      )}

      <CyberCard variant="purple" title="REVENUE TREND — LAST 6 MONTHS">
        {data?.months?.length ? (
          <PlChart data={data.months} />
        ) : (
          <div className="h-40 flex items-center justify-center text-textMuted font-rajdhani text-sm">
            Upload transactions to see revenue trends
          </div>
        )}
      </CyberCard>

      <CyberCard variant="ghost" title="QUICK ANALYSIS">
        <div className="flex flex-wrap gap-2">
          {['Get Growth Report', 'Analyse Best Clients', 'Rate Calculator', 'Revenue Forecast'].map(q => (
            <Link key={q} href="/agents/max" className="border border-border text-textMuted text-xs font-rajdhani px-3 py-1.5 hover:border-yellow/40 hover:text-text transition-colors">
              {q}
            </Link>
          ))}
        </div>
      </CyberCard>
    </div>
  )
}
