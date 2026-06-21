import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic()

interface RawTransaction {
  date: string
  description: string
  amount: number
  currency?: string
}

interface CategorisedTransaction {
  category: string
  type: 'income' | 'expense'
  finn_note: string | null
  is_flagged: boolean
}

function ruleBasedCategorise(description: string, amount: number): CategorisedTransaction {
  const desc = description.toLowerCase()
  const isIncome = amount > 0

  if (isIncome) return { category: 'Revenue', type: 'income', finn_note: null, is_flagged: false }

  if (desc.includes('adobe') || desc.includes('slack') || desc.includes('notion') || desc.includes('google workspace') || desc.includes('subscription'))
    return { category: 'Software & Subscriptions', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('ads') || desc.includes('marketing') || desc.includes('facebook') || desc.includes('google ads'))
    return { category: 'Marketing & Ads', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('uber') || desc.includes('train') || desc.includes('travel') || desc.includes('flight'))
    return { category: 'Travel & Transport', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('amazon') || desc.includes('equipment') || desc.includes('hardware') || desc.includes('laptop'))
    return { category: 'Equipment & Hardware', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('restaurant') || desc.includes('coffee') || desc.includes('lunch') || desc.includes('meal'))
    return { category: 'Meals & Entertainment', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('accountant') || desc.includes('solicitor') || desc.includes('legal') || desc.includes('consultant'))
    return { category: 'Professional Services', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('electricity') || desc.includes('gas') || desc.includes('internet') || desc.includes('phone') || desc.includes('utility'))
    return { category: 'Utilities & Office', type: 'expense', finn_note: null, is_flagged: false }
  if (desc.includes('hmrc') || desc.includes('tax') || desc.includes('irs') || desc.includes('cra'))
    return { category: 'Tax & Accounting', type: 'expense', finn_note: null, is_flagged: false }

  return { category: 'Other', type: 'expense', finn_note: null, is_flagged: Math.abs(amount) > 2000 }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { transactions }: { transactions: RawTransaction[] } = await request.json()

    let categorised: CategorisedTransaction[]

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: `You are FINN, an AI CFO. Categorise transactions and return ONLY a JSON array with no other text. For each transaction provide: category (one of: Revenue, Software & Subscriptions, Marketing & Ads, Travel & Transport, Equipment & Hardware, Meals & Entertainment, Professional Services, Utilities & Office, Tax & Accounting, Salaries & Contractors, Other), type (income or expense), finn_note (brief observation if notable, else null), is_flagged (true if unusual amount or suspicious description).`,
        messages: [{
          role: 'user',
          content: `Categorise these transactions:\n${JSON.stringify(transactions, null, 2)}\n\nReturn ONLY a JSON array matching the input order.`
        }]
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      categorised = jsonMatch ? JSON.parse(jsonMatch[0]) : transactions.map(t => ruleBasedCategorise(t.description, t.amount))
    } catch {
      categorised = transactions.map(t => ruleBasedCategorise(t.description, t.amount))
    }

    return NextResponse.json({ categorised })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to categorise' }, { status: 500 })
  }
}
