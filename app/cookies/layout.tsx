import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Black Vault Intelligence Cookie Policy. PECR compliant. We use only essential and functional cookies.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
