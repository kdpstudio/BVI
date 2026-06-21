import Link from 'next/link'
import { CheckCircle, Zap, Shield, TrendingUp, FileText, Brain } from 'lucide-react'

const AGENTS = [
  { id: 'FINN', name: 'FINN', role: 'Finance Manager', desc: 'Categorises transactions, builds P&L reports, and tracks cashflow automatically.', color: 'cyan' },
  { id: 'SAGE', name: 'SAGE', role: 'Tax Advisor', desc: 'Real-time tax estimates, deadline reminders, and deduction guidance for UK/US/CA.', color: 'green' },
  { id: 'ARIA', name: 'ARIA', role: 'Chief of Staff', desc: 'Morning briefs, business health scores, and strategic intelligence every day.', color: 'purple' },
  { id: 'MAX', name: 'MAX', role: 'Growth Manager', desc: 'Revenue trend analysis, rate benchmarking, and client profitability reports.', color: 'yellow' },
  { id: 'REX', name: 'REX', role: 'Operations Manager', desc: 'Generates proposals, contracts, and project briefs in seconds.', color: 'orange' },
]

const FEATURES = [
  { icon: Brain, title: 'Five AI Agents', desc: 'Dedicated AI for finance, tax, strategy, growth, and operations.' },
  { icon: TrendingUp, title: 'Revenue Intelligence', desc: 'P&L charts, MoM growth tracking, and revenue forecasting.' },
  { icon: Shield, title: 'Tax Compliance', desc: 'UK, US, and Canadian tax calculations with key deadline alerts.' },
  { icon: FileText, title: 'Document Generator', desc: 'Professional proposals, contracts, and briefs — ready in 30 seconds.' },
  { icon: Zap, title: 'CSV Import', desc: 'Upload bank exports and FINN auto-categorises every transaction.' },
  { icon: CheckCircle, title: 'Daily Brief', desc: 'ARIA delivers a personalised business briefing every morning.' },
]

const colorMap: Record<string, string> = {
  cyan: 'text-cyan border-cyan/30 bg-cyan/5',
  green: 'text-green border-green/30 bg-green/5',
  purple: 'text-purple border-purple/30 bg-purple/5',
  yellow: 'text-yellow border-yellow/30 bg-yellow/5',
  orange: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur z-10">
        <span className="font-orbitron text-cyan text-lg tracking-widest">BVI</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-textMuted font-rajdhani text-sm hover:text-text transition-colors">Pricing</Link>
          <Link href="/login" className="text-textMuted font-rajdhani text-sm hover:text-text transition-colors">Login</Link>
          <Link href="/signup" className="px-4 py-2 bg-cyan text-background font-orbitron text-xs hover:brightness-110 transition-all">
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 border border-cyan/30 text-cyan text-xs font-orbitron px-3 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          FOUNDING MEMBER PRICING — LIMITED TIME
        </div>
        <h1 className="font-orbitron text-4xl sm:text-5xl text-text mb-6 leading-tight">
          YOUR AI BACK OFFICE<br />
          <span className="text-cyan">FOR FREELANCERS</span>
        </h1>
        <p className="font-rajdhani text-textMuted text-lg mb-10 max-w-2xl mx-auto">
          Five specialised AI agents handle your finances, tax, strategy, growth, and operations — so you can focus on the work you love.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-3 bg-cyan text-background font-orbitron text-sm hover:brightness-110 transition-all">
            START FREE →
          </Link>
          <Link href="/pricing" className="px-8 py-3 border border-border text-textMuted font-orbitron text-sm hover:border-cyan/40 hover:text-text transition-colors">
            VIEW PRICING
          </Link>
        </div>
      </section>

      {/* Agents */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="font-orbitron text-2xl text-center text-text mb-3">MEET YOUR AI TEAM</h2>
        <p className="font-rajdhani text-textMuted text-center mb-10">Five agents, one mission: grow your freelance business.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AGENTS.map(a => (
            <div key={a.id} className={`border p-5 ${colorMap[a.color]}`}>
              <p className="font-orbitron text-sm mb-0.5">{a.name}</p>
              <p className="font-rajdhani text-xs opacity-70 mb-3">{a.role}</p>
              <p className="font-rajdhani text-text text-xs leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-orbitron text-2xl text-center text-text mb-3">EVERYTHING YOU NEED</h2>
          <p className="font-rajdhani text-textMuted text-center mb-10">The complete back-office stack for modern freelancers.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-surface border border-border p-6 hover:border-cyan/20 transition-colors">
                <f.icon size={20} className="text-cyan mb-3" />
                <p className="font-orbitron text-sm text-text mb-2">{f.title}</p>
                <p className="font-rajdhani text-textMuted text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-orbitron text-xl text-text mb-10">BUILT FOR FREELANCERS WHO MEAN BUSINESS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: '5 AI Agents', desc: 'Dedicated to your business' },
              { stat: 'UK/US/CA', desc: 'Tax support for 3 countries' },
              { stat: '< 30s', desc: 'To generate any document' },
            ].map(s => (
              <div key={s.stat} className="border border-border p-6">
                <p className="font-orbitron text-2xl text-cyan mb-2">{s.stat}</p>
                <p className="font-rajdhani text-textMuted text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-border text-center">
        <h2 className="font-orbitron text-3xl text-text mb-4">READY TO DEPLOY YOUR AI TEAM?</h2>
        <p className="font-rajdhani text-textMuted mb-8">Start free. Upgrade when ready. Cancel anytime.</p>
        <Link href="/signup" className="inline-block px-10 py-4 bg-cyan text-background font-orbitron text-sm hover:brightness-110 transition-all">
          START FREE — NO CARD REQUIRED →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-orbitron text-textMuted text-sm">BVI — BLACK VAULT INTELLIGENCE</span>
        <div className="flex gap-6">
          <Link href="/pricing" className="text-textMuted font-rajdhani text-xs hover:text-text transition-colors">Pricing</Link>
          <Link href="/login" className="text-textMuted font-rajdhani text-xs hover:text-text transition-colors">Login</Link>
          <Link href="/signup" className="text-textMuted font-rajdhani text-xs hover:text-text transition-colors">Sign Up</Link>
        </div>
        <span className="font-rajdhani text-textMuted text-xs">© {new Date().getFullYear()} BVI. All rights reserved.</span>
      </footer>
    </div>
  )
}
