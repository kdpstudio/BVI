import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Black Vault Intelligence Privacy Policy. UK GDPR and Data Protection Act 2018 compliant.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
