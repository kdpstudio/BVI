import { PricingTier, Tier, Agent } from '@/types'

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'FREE',
    monthlyGBP: 0,
    annualGBP: 0,
    lifetimeGBP: 0,
    transactions: 50,
    users: 1,
    agents: ['FINN'],
    features: [
      'FINN AI CFO (basic)',
      '50 transactions/month',
      'Basic P&L report',
      'CSV upload',
      'Single user',
    ],
  },
  {
    id: 'solo',
    name: 'SOLO',
    monthlyGBP: 79,
    annualGBP: 599,
    lifetimeGBP: 799,
    foundingMonthlyGBP: 49,
    foundingAnnualGBP: 399,
    foundingLifetimeGBP: 799,
    foundingSpots: 50,
    transactions: 500,
    users: 1,
    agents: ['FINN', 'SAGE', 'REX'],
    features: [
      'FINN + SAGE + REX agents',
      '500 transactions/month',
      'Full P&L & tax estimates',
      'Document generator',
      'Single user',
      'CSV upload & manual entry',
    ],
  },
  {
    id: 'studio',
    name: 'STUDIO',
    monthlyGBP: 149,
    annualGBP: 1199,
    lifetimeGBP: 1499,
    foundingMonthlyGBP: 99,
    foundingAnnualGBP: 799,
    foundingLifetimeGBP: 1499,
    foundingSpots: 25,
    transactions: 2000,
    users: 5,
    agents: ['FINN', 'SAGE', 'ARIA', 'MAX', 'REX'],
    features: [
      'All 5 AI agents',
      '2,000 transactions/month',
      'Full agent chat',
      'Business health scoring',
      'Growth analysis',
      'Up to 5 users',
      'Priority support',
    ],
  },
  {
    id: 'agency',
    name: 'AGENCY',
    monthlyGBP: 249,
    annualGBP: 1999,
    lifetimeGBP: 2499,
    foundingMonthlyGBP: 199,
    foundingAnnualGBP: 1599,
    foundingLifetimeGBP: 2999,
    foundingSpots: 10,
    transactions: 5000,
    users: 15,
    agents: ['FINN', 'SAGE', 'ARIA', 'MAX', 'REX'],
    features: [
      'All 5 AI agents',
      '5,000 transactions/month',
      'Full agent chat',
      'Business health scoring',
      'Growth analysis',
      'Up to 15 users',
      'Priority support',
      'Custom integrations (coming soon)',
    ],
  },
]

export function getTierById(id: Tier): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id)
}

export function canAgentAccess(tier: Tier, agent: Agent): boolean {
  const tierData = getTierById(tier)
  return tierData ? tierData.agents.includes(agent) : false
}
