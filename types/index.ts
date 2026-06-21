export type Country = 'UK' | 'US' | 'CA'
export type Currency = 'GBP' | 'USD' | 'CAD'
export type Tier = 'free' | 'solo' | 'studio' | 'agency'
export type BillingCycle = 'monthly' | 'annual' | 'lifetime'
export type Agent = 'FINN' | 'SAGE' | 'ARIA' | 'MAX' | 'REX'
export type TransactionType = 'income' | 'expense'
export type ReportType = 'pl' | 'tax' | 'health' | 'growth'
export type MessageRole = 'user' | 'assistant'

export interface User {
  id: string
  email: string
  full_name: string
  country: Country
  currency: Currency
  city: string
  business_name: string
  business_type: string
  tier: Tier
  billing_cycle: BillingCycle
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  date: string
  description: string
  amount: number
  currency: string
  amount_gbp: number
  category: string
  type: TransactionType
  is_flagged: boolean
  finn_note?: string
  created_at: string
}

export interface AgentLog {
  id: string
  user_id: string
  agent: Agent
  action: string
  result: string
  created_at: string
}

export interface AgentChat {
  id: string
  user_id: string
  agent: Agent
  role: MessageRole
  content: string
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  type: ReportType
  period: string
  data: Record<string, unknown>
  created_at: string
}

export interface DailyBrief {
  id: string
  user_id: string
  date: string
  weather: WeatherData
  news: NewsItem[]
  aria_brief: string
  health_score: number
  created_at: string
}

export interface WeatherData {
  city: string
  temp: number
  feels_like: number
  description: string
  icon: string
  humidity: number
}

export interface NewsItem {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
}

export interface AgentConfig {
  id: Agent
  name: string
  emoji: string
  role: string
  description: string
  color: 'cyan' | 'purple'
  systemPrompt: string
}

export interface PricingTier {
  id: Tier
  name: string
  monthlyGBP: number
  annualGBP: number
  lifetimeGBP: number
  foundingMonthlyGBP?: number
  foundingAnnualGBP?: number
  foundingLifetimeGBP?: number
  foundingSpots?: number
  transactions: number
  users: number
  agents: Agent[]
  features: string[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
