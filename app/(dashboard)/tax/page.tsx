'use client'

import { useState, useEffect } from 'react'
import { CyberCard } from '@/components/ui/cyber-card'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusDot } from '@/components/ui/status-dot'
import { AlertTriangle, Calendar } from 'lucide-react'
import { TaxResult } from '@/lib/tax/calculator'
import Link from 'next/link'

export default function TaxPage() {
  const [taxData, setTaxData] = useState<TaxResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sage/tax').then(r => r.json()).then(data => {
      setTaxData(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🧾</span>
            <h1 className="font-orbitron text-xl text-text">SAGE — AI TAX ADVISOR</h1>
            <StatusDot status="active" label />
          </div>
          <p className="text-textMuted font-rajdhani text-sm">Tax year 2025/26 · {taxData?.country || 'UK'}</p>
        </div>
        <Link href="/agents/sage" className="border border-green/40 text-green font-orbitron text-xs px-4 py-2 hover:bg-green/5 transition-colors">
          CHAT WITH SAGE →
        </Link>
      </div>

      <div className="border border-yellow/30 bg-yellow/5 p-3 flex items-center gap-2">
        <AlertTriangle size={14} className="text-yellow flex-shrink-0" />
        <p className="text-yellow text-xs font-rajdhani">SAGE provides estimates only. Always verify with a qualified accountant before filing.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-surface border border-border p-4 h-24 animate-pulse" />)}
        </div>
      ) : taxData ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Annual Income (YTD)" value={fmt(taxData.income)} subtitle="This tax year" />
          <MetricCard label="Income Tax" value={fmt(taxData.incomeTax)} variant="purple" />
          {taxData.nationalInsurance !== undefined && (
            <MetricCard label={taxData.country === 'CA' ? 'CPP Contributions' : 'National Insurance'} value={fmt(taxData.nationalInsurance)} />
          )}
          {taxData.selfEmploymentTax !== undefined && (
            <MetricCard label="SE Tax (15.3%)" value={fmt(taxData.selfEmploymentTax)} variant="purple" />
          )}
          <MetricCard label="Effective Tax Rate" value={`${taxData.effectiveRate.toFixed(1)}%`} subtitle="Combined rate" variant="purple" />
        </div>
      ) : (
        <p className="text-textMuted font-rajdhani text-sm">Upload transactions to see tax estimates.</p>
      )}

      {taxData && (
        <CyberCard variant="purple" title="TAX BREAKDOWN">
          <div className="flex flex-col gap-3">
            {taxData.breakdown.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-textMuted text-sm font-rajdhani">{item.label}</span>
                <span className="font-orbitron text-sm text-text">{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-text text-sm font-orbitron">TOTAL ESTIMATED TAX</span>
              <span className="font-orbitron text-cyan">{fmt(taxData.breakdown.reduce((s, i) => s + i.amount, 0))}</span>
            </div>
          </div>
        </CyberCard>
      )}

      {taxData && (
        <CyberCard variant="cyan" title="KEY DEADLINES">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Calendar size={14} className="text-cyan mt-0.5 flex-shrink-0" />
              <p className="text-text text-sm font-rajdhani">{taxData.nextDeadline}</p>
            </div>
            {taxData.quarterlyDates?.map(date => (
              <div key={date} className="flex items-start gap-3">
                <Calendar size={14} className="text-textMuted mt-0.5 flex-shrink-0" />
                <p className="text-textMuted text-sm font-rajdhani">{date}</p>
              </div>
            ))}
          </div>
        </CyberCard>
      )}

      <CyberCard variant="ghost" title="ASK SAGE">
        <div className="flex flex-wrap gap-2">
          {['Estimate my tax bill', 'What can I deduct?', 'Next deadline?', 'Am I VAT registered?'].map(q => (
            <Link key={q} href="/agents/sage" className="border border-border text-textMuted text-xs font-rajdhani px-3 py-1.5 hover:border-green/40 hover:text-text transition-colors">
              {q}
            </Link>
          ))}
        </div>
      </CyberCard>
    </div>
  )
}
