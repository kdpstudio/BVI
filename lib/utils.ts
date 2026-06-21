import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Currency } from '@/types'
import { CURRENCY_SYMBOLS } from './currency'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency = 'GBP'): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  return `${symbol}${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    UK: '🇬🇧',
    US: '🇺🇸',
    CA: '🇨🇦',
  }
  return flags[country] || '🌍'
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const then = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
