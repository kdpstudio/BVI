import { Currency } from '@/types'

export const CURRENCY_MULTIPLIERS: Record<Currency, number> = {
  GBP: 1,
  USD: 1.27,
  CAD: 1.72,
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  CAD: 'CA$',
}

export function convertFromGBP(amountGBP: number, toCurrency: Currency): number {
  return amountGBP * CURRENCY_MULTIPLIERS[toCurrency]
}

export function convertToGBP(amount: number, fromCurrency: Currency): number {
  return amount / CURRENCY_MULTIPLIERS[fromCurrency]
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency]
}
