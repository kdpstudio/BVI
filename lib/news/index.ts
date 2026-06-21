import { NewsItem, Country } from '@/types'

export async function fetchNews(country: Country): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY
  if (!apiKey) return getMockNews(country)

  const queries: Record<Country, string> = {
    UK: 'q=HMRC OR freelancer OR small+business&language=en&sortBy=publishedAt',
    US: 'q=IRS OR freelancer OR small+business&language=en&sortBy=publishedAt',
    CA: 'q=CRA OR freelancer OR small+business+Canada&language=en&sortBy=publishedAt',
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?${queries[country]}&pageSize=3&apiKey=${apiKey}`,
      { next: { revalidate: 7200 } }
    )
    if (!res.ok) return getMockNews(country)
    const data = await res.json()
    return (data.articles || []).slice(0, 3).map((a: Record<string, unknown>) => ({
      title: a.title as string,
      description: (a.description as string) || '',
      url: a.url as string,
      source: (a.source as { name?: string })?.name || 'News',
      publishedAt: a.publishedAt as string,
    }))
  } catch {
    return getMockNews(country)
  }
}

function getMockNews(country: Country): NewsItem[] {
  const news: Record<Country, NewsItem[]> = {
    UK: [
      { title: 'HMRC updates self-assessment guidance for freelancers', description: 'New guidance issued for the 2025/26 tax year.', url: '#', source: 'GOV.UK', publishedAt: new Date().toISOString() },
      { title: 'Freelancer rates rise 8% year-on-year across creative sectors', description: 'New data shows strong demand for independent workers.', url: '#', source: 'FT', publishedAt: new Date().toISOString() },
      { title: 'AI tools reduce admin time for SMEs by average 6hrs/week', description: 'Survey of 2,000 UK small businesses reveals productivity gains.', url: '#', source: 'Tech', publishedAt: new Date().toISOString() },
    ],
    US: [
      { title: 'IRS announces updated quarterly payment thresholds for 2026', description: 'Self-employed workers should review new guidance.', url: '#', source: 'IRS.gov', publishedAt: new Date().toISOString() },
      { title: 'Freelance economy grows to 45% of US workforce', description: 'New report shows continued growth in independent work.', url: '#', source: 'Forbes', publishedAt: new Date().toISOString() },
      { title: 'AI-powered bookkeeping saves freelancers 4hrs per week', description: 'Survey reveals time savings from automation tools.', url: '#', source: 'Inc.', publishedAt: new Date().toISOString() },
    ],
    CA: [
      { title: 'CRA updates guidance on self-employed deductions for 2026', description: 'New rules for home office and vehicle expenses.', url: '#', source: 'CRA', publishedAt: new Date().toISOString() },
      { title: 'Canadian freelancers see 12% income growth in 2025', description: 'Strong demand across tech and creative sectors.', url: '#', source: 'Globe', publishedAt: new Date().toISOString() },
      { title: 'GST/HST remittance deadlines: what freelancers need to know', description: 'Key dates for 2026 filing season.', url: '#', source: 'CPA CA', publishedAt: new Date().toISOString() },
    ],
  }
  return news[country] || news.UK
}
