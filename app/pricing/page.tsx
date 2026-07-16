'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Check, X } from 'lucide-react'
import { Currency, Tier } from '@/types'
import { CyberButton } from '@/components/ui/cyber-button'
import { convertPrice, CURRENCY_SYMBOLS } from '@/lib/pricing/config'
import { PRICING_TIERS } from '@/lib/pricing'
import { toast } from 'sonner'

type BillingCycle = 'monthly' | 'annual'

const CURRENCIES: { value: Currency; flag: string }[] = [
  { value: 'GBP', flag: '🇬🇧' },
  { value: 'USD', flag: '🇺🇸' },
  { value: 'CAD', flag: '🇨🇦' },
]

const COMPARISON: { label: string; free: boolean | string; solo: boolean | string; studio: boolean | string; agency: boolean | string }[] = [
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

const TIER_STYLES: Record<string, { accent: string; glow: string; text: string; btn: 'cyan' | 'purple' | 'ghost' }> = {
  free:   { accent: 'border-border',    glow: '',                                            text: 'text-textMuted', btn: 'ghost' },
  solo:   { accent: 'border-cyan/40',   glow: 'shadow-[0_0_20px_rgba(0,200,255,0.1)]',      text: 'text-cyan',      btn: 'cyan' },
  studio: { accent: 'border-purple/40', glow: 'shadow-[0_0_20px_rgba(123,47,255,0.1)]',     text: 'text-purple',    btn: 'purple' },
  agency: { accent: 'border-yellow/40', glow: 'shadow-[0_0_20px_rgba(255,204,0,0.1)]',      text: 'text-yellow',    btn: 'cyan' },
}

const SPOTS: Record<string, number> = { solo: 50, studio: 25, agency: 10 }

function FoundingCard({ tierId, currency, onSelect, loading }: { tierId: Tier; currency: Currency; onSelect: (t: Tier, cycle: 'lifetime') => void; loading: boolean }) {
  const tier = PRICING_TIERS.find(t => t.id === tierId)
  if (!tier || tierId === 'free') return null
  const s = TIER_STYLES[tierId]
  const symbol = CURRENCY_SYMBOLS[currency]
  const gbp = tier.foundingLifetimeGBP || tier.lifetimeGBP
  const price = convertPrice(gbp, currency)
  const spots = SPOTS[tierId]

  return (
    <div className={`bg-surface border ${s.accent} ${s.glow} p-6 flex flex-col relative hover:scale-[1.01] transition-all duration-200`}>
      <div className={`text-xs font-orbitron mb-3 px-2 py-0.5 border inline-block w-fit ${s.text} ${s.accent}`}>
        FOUNDING · {spots} SPOTS ONLY
      </div>
      <div className={`font-orbitron text-xl mb-1 ${s.text}`}>{tier.name}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-orbitron text-3xl text-text">{symbol}{price.toLocaleString()}</span>
        <span className="text-textMuted text-sm font-rajdhani"> once</span>
      </div>
      <p className="text-textMuted text-xs font-rajdhani mb-1">Lifetime access — pay once, own forever</p>
      <p className="text-textMuted text-xs font-rajdhani mb-4">
        {tier.transactions.toLocaleString()} transactions/mo · {tier.users === 1 ? '1 user' : `Up to ${tier.users} users`}
      </p>
      <ul className="flex flex-col gap-2 mb-6 flex-1">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <Check size={12} className={`mt-0.5 flex-shrink-0 ${s.text}`} />
            <span className="text-textMuted text-xs font-rajdhani">{f}</span>
          </li>
        ))}
      </ul>
      <CyberButton variant={s.btn} fullWidth onClick={() => onSelect(tierId, 'lifetime')} disabled={loading}>
        CLAIM LIFETIME ACCESS
      </CyberButton>
    </div>
  )
}

