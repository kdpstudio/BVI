import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for freelancers and agencies. Start free, upgrade when you\'re ready. UK launch — US & Canada coming soon.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
