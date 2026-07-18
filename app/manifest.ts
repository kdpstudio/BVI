import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Black Vault Intelligence',
    short_name: 'BVI',
    description: 'AI-powered back office for freelancers and agencies',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#020408',
    theme_color: '#00c8ff',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
