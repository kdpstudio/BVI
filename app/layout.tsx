import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Share_Tech_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { CookieBanner } from '@/components/ui/cookie-banner'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono-tech',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Black Vault Intelligence — AI Back Office for Freelancers',
    template: '%s | Black Vault Intelligence',
  },
  description: 'AI-powered back office for freelancers and agencies. Automated bookkeeping, tax intelligence, proposals, and growth analysis — all in one vault.',
  metadataBase: new URL('https://www.blackvaultintelligence.com'),
  openGraph: {
    type: 'website',
    siteName: 'Black Vault Intelligence',
    title: 'Black Vault Intelligence — AI Back Office for Freelancers',
    description: 'AI-powered back office for freelancers and agencies. Automated bookkeeping, tax intelligence, proposals, and growth analysis.',
    url: 'https://www.blackvaultintelligence.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Black Vault Intelligence — AI Back Office for Freelancers',
    description: 'AI-powered back office for freelancers and agencies. Automated bookkeeping, tax intelligence, proposals, and growth analysis.',
  },
  keywords: ['freelancer bookkeeping', 'AI accountant', 'tax estimates UK', 'freelance back office', 'AI CFO', 'self-employed tax', 'invoice management'],
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} font-rajdhani`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          {children}
          <CookieBanner />
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: '#060d14',
                border: '1px solid #0d2137',
                color: '#e2e8f0',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
