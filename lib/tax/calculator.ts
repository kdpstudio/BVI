export interface TaxResult {
  country: string
  income: number
  incomeTax: number
  nationalInsurance?: number
  selfEmploymentTax?: number
  effectiveRate: number
  breakdown: { label: string; amount: number }[]
  nextDeadline: string
  quarterlyDates?: string[]
}

export function calculateUKTax(annualIncome: number): TaxResult {
  const personalAllowance = 12570
  const basicRateLimit = 50270
  const higherRateLimit = 125140

  let incomeTax = 0
  if (annualIncome > personalAllowance) {
    const basicTaxable = Math.min(annualIncome, basicRateLimit) - personalAllowance
    incomeTax += basicTaxable * 0.20
  }
  if (annualIncome > basicRateLimit) {
    const higherTaxable = Math.min(annualIncome, higherRateLimit) - basicRateLimit
    incomeTax += higherTaxable * 0.40
  }
  if (annualIncome > higherRateLimit) {
    incomeTax += (annualIncome - higherRateLimit) * 0.45
  }

  let niClass4 = 0
  if (annualIncome > 12570) {
    niClass4 += (Math.min(annualIncome, 50270) - 12570) * 0.09
    if (annualIncome > 50270) niClass4 += (annualIncome - 50270) * 0.02
  }
  const niClass2 = annualIncome > 12570 ? 3.45 * 52 : 0

  const total = incomeTax + niClass4 + niClass2
  return {
    country: 'UK',
    income: annualIncome,
    incomeTax,
    nationalInsurance: niClass4 + niClass2,
    effectiveRate: annualIncome > 0 ? (total / annualIncome) * 100 : 0,
    breakdown: [
      { label: 'Income Tax', amount: incomeTax },
      { label: 'NI Class 4', amount: niClass4 },
      { label: 'NI Class 2', amount: niClass2 },
    ],
    nextDeadline: '31 Jan 2027 — Self Assessment filing',
    quarterlyDates: ['31 Jan 2026 — Payment on account', '31 Jul 2026 — Payment on account'],
  }
}

export function calculateUSTax(annualIncome: number): TaxResult {
  const netSE = annualIncome * 0.9235
  const seTax = netSE * 0.153
  const seDeduction = seTax / 2
  const taxableIncome = annualIncome - seDeduction

  let incomeTax = 0
  const brackets: [number, number][] = [[11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35]]
  let prev = 0
  for (const [limit, rate] of brackets) {
    if (taxableIncome > prev) {
      incomeTax += (Math.min(taxableIncome, limit) - prev) * rate
      prev = limit
    }
  }
  if (taxableIncome > 609350) incomeTax += (taxableIncome - 609350) * 0.37

  const total = incomeTax + seTax
  return {
    country: 'US',
    income: annualIncome,
    incomeTax,
    selfEmploymentTax: seTax,
    effectiveRate: annualIncome > 0 ? (total / annualIncome) * 100 : 0,
    breakdown: [
      { label: 'Federal Income Tax', amount: incomeTax },
      { label: 'Self-Employment Tax (15.3%)', amount: seTax },
    ],
    nextDeadline: 'Apr 15, 2026 — Federal tax return',
    quarterlyDates: ['Apr 15', 'Jun 16', 'Sep 15', 'Jan 15 2027'],
  }
}

export function calculateCATax(annualIncome: number): TaxResult {
  let incomeTax = 0
  const brackets: [number, number][] = [[57375, 0.15], [114750, 0.205], [158519, 0.26], [220000, 0.29]]
  let prev = 0
  for (const [limit, rate] of brackets) {
    if (annualIncome > prev) {
      incomeTax += (Math.min(annualIncome, limit) - prev) * rate
      prev = limit
    }
  }
  if (annualIncome > 220000) incomeTax += (annualIncome - 220000) * 0.33

  const cppBase = Math.max(0, Math.min(annualIncome, 68500) - 3500)
  const cpp = cppBase * 0.114

  const total = incomeTax + cpp
  return {
    country: 'CA',
    income: annualIncome,
    incomeTax,
    nationalInsurance: cpp,
    effectiveRate: annualIncome > 0 ? (total / annualIncome) * 100 : 0,
    breakdown: [
      { label: 'Federal Income Tax', amount: incomeTax },
      { label: 'CPP Contributions', amount: cpp },
    ],
    nextDeadline: 'Apr 30, 2026 — CRA filing deadline',
  }
}
