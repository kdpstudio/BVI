import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Black Vault Intelligence Terms of Service. Governing law: England and Wales.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
