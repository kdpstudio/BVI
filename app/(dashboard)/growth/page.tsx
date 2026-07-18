'use client'

import { useState, useEffect } from 'react'
import { MetricCard } from '@/components/ui/metric-card'
import { PlChart } from '@/components/finance/pl-chart'
import Link from 'next/link'
import { MetricCardSkeleton } from '@/components/ui/metric-card-skeleton'
import { EmptyState } from '@/components/ui/empty-state'

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
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-1">{'// MAX · AI GROWTH MANAGER'}</div>
          <div className="font-orbitron text-2xl text-text">
            GROWTH <span className="text-yellow" style={{ textShadow: '0 0 10px rgba(255,184,0,0.4)' }}>INTELLIGENCE</span>
          </div>
          <div className="font-mono-tech text-[9px] tracking-[2px] text-textMuted mt-1">
            {'// REVENUE ANALYSIS & GROWTH FORECASTING'}
          </div>
        </div>
        <Link
          href="/agents/max"
          className="px-4 py-2 font-orbitron text-[11px] tracking-[2px] border border-yellow/40 text-yellow hover:bg-yellow/10 transition-colors"
          style={{ boxShadow: '0 0 10px rgba(255,184,0,0.1)' }}
        >
          CHAT WITH MAX →
        </Link>
      </div>

      {/* Metrics */}
      {loading ? (
        <MetricCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="MoM Growth" value={data ? pct(data.momGrowth) : '—'} trend={data && data.momGrowth >= 0 ? 'up' : 'down'} trendValue="" />
          <MetricCard label="Avg Monthly Revenue" value={data ? fmt(data.avgIncome) : '—'} variant="purple" />
          <MetricCard label="Best Month" value={data?.bestMonth?.month || '—'} subtitle={data ? fmt(data.bestMonth.income) : ''} />
          <MetricCard label="Next Month Forecast" value={data && data.avgIncome > 0 ? fmt(data.avgIncome * (1 + Math.min(Math.max(data.momGrowth / 100, -0.3), 0.3))) : '—'} subtitle={data && data.avgIncome > 0 ? `Based on ${data.momGrowth >= 0 ? '+' : ''}${data.momGrowth.toFixed(1)}% trend` : 'No data yet'} variant="purple" />
        </div>
      )}

      {/* Revenue trend chart */}
      <div className="relative bg-surface border border-yellow/20 p-5">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-yellow/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-yellow/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-yellow/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-yellow/40" />
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60">{'// REVENUE TREND — LAST 6 MONTHS'}</div>
          {data?.months?.length ? (
            <span className="font-mono-tech text-[9px] px-2 py-0.5 border border-yellow/30 text-yellow/70 tracking-[2px]">LIVE DATA</span>
          ) : null}
        </div>
        {data?.months?.length ? (
          <PlChart data={data.months} />
        ) : (
          <EmptyState
            symbol="⟁"
            title="NO REVENUE DATA YET"
            description="Upload your transactions and MAX will build your revenue trend analysis."
            action={{ label: 'GO TO FINANCE', href: '/finance' }}
            color="#ffb800"
          />
        )}
      </div>

      {/* Monthly breakdown table */}
      {data?.months?.length ? (
        <div className="relative bg-surface border border-cyan/20 p-5">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// MONTHLY BREAKDOWN'}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-rajdhani">
              <thead>
                <tr className="border-b border-cyan/10">
                  <th className="text-left font-mono-tech text-[9px] tracking-[2px] text-textMuted pb-2">MONTH</th>
                  <th className="text-right font-mono-tech text-[9px] tracking-[2px] text-textMuted pb-2">INCOME</th>
                  <th className="text-right font-mono-tech text-[9px] tracking-[2px] text-textMuted pb-2">EXPENSES</th>
                  <th className="text-right font-mono-tech text-[9px] tracking-[2px] text-textMuted pb-2">NET</th>
                </tr>
              </thead>
              <tbody>
                {data.months.map((m) => (
                  <tr key={m.month} className="border-b border-border/30 last:border-0 hover:bg-cyan/[0.02] transition-colors">
                    <td className="py-2.5 text-textMuted uppercase tracking-wider text-xs">{m.month}</td>
                    <td className="py-2.5 text-right text-green font-orbitron text-xs">{fmt(m.income)}</td>
                    <td className="py-2.5 text-right text-pink font-orbitron text-xs">{fmt(m.expenses)}</td>
                    <td className={`py-2.5 text-right font-orbitron text-xs ${m.net >= 0 ? 'text-cyan' : 'text-pink'}`}>{fmt(m.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Quick analysis */}
      <div className="relative bg-surface border border-yellow/20 p-5">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-yellow/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-yellow/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-yellow/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-yellow/40" />
        <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// QUICK ANALYSIS'}</div>
        <div className="flex flex-wrap gap-2">
          {['Get Growth Report', 'Analyse Best Clients', 'Rate Calculator', 'Revenue Forecast'].map(q => (
            <Link
              key={q}
              href="/agents/max"
              className="border border-yellow/20 text-textMuted text-xs font-rajdhani px-3 py-1.5 hover:border-yellow/50 hover:text-text transition-colors"
            >
              {q}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
