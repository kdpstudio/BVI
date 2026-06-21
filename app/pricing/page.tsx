'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Check, X } from 'lucide-react'
import { BillingToggle } from '@/components/pricing/billing-toggle'
import { TierCard } from '@/components/pricing/tier-card'
import { Currency, Tier } from '@/types'
import { toast } from 'sonner'

type BillingCycle = 'monthly' | 'annual' | 'lifetime'

const CURRENCIES: { value: Currency; flag: string; label: string }[] = [
  { value: 'GBP', flag: '🇬🇧', label: 'GBP £' },
  { value: 'USD', flag: '🇺🇸', label: 'USD $' },
  { value: 'CAD', flag: '🇨🇦', label: 'CAD CA$' },
]

const COMPARISON_FEATURES = [
  { label: 'Transactions/month', free: '50', solo: '500', studio: '2,000', agency: '5,000' },
  { label: 'Users', free: '1', solo: '1', studio: '5', agency: '15' },
  { label: 'FINN AI CFO', free: true, solo: true, studio: true, agency: true },
  { label: 'SAGE Tax Advisor', free: false, solo: true, studio: true, agency: true },
  { label: 'REX Operations', free: false, solo: true, studio: true, agency: true },
  { label: 'ARIA CEO Advisor', free: false, solo: false, studio: true, agency: true },
  { label: 'MAX Growth Manager', free: false, solo: false, studio: true, agency: true },
  { label: 'Full Agent Chat', free: false, solo: true, studio: true, agency: true },
  { label: 'Business Health Score', free: false, solo: false, studio: true, agency: true },
  { label: 'Priority Support', free: false, solo: false, studio: true, agency: true },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [currency, setCurrency] = useState<Currency>('GBP')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const IS_FOUNDING = true

  async function handleSelect(tier: Tier) {
    if (tier === 'free') { router.push('/signup'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle, isFounding: IS_FOUNDING }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start checkout'
      // If not authenticated, redirect to signup
      if (msg.includes('Unauthorized')) { router.push('/signup'); return }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const CellValue = ({ val }: { val: boolean | string }) => {
    if (typeof val === 'boolean') {
      return val
        ? <Check size={14} className="text-cyan mx-auto" />
        : <X size={14} className="text-textDim mx-auto" />
    }
    return <span className="text-text text-xs font-rajdhani">{val}</span>
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-orbitron text-xl text-cyan tracking-[0.2em]">BVI</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-textMuted font-orbitron text-xs hover:text-cyan transition-colors">LOGIN</Link>
          <Link href="/signup" className="bg-cyan text-background font-orbitron text-xs px-4 py-2 hover:brightness-110 transition-all">GET STARTED</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-3xl md:text-4xl text-text mb-3">CHOOSE YOUR INTELLIGENCE TIER</h1>
          <p className="text-textMuted font-rajdhani text-lg">Scale from solo freelancer to full agency</p>
        </div>

        {/* Founding alert */}
        {IS_FOUNDING && (
          <div className="border border-yellow/30 bg-yellow/5 p-4 mb-8 flex items-center gap-3 animate-pulse-glow">
            <Zap size={18} className="text-yellow flex-shrink-0" />
            <div>
              <p className="font-orbitron text-xs text-yellow">FOUNDING MEMBER PRICES ACTIVE</p>
              <p className="text-textMuted text-xs font-rajdhani mt-0.5">Limited spots remaining — lock in your rate before we launch publicly</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <BillingToggle value={billingCycle} onChange={setBillingCycle} />
          <div className="flex border border-border">
            {CURRENCIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCurrency(c.value)}
                className={`px-4 py-2.5 font-orbitron text-xs transition-all ${currency === c.value ? 'bg-surface2 text-text' : 'text-textMuted hover:text-text'}`}
              >
                {c.flag} {c.value}
              </button>
            ))}
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {(['free', 'solo', 'studio', 'agency'] as Tier[]).map(t => (
            <TierCard
              key={t}
              tierId={t}
              billingCycle={billingCycle}
              currency={currency}
              isFounding={IS_FOUNDING}
              onSelect={handleSelect}
              loading={loading}
              highlighted={t === 'solo'}
            />
          ))}
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="font-orbitron text-lg text-text mb-6 text-center">FEATURE COMPARISON</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-orbitron text-textMuted pb-3 pr-4 w-1/3">FEATURE</th>
                  {['FREE', 'SOLO', 'STUDIO', 'AGENCY'].map(h => (
                    <th key={h} className="text-center text-xs font-orbitron text-cyan pb-3 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-surface2/30 transition-colors">
                    <td className="py-3 pr-4 text-textMuted text-xs font-rajdhani">{row.label}</td>
                    <td className="py-3 px-2 text-center"><CellValue val={row.free} /></td>
                    <td className="py-3 px-2 text-center"><CellValue val={row.solo} /></td>
                    <td className="py-3 px-2 text-center"><CellValue val={row.studio} /></td>
                    <td className="py-3 px-2 text-center"><CellValue val={row.agency} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust section */}
        <div className="flex flex-wrap items-center justify-center gap-8 border-t border-border pt-8 text-textMuted text-xs font-orbitron">
          <span>🔒 SECURED BY STRIPE</span>
          <span>🤖 POWERED BY CLAUDE AI</span>
          <span>🇪🇺 GDPR COMPLIANT</span>
          <span>🇬🇧 UK · 🇺🇸 US · 🇨🇦 CA</span>
        </div>
      </div>
    </div>
  )
}
