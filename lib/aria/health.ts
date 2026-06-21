export interface HealthScoreData {
  score: number
  breakdown: { label: string; score: number; maxScore: number }[]
}

interface HealthInput {
  income: number
  prevIncome: number
  margin: number
  cashRunwayMonths: number
  txCount: number
  prevTxCount: number
  taxCompliant: boolean
}

export function calculateHealthScore(data: HealthInput): HealthScoreData {
  const breakdown = [
    {
      label: 'Revenue Growth',
      score: data.prevIncome > 0 && data.income > data.prevIncome ? 2 : data.income === data.prevIncome ? 1 : 0,
      maxScore: 2,
    },
    {
      label: 'Profit Margin',
      score: data.margin >= 50 ? 2 : data.margin >= 30 ? 1 : 0,
      maxScore: 2,
    },
    {
      label: 'Cash Runway',
      score: data.cashRunwayMonths >= 6 ? 2 : data.cashRunwayMonths >= 3 ? 1 : 0,
      maxScore: 2,
    },
    {
      label: 'Transaction Volume',
      score: data.txCount > data.prevTxCount ? 2 : data.txCount === data.prevTxCount ? 1 : 0,
      maxScore: 2,
    },
    {
      label: 'Tax Compliance',
      score: data.taxCompliant ? 2 : 1,
      maxScore: 2,
    },
  ]

  const total = breakdown.reduce((s, b) => s + b.score, 0)
  return { score: total, breakdown }
}