function RegularCard({ tierId, billingCycle, currency, onSelect, loading }: { tierId: Tier; billingCycle: BillingCycle; currency: Currency; onSelect: (t: Tier, cycle: BillingCycle) => void; loading: boolean }) {
  const tier = PRICING_TIERS.find(t => t.id === tierId)
  if (!tier) return null
  const s = TIER_STYLES[tierId]
  const symbol = CURRENCY_SYMBOLS[currency]

  const getPrice = () => {
    if (tierId === 'free') return { price: '0', period: 'forever' }
    const gbp = billingCycle === 'monthly' ? tier.monthlyGBP : tier.annualGBP
    return { price: convertPrice(gbp, currency).toLocaleString(), period: billingCycle === 'monthly' ? '/mo' : '/yr' }
  }
  const { price, period } = getPrice()

  return (
    <div className={`bg-surface border ${s.accent} ${s.glow} p-6 flex flex-col relative hover:scale-[1.01] transition-all duration-200`}>
      <div className={`font-orbitron text-xl mb-1 ${s.text}`}>{tier.name}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-orbitron text-3xl text-text">{symbol}{price}</span>
        <span className="text-textMuted text-sm font-rajdhani">{period}</span>
      </div>
      <p className="text-textMuted text-xs font-rajdhani mb-4">
        {tierId === 'free' ? 'No credit card required' : `${tier.transactions.toLocaleString()} transactions/mo · ${tier.users === 1 ? '1 user' : `Up to ${tier.users} users`}`}
      </p>
      <ul className="flex flex-col gap-2 mb-6 flex-1">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <Check size={12} className={`mt-0.5 flex-shrink-0 ${s.text}`} />
            <span className="text-textMuted text-xs font-rajdhani">{f}</span>
          </li>
        ))}
      </ul>
      <CyberButton variant={tierId === 'free' ? 'ghost' : s.btn} fullWidth onClick={() => onSelect(tierId, billingCycle)} disabled={loading}>
        {tierId === 'free' ? 'START FREE' : `ACTIVATE ${tier.name}`}
      </CyberButton>
    </div>
  )
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [currency, setCurrency] = useState<Currency>('GBP')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSelect(tier: Tier, cycle: BillingCycle | 'lifetime') {
    if (tier === 'free') { router.push('/signup'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle: cycle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start checkout'
      if (msg.includes('Unauthorized')) { router.push('/signup'); return }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const Cell = ({ val }: { val: boolean | string }) =>
    typeof val === 'boolean'
      ? val ? <Check size={14} className="text-cyan mx-auto" /> : <X size={14} className="text-textDim mx-auto" />
      : <span className="text-text text-xs font-rajdhani">{val}</span>

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-orbitron text-xl text-cyan tracking-[0.2em]">BVI</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-textMuted font-orbitron text-xs hover:text-cyan transition-colors">LOGIN</Link>
          <Link href="/signup" className="bg-cyan text-background font-orbitron text-xs px-4 py-2 hover:brightness-110 transition-all">GET STARTED</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-3xl md:text-4xl text-text mb-3">CHOOSE YOUR INTELLIGENCE TIER</h1>
          <p className="text-textMuted font-rajdhani text-lg">Scale from solo freelancer to full agency</p>
        </div>

        {/* Founding Member Section */}
        <div className="mb-16">
          <div className="border border-yellow/30 bg-yellow/5 p-4 mb-8 flex items-center gap-3">
            <Zap size={18} className="text-yellow flex-shrink-0" />
            <div>
              <p className="font-orbitron text-xs text-yellow">FOUNDING MEMBER — LIFETIME ACCESS</p>
              <p className="text-textMuted text-xs font-rajdhani mt-0.5">Pay once, own BVI forever. Limited spots — gone when sold out.</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {CURRENCIES.map(c => (
                <div key={c.value} className="relative">
                  <button
                    onClick={() => { if (c.value === 'GBP') setCurrency(c.value) }}
                    className={`font-orbitron text-xs transition-colors ${c.value !== 'GBP' ? 'opacity-40 cursor-not-allowed' : currency === c.value ? 'text-yellow' : 'text-textMuted hover:text-text'}`}
                  >
                    {c.flag} {c.value}
                  </button>
                  {c.value !== 'GBP' && (
                    <span className="absolute -top-3 left-0 text-[8px] font-orbitron text-yellow/60 whitespace-nowrap">SOON</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['solo', 'studio', 'agency'] as Tier[]).map(t => (
              <FoundingCard key={t} tierId={t} currency={currency} onSelect={handleSelect} loading={loading} />
            ))}
          </div>
        </div>

        {/* Regular Subscription Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-orbitron text-lg text-text">REGULAR PLANS</h2>
            <div className="flex border border-border">
              <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 font-orbitron text-xs transition-all ${billingCycle === 'monthly' ? 'bg-cyan text-background' : 'text-textMuted hover:text-text'}`}>
                MONTHLY
              </button>
              <button onClick={() => setBillingCycle('annual')} className={`px-4 py-2 font-orbitron text-xs transition-all relative ${billingCycle === 'annual' ? 'bg-cyan text-background' : 'text-textMuted hover:text-text'}`}>
                ANNUAL
                <span className="absolute -top-2 -right-1 text-[9px] px-1 font-orbitron bg-cyan/20 text-cyan">SAVE 37%</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['free', 'solo', 'studio', 'agency'] as Tier[]).map(t => (
              <RegularCard key={t} tierId={t} billingCycle={billingCycle} currency={currency} onSelect={handleSelect} loading={loading} />
            ))}
          </div>
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
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-surface2/30 transition-colors">
                    <td className="py-3 pr-4 text-textMuted text-xs font-rajdhani">{row.label}</td>
                    <td className="py-3 px-2 text-center"><Cell val={row.free} /></td>
                    <td className="py-3 px-2 text-center"><Cell val={row.solo} /></td>
                    <td className="py-3 px-2 text-center"><Cell val={row.studio} /></td>
                    <td className="py-3 px-2 text-center"><Cell val={row.agency} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 border-t border-border pt-8 text-textMuted text-xs font-orbitron">
          <span>🔒 SECURED BY STRIPE</span>
          <span>🤖 POWERED BY CLAUDE AI</span>
          <span>🇬🇧 UK GDPR COMPLIANT</span>
          <span>🇬🇧 UK · 🇺🇸 US COMING SOON · 🇨🇦 CA COMING SOON</span>
        </div>
      </div>
    </div>
  )
}
