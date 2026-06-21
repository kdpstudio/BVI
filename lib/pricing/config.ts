import { Currency } from '@/types'

export const PRICING = {
  solo: {
    founding: { monthly: 49, annual: 399, lifetime: 499, spots: 50 },
    regular:  { monthly: 79, annual: 599, lifetime: 799 }
  },
  studio: {
    founding: { monthly: 99, annual: 799, lifetime: 999, spots: 25 },
    regular:  { monthly: 149, annual: 1199, lifetime: 1499 }
  },
  agency: {
    founding: { monthly: 199, annual: 1599, lifetime: 1999, spots: 10 },
    regular:  { monthly: 249, annual: 1999, lifetime: 2499 }
  }
}

export const CURRENCY_MULTIPLIERS: Record<Currency, number> = { GBP: 1, USD: 1.27, CAD: 1.72 }
export const CURRENCY_SYMBOLS: Record<Currency, string> = { GBP: '£', USD: '$', CAD: 'CA$' }

export function getPrice(tier: 'solo' | 'studio' | 'agency', cycle: 'monthly' | 'annual' | 'lifetime', isFounding: boolean): number {
  const t = PRICING[tier]
  return isFounding ? t.founding[cycle] : t.regular[cycle]
}

export function convertPrice(gbpAmount: number, currency: Currency): number {
  return Math.round(gbpAmount * CURRENCY_MULTIPLIERS[currency])
}
