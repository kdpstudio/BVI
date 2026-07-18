'use client'

import { useState, useEffect } from 'react'
import { MetricCard } from '@/components/ui/metric-card'
import { CyberButton } from '@/components/ui/cyber-button'
import { AlertTriangle, Calendar, FileText } from 'lucide-react'
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
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-shrink-0 gap-3">
        <div>
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-1">{'// SAGE · AI TAX ADVISOR'}</div>
          <div className="font-orbitron text-2xl text-text">
            TAX <span className="text-green" style={{ textShadow: '0 0 10px rgba(0,255,136,0.4)' }}>INTELLIGENCE</span>
          </div>
          <div className="font-mono-tech text-[9px] tracking-[2px] text-textMuted mt-1">
            {'// TAX YEAR 2025/26 · '}{taxData?.country || 'UK'}
          </div>
        </div>
        <Link
          href="/agents/sage"
          className="px-4 py-2 font-orbitron text-[11px] tracking-[2px] border border-green/40 text-green hover:bg-green/10 transition-colors"
          style={{ boxShadow: '0 0 10px rgba(0,255,136,0.1)' }}
        >
          CHAT WITH SAGE →
        </Link>
      </div>

      {/* Warning banner */}
      <div className="relative bg-surface border border-yellow/30 p-4 flex items-center gap-3">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-yellow/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-yellow/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-yellow/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-yellow/40" />
        <AlertTriangle size={14} className="text-yellow flex-shrink-0" />
        <p className="text-yellow text-xs font-rajdhani">SAGE provides estimates only. Always verify with a qualified accountant before filing.</p>
      </div>

      {/* Metrics */}
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
        <div className="relative bg-surface border border-green/20 p-6">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-green/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-green/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green/40" />
          <p className="text-textMuted font-rajdhani text-sm">Upload transactions to see tax estimates.</p>
        </div>
      )}

      {/* Tax breakdown */}
      {taxData && (
        <div className="relative bg-surface border border-green/20 p-5">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-green/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-green/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green/40" />
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// TAX BREAKDOWN'}</div>
          <div className="flex flex-col gap-3">
            {taxData.breakdown.map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-textMuted text-sm font-rajdhani">{item.label}</span>
                <span className="font-orbitron text-sm text-text">{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="pt-3 flex items-center justify-between">
              <span className="text-text text-sm font-orbitron tracking-wider">TOTAL ESTIMATED TAX</span>
              <span className="font-orbitron text-green" style={{ textShadow: '0 0 8px rgba(0,255,136,0.4)' }}>
                {fmt(taxData.breakdown.reduce((s, i) => s + i.amount, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key deadlines */}
      {taxData && (
        <div className="relative bg-surface border border-cyan/20 p-5">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// KEY DEADLINES'}</div>
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
        </div>
      )}

      {/* Ask SAGE quick actions */}
      <div className="relative bg-surface border border-green/20 p-5">
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-green/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-green/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-green/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-green/40" />
        <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// ASK SAGE'}</div>
        <div className="flex flex-wrap gap-2">
          {['Estimate my tax bill', 'What can I deduct?', 'Next deadline?', 'Am I VAT registered?'].map(q => (
            <Link
              key={q}
              href="/agents/sage"
              className="border border-green/20 text-textMuted text-xs font-rajdhani px-3 py-1.5 hover:border-green/50 hover:text-text transition-colors"
            >
              <FileText size={10} className="inline mr-1.5 text-green" />{q}
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
