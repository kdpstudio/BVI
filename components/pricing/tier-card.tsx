'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CyberButton } from '@/components/ui/cyber-button'
import { Currency, Tier } from '@/types'
import { convertPrice, CURRENCY_SYMBOLS } from '@/lib/pricing/config'
import { PRICING_TIERS } from '@/lib/pricing'

type BillingCycle = 'monthly' | 'annual' | 'lifetime'

interface TierCardProps {
  tierId: Tier
  billingCycle: BillingCycle
  currency: Currency
  isFounding: boolean
  onSelect: (tier: Tier) => void
  loading?: boolean
  highlighted?: boolean
}

export function TierCard({ tierId, billingCycle, currency, isFounding, onSelect, loading, highlighted }: TierCardProps) {
  const tier = PRICING_TIERS.find(t => t.id === tierId)
  if (!tier) return null

  const symbol = CURRENCY_SYMBOLS[currency]

  const getDisplayPrice = () => {
    if (tierId === 'free') return { price: '0', period: 'forever', regular: undefined }

    const gbpKey = billingCycle === 'monthly' ? 'monthlyGBP' : billingCycle === 'annual' ? 'annualGBP' : 'lifetimeGBP'
    const foundingKey = billingCycle === 'monthly' ? 'foundingMonthlyGBP' : billingCycle === 'annual' ? 'foundingAnnualGBP' : 'foundingLifetimeGBP'

    const regularGBP = tier[gbpKey as keyof typeof tier] as number
    const foundingGBP = isFounding && tier[foundingKey as keyof typeof tier] ? tier[foundingKey as keyof typeof tier] as number : regularGBP
    const displayGBP = isFounding ? foundingGBP : regularGBP
    const displayPrice = convertPrice(displayGBP, currency)
    const regularPrice = convertPrice(regularGBP, currency)

    const period = billingCycle === 'monthly' ? '/mo' : billingCycle === 'annual' ? '/yr' : ' once'
    return { price: displayPrice.toString(), period, regular: isFounding && foundingGBP !== regularGBP ? regularPrice.toString() : undefined }
  }

  const { price, period, regular } = getDisplayPrice()

  const accentColor = tierId === 'free' ? 'border-border' : tierId === 'solo' ? 'border-cyan/40' : tierId === 'studio' ? 'border-purple/40' : 'border-yellow/40'
  const glowColor = tierId === 'solo' ? 'shadow-[0_0_20px_rgba(0,200,255,0.1)]' : tierId === 'studio' ? 'shadow-[0_0_20px_rgba(123,47,255,0.1)]' : tierId === 'agency' ? 'shadow-[0_0_20px_rgba(255,204,0,0.1)]' : ''
  const textColor = tierId === 'solo' ? 'text-cyan' : tierId === 'studio' ? 'text-purple' : tierId === 'agency' ? 'text-yellow' : 'text-textMuted'
  const btnVariant = tierId === 'studio' ? 'purple' : 'cyan'

  return (
    <div className={cn(
      'bg-surface border p-6 flex flex-col relative transition-all duration-200 hover:scale-[1.01]',
      accentColor, glowColor,
      highlighted && 'ring-1 ring-cyan'
    )}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan text-background font-orbitron text-xs px-3 py-0.5 whitespace-nowrap">
          MOST POPULAR
        </div>
      )}
      {isFounding && tier.foundingSpots && tierId !== 'free' && (
        <div className={cn('text-xs font-orbitron mb-3 px-2 py-0.5 border inline-block w-fit', textColor, accentColor)}>
          FOUNDING · {tier.foundingSpots} SPOTS
        </div>
      )}

      <div className={cn('font-orbitron text-xl mb-1', textColor)}>{tier.name}</div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-orbitron text-3xl text-text">{symbol}{price}</span>
        <span className="text-textMuted text-sm font-rajdhani">{period}</span>
      </div>

      {regular && (
        <p className="text-textMuted text-xs font-rajdhani line-through mb-1">
          Regular: {symbol}{regular}{period}
        </p>
      )}

      <p className="text-textMuted text-xs font-rajdhani mb-4">
        {tier.transactions.toLocaleString()} transactions/mo · {tier.users === 1 ? '1 user' : `Up to ${tier.users} users`}
      </p>

      <ul className="flex flex-col gap-2 mb-6 flex-1">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2">
            <Check size={12} className={cn('mt-0.5 flex-shrink-0', textColor)} />
            <span className="text-textMuted text-xs font-rajdhani">{f}</span>
          </li>
        ))}
      </ul>

      <CyberButton
        variant={tierId === 'free' ? 'ghost' : btnVariant}
        fullWidth
        onClick={() => onSelect(tierId)}
        disabled={loading}
      >
        {tierId === 'free' ? 'START FREE' : `ACTIVATE ${tier.name}`}
      </CyberButton>
    </div>
  )
}
