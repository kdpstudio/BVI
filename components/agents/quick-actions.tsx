import { Agent } from '@/types'

const QUICK_ACTIONS: Record<Agent, { label: string; message: string }[]> = {
  FINN: [
    { label: 'Generate P&L', message: 'Generate a P&L report for this month with all categories broken down.' },
    { label: 'Review Transactions', message: 'Review my recent transactions and flag anything unusual or worth noting.' },
    { label: 'Cash Flow Summary', message: 'Give me a cash flow summary and tell me what my runway looks like.' },
  ],
  SAGE: [
    { label: 'Tax Estimate', message: 'Estimate my tax liability for this tax year based on my income so far.' },
    { label: 'Upcoming Deadlines', message: 'What are my upcoming tax deadlines and payment dates?' },
    { label: 'Find Deductions', message: 'Based on my transactions, what deductions am I potentially missing?' },
  ],
  ARIA: [
    { label: 'Business Health Check', message: 'Give me a full business health check and score out of 10.' },
    { label: 'Weekly Brief', message: 'Give me a strategic briefing on the state of my business this week.' },
    { label: 'Risk Assessment', message: 'What are the biggest risks to my business right now and how should I address them?' },
  ],
  MAX: [
    { label: 'Revenue Analysis', message: 'Analyse my revenue trends and tell me what\'s driving growth or decline.' },
    { label: 'Rate Recommendations', message: 'Based on my revenue data, should I raise my rates? By how much?' },
    { label: 'Growth Report', message: 'Give me a growth report with specific recommendations for next month.' },
  ],
  REX: [
    { label: 'Draft Proposal', message: 'Help me draft a professional project proposal. Ask me for the details you need.' },
    { label: 'Contract Template', message: 'Generate a freelance service agreement template for my business type.' },
    { label: 'Compliance Check', message: 'What compliance items do I need to be aware of for my country and business type?' },
  ],
}

export function QuickActions({ agent, onSelect }: { agent: Agent; onSelect: (msg: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {QUICK_ACTIONS[agent].map(({ label, message }) => (
        <button
          key={label}
          onClick={() => onSelect(message)}
          className="text-left px-3 py-2 border border-border text-textMuted text-xs font-rajdhani hover:border-cyan/40 hover:text-text transition-all"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
