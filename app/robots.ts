import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/login', '/signup', '/terms', '/privacy', '/cookies'],
        disallow: ['/dashboard', '/finance', '/tax', '/growth', '/documents', '/agents', '/settings', '/api/'],
      },
    ],
    sitemap: 'https://www.blackvaultintelligence.com/sitemap.xml',
  }
}
