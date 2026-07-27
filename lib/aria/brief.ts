import Anthropic from '@anthropic-ai/sdk'
import { WeatherData, NewsItem } from '@/types'
import { getAgent } from '@/lib/agents/config'
import { BRIEF_MODEL } from '@/lib/agents/models'

const anthropic = new Anthropic()

interface BriefContext {
  businessName: string
  weather: WeatherData | null
  news: NewsItem[]
  income: number
  expenses: number
  healthScore: number
}

export async function generateAriaBrief(ctx: BriefContext): Promise<string> {
  const aria = getAgent('ARIA')!
  const weatherStr = ctx.weather ? `Weather in ${ctx.weather.city}: ${ctx.weather.temp}°C, ${ctx.weather.description}.` : ''
  const newsStr = ctx.news.slice(0, 2).map(n => n.title).join(' | ')
  const financialStr = `Income this month: £${ctx.income.toFixed(0)}, Expenses: £${ctx.expenses.toFixed(0)}, Net: £${(ctx.income - ctx.expenses).toFixed(0)}. Health score: ${ctx.healthScore}/10.`

  try {
    const response = await anthropic.messages.create({
      model: BRIEF_MODEL,
      max_tokens: 200,
      system: aria.systemPrompt,
      messages: [{
        role: 'user',
        content: `Generate a concise 3-sentence morning brief for ${ctx.businessName}. ${weatherStr} News context: ${newsStr}. Financial context: ${financialStr}. Be specific and direct. No filler.`
      }]
    })
    return response.content[0].type === 'text' ? response.content[0].text : getDefaultBrief(ctx.businessName)
  } catch {
    return getDefaultBrief(ctx.businessName)
  }
}

function getDefaultBrief(businessName: string): string {
  return `Good morning, ${businessName}. Your business metrics are being tracked and your agents are standing by. Review your finances in the Finance section and consult SAGE for any tax queries.`
}
