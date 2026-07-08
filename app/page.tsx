'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { LandingBackground } from '@/components/ui/landing-background'

// ─── Data ───────────────────────────────────────────────────────────────────

const AGENTS = [
  { id: 'FINN', role: 'AI Chief Financial Officer', desc: 'Categorises every transaction, builds P&L reports, and tracks cashflow automatically.', color: '#00c8ff', border: 'rgba(0,200,255,0.4)', bg: 'rgba(0,200,255,0.05)' },
  { id: 'SAGE', role: 'AI Tax Advisor', desc: 'Real-time tax estimates, VAT, deadline reminders, deduction guidance for UK/US/CA.', color: '#00ff88', border: 'rgba(0,255,136,0.4)', bg: 'rgba(0,255,136,0.05)' },
  { id: 'ARIA', role: 'AI Chief of Staff', desc: 'Morning intelligence briefs, business health scores, and strategic analysis daily.', color: '#a855f7', border: 'rgba(168,85,247,0.4)', bg: 'rgba(168,85,247,0.05)' },
  { id: 'MAX',  role: 'AI Growth Manager', desc: 'Revenue trends, client profitability scores, rate benchmarking, pipeline analysis.', color: '#ffb800', border: 'rgba(255,184,0,0.4)',  bg: 'rgba(255,184,0,0.05)' },
  { id: 'REX',  role: 'AI Operations Manager', desc: 'Generates proposals, contracts, and project briefs in under 30 seconds.', color: '#ff2d78', border: 'rgba(255,45,120,0.4)', bg: 'rgba(255,45,120,0.05)' },
]

const FEATURES = [
  { symbol: '▦', title: 'Automated Bookkeeping', desc: 'Upload your bank CSV — FINN categorises, flags, and analyses every transaction instantly.', color: '#00c8ff' },
  { symbol: '◎', title: 'Tax Intelligence', desc: 'Live tax estimates for UK, US, and Canada. Never miss a deadline or a deduction again.', color: '#00ff88' },
  { symbol: '◈', title: 'Business Health Score', desc: 'ARIA calculates a daily health score across revenue, margin, pipeline, and risk.', color: '#a855f7' },
  { symbol: '⟁', title: 'Revenue Analytics', desc: 'Month-over-month growth, client profitability rankings, and pricing recommendations.', color: '#ffb800' },
  { symbol: '⊡', title: 'Document Generator', desc: 'Professional proposals and contracts ready in seconds — built from your data.', color: '#ff2d78' },
  { symbol: '⬡', title: 'Daily Intelligence Brief', desc: 'Every morning: weather, market news, P&L snapshot, and strategic priorities.', color: '#00c8ff' },
]

const TICKER_ITEMS = [
  'FINN ONLINE', 'SAGE PROCESSING', 'ARIA ACTIVE', 'MAX SCANNING', 'REX READY',
  'AUTOMATED BOOKKEEPING', 'TAX INTELLIGENCE', 'REVENUE ANALYTICS', 'AGENCY READY', 'FREELANCER READY',
  'FINN ONLINE', 'SAGE PROCESSING', 'ARIA ACTIVE', 'MAX SCANNING', 'REX READY',
  'AUTOMATED BOOKKEEPING', 'TAX INTELLIGENCE', 'REVENUE ANALYTICS', 'AGENCY READY', 'FREELANCER READY',
]

const STEPS = [
  { num: '01', title: 'CONNECT YOUR FINANCES', desc: 'Upload a bank CSV or connect your account. FINN processes transactions in seconds.' },
  { num: '02', title: 'BRIEF YOUR AI TEAM', desc: 'Chat with any agent. Ask FINN about cash flow, SAGE about VAT, ARIA about strategy.' },
  { num: '03', title: 'RECEIVE INTELLIGENCE', desc: 'Get daily briefs, tax estimates, health scores, and automated reports — every morning.' },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false)
  useEffect(() => {
    const t = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 120) }, 4000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="relative inline-block">
      {text}
      {glitch && <span className="absolute inset-0 text-cyan/60 translate-x-[3px] -translate-y-[1px]">{text}</span>}
      {glitch && <span className="absolute inset-0 text-purple/40 -translate-x-[2px]">{text}</span>}
    </span>
  )
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const dur = 1400
    const frame = (now: number) => {
      const t = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setN(Math.round(ease * to))
      if (t < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [inView, to])
  return <span ref={ref}>{n}{suffix}</span>
}


// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const agentsRef = useRef(null)
  const featuresRef = useRef(null)
  const stepsRef = useRef(null)
  const statsRef = useRef(null)
  const agentsInView = useInView(agentsRef, { once: true, margin: '-80px' })
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' })
  const stepsInView = useInView(stepsRef, { once: true, margin: '-80px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#020408', color: 'rgba(200,230,255,0.9)' }}>
      <LandingBackground />

      {/* ── NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-cyan/15 px-6 py-0 flex items-center backdrop-blur-xl"
        style={{ background: 'rgba(2,4,8,0.92)', height: '56px' }}
      >
        {/* Animated bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg, transparent, #00c8ff, #7b2fff, transparent)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 mr-auto">
          <motion.div
            className="w-7 h-7 border border-cyan flex items-center justify-center"
            style={{ transform: 'rotate(45deg)', boxShadow: '0 0 8px rgba(0,200,255,0.3)', animation: 'logoPulse 3s ease-in-out infinite' }}
          >
            <div className="w-2.5 h-2.5 bg-cyan opacity-80" />
          </motion.div>
          <div>
            <div className="font-orbitron text-sm font-bold tracking-[3px]" style={{ color: '#00c8ff', textShadow: '0 0 10px #00c8ff' }}>
              <GlitchText text="BVI" />
            </div>
            <div className="font-mono-tech text-[7px] tracking-[2px]" style={{ color: 'rgba(100,140,170,0.5)' }}>BLACK VAULT INTELLIGENCE</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#agents" className="font-mono-tech text-[10px] tracking-[2px] transition-colors hover:text-cyan" style={{ color: 'rgba(150,190,220,0.5)' }}>AGENTS</Link>
          <Link href="#features" className="font-mono-tech text-[10px] tracking-[2px] transition-colors hover:text-cyan" style={{ color: 'rgba(150,190,220,0.5)' }}>FEATURES</Link>
          <Link href="/pricing" className="font-mono-tech text-[10px] tracking-[2px] transition-colors hover:text-cyan" style={{ color: 'rgba(150,190,220,0.5)' }}>PRICING</Link>
          <Link href="/login" className="font-mono-tech text-[10px] tracking-[2px] transition-colors hover:text-cyan" style={{ color: 'rgba(150,190,220,0.5)' }}>LOGIN</Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/signup" className="px-4 py-2 font-orbitron text-[10px] tracking-[2px] border border-cyan text-cyan hover:bg-cyan/10 transition-all"
              style={{ boxShadow: '0 0 12px rgba(0,200,255,0.2)' }}>
              GET STARTED →
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-24 pb-16 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,200,255,0.07) 0%, transparent 70%)' }}
        />

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 border px-3 py-1.5 mb-8 font-mono-tech text-[10px] tracking-[2px]"
          style={{ borderColor: 'rgba(0,200,255,0.3)', color: '#00c8ff', background: 'rgba(0,200,255,0.05)' }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-cyan"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          5 AGENTS ONLINE — FOUNDING MEMBER PRICING ACTIVE
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-orbitron font-black leading-none mb-6 mx-auto"
          style={{ fontSize: 'clamp(36px, 6vw, 80px)', maxWidth: '900px' }}
        >
          YOUR AI BACK OFFICE
          <br />
          <span className="relative inline-block" style={{ color: '#00c8ff', textShadow: '0 0 40px rgba(0,200,255,0.5)' }}>
            FOR AGENCIES & FREELANCERS
            <motion.span
              className="absolute left-0 bottom-0 h-[3px] bg-cyan"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.9, delay: 0.9 }}
              style={{ boxShadow: '0 0 10px #00c8ff' }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-rajdhani text-lg mb-10 mx-auto"
          style={{ color: 'rgba(150,190,220,0.7)', maxWidth: '600px', fontSize: '18px' }}
        >
          Five specialised AI agents handle your finances, tax, strategy, growth, and operations — built for agencies and freelancers who mean business.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/signup"
              className="inline-block px-10 py-3.5 font-orbitron text-sm tracking-[2px] border border-cyan text-background font-bold transition-all"
              style={{ background: '#00c8ff', boxShadow: '0 0 30px rgba(0,200,255,0.4), 0 0 60px rgba(0,200,255,0.15)' }}>
              START FREE →
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link href="/pricing"
              className="inline-block px-10 py-3.5 font-orbitron text-sm tracking-[2px] border transition-all hover:border-cyan/40"
              style={{ borderColor: 'rgba(0,200,255,0.2)', color: 'rgba(150,190,220,0.6)' }}>
              VIEW PRICING
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating data points */}
        {[
          { label: 'FINN', value: '+18.4%', color: '#00c8ff', x: '8%',  y: '25%', delay: 0.8 },
          { label: 'TAX DUE', value: '£1,240', color: '#ffb800', x: '88%', y: '20%', delay: 1.0 },
          { label: 'HEALTH', value: '8.1/10', color: '#a855f7', x: '5%',  y: '70%', delay: 1.2 },
          { label: 'RUNWAY', value: '4.2mo',  color: '#00ff88', x: '86%', y: '65%', delay: 1.4 },
        ].map((p) => (
          <motion.div
            key={p.label}
            className="absolute hidden lg:block font-mono-tech text-left"
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.5 }}
          >
            <motion.div
              className="border px-3 py-2"
              style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3 + Math.random(), repeat: Infinity }}
            >
              <div className="text-[8px] tracking-[2px] mb-1" style={{ color: `${p.color}80` }}>{p.label}</div>
              <div className="text-[14px] font-bold" style={{ color: p.color }}>{p.value}</div>
            </motion.div>
          </motion.div>
        ))}

        {/* Mini dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="relative mx-auto max-w-4xl border overflow-hidden"
          style={{ borderColor: 'rgba(0,200,255,0.2)', background: '#060f1a', boxShadow: '0 0 60px rgba(0,200,255,0.08), 0 40px 80px rgba(0,0,0,0.6)' }}
        >
          {/* Top accent */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #00c8ff, #7b2fff, transparent)' }} />

          {/* Preview topbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(0,200,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border border-cyan/50 flex items-center justify-center" style={{ transform: 'rotate(45deg)' }}>
                <div className="w-1.5 h-1.5 bg-cyan opacity-70" />
              </div>
              <span className="font-orbitron text-[10px] tracking-[3px] text-cyan/80">BVI</span>
              <span className="font-mono-tech text-[8px] px-2 py-0.5 border tracking-[2px]"
                style={{ borderColor: 'rgba(0,255,136,0.25)', color: 'rgba(0,255,136,0.6)' }}>5 AGENTS ACTIVE</span>
            </div>
            <div className="flex items-center gap-4">
              {['FINN ACTIVE', 'SAGE STANDBY', 'ARIA ACTIVE'].map((s, i) => (
                <div key={s} className="hidden sm:flex items-center gap-1.5 font-mono-tech text-[8px]" style={{ color: 'rgba(150,190,220,0.4)' }}>
                  <motion.span className="w-1 h-1 rounded-full" style={{ background: i === 1 ? '#ffb800' : '#00ff88' }}
                    animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Preview body */}
          <div className="grid grid-cols-4 gap-3 p-4">
            {[
              { label: 'MONTHLY REVENUE', val: '£4,820', col: '#00c8ff', pct: 74 },
              { label: 'TAX LIABILITY',   val: '£1,240', col: '#ffb800', pct: 42 },
              { label: 'NET PROFIT',      val: '£3,180', col: '#00ff88', pct: 66 },
              { label: 'CASH RUNWAY',     val: '4.2mo',  col: '#a855f7', pct: 85 },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                className="border p-3 relative overflow-hidden"
                style={{ borderColor: 'rgba(0,200,255,0.12)', background: '#081220' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
              >
                <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l" style={{ borderColor: m.col + '50' }} />
                <div className="font-mono-tech text-[7px] tracking-[2px] mb-1.5" style={{ color: 'rgba(100,140,170,0.4)' }}>{'// '}{m.label}</div>
                <div className="font-orbitron text-sm font-bold mb-1" style={{ color: m.col, textShadow: `0 0 10px ${m.col}60` }}>{m.val}</div>
                <div className="h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div className="h-full" style={{ background: m.col }}
                    initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 1.2, delay: 1.1 + i * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-0 border-t" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
            {AGENTS.map((a, i) => (
              <motion.div
                key={a.id}
                className="p-3 border-r last:border-r-0 text-center"
                style={{ borderColor: 'rgba(0,200,255,0.08)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 + i * 0.08 }}
              >
                <div className="w-8 h-8 mx-auto mb-1.5 border flex items-center justify-center font-orbitron text-[8px] font-bold"
                  style={{ borderColor: a.border, color: a.color, background: a.bg }}>
                  {a.id}
                </div>
                <div className="font-mono-tech text-[7px] tracking-wider" style={{ color: a.color }}>{a.id}</div>
                <div className="font-mono-tech text-[6px] mt-0.5" style={{ color: 'rgba(0,255,136,0.5)' }}>ONLINE</div>
              </motion.div>
            ))}
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(transparent, #020408)' }} />
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <div className="relative z-10 py-3 border-y overflow-hidden" style={{ borderColor: 'rgba(0,200,255,0.1)', background: 'rgba(0,200,255,0.03)' }}>
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="font-mono-tech text-[10px] tracking-[3px] flex items-center gap-3"
              style={{ color: i % 3 === 0 ? '#00c8ff' : i % 3 === 1 ? 'rgba(150,190,220,0.4)' : 'rgba(0,255,136,0.5)' }}>
              <span className="text-[6px]">◆</span>
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── AGENTS ── */}
      <section id="agents" ref={agentsRef} className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={agentsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="font-mono-tech text-[10px] tracking-[4px] mb-3" style={{ color: 'rgba(0,200,255,0.5)' }}>{'// YOUR AI TEAM'}</div>
          <h2 className="font-orbitron text-3xl font-black mb-3" style={{ color: 'rgba(200,230,255,0.95)' }}>FIVE AGENTS. ONE MISSION.</h2>
          <p className="font-rajdhani text-lg" style={{ color: 'rgba(150,190,220,0.55)' }}>Dedicated intelligence for every part of your agency or freelance business.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AGENTS.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 24 }}
              animate={agentsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: `0 0 40px ${a.color}20` }}
              className="border p-5 relative overflow-hidden cursor-default transition-all"
              style={{ borderColor: 'rgba(0,200,255,0.12)', background: '#060f1a' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${a.color}50, transparent)` }} />
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l" style={{ borderColor: a.color + '60' }} />

              {/* Avatar */}
              <motion.div
                className="w-12 h-12 border mb-4 flex items-center justify-center font-orbitron text-sm font-bold"
                style={{ borderColor: a.border, color: a.color, background: a.bg }}
                animate={{ boxShadow: [`0 0 0px ${a.color}`, `0 0 15px ${a.color}40`, `0 0 0px ${a.color}`] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              >
                {a.id}
              </motion.div>

              <div className="font-orbitron text-[13px] font-bold tracking-[2px] mb-0.5" style={{ color: a.color }}>{a.id}</div>
              <div className="font-rajdhani text-[11px] mb-3" style={{ color: 'rgba(150,190,220,0.5)' }}>{a.role}</div>
              <p className="font-rajdhani text-[12px] leading-relaxed" style={{ color: 'rgba(200,230,255,0.7)' }}>{a.desc}</p>

              <div className="mt-4 font-mono-tech text-[8px] flex items-center gap-2" style={{ color: 'rgba(0,255,136,0.6)' }}>
                <motion.span className="w-1.5 h-1.5 rounded-full bg-green" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
                ONLINE
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={stepsRef} className="relative z-10 py-20 border-t" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
        <div className="px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="font-mono-tech text-[10px] tracking-[4px] mb-3" style={{ color: 'rgba(0,200,255,0.5)' }}>{'// DEPLOYMENT SEQUENCE'}</div>
            <h2 className="font-orbitron text-3xl font-black" style={{ color: 'rgba(200,230,255,0.95)' }}>UP IN THREE STEPS</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative border p-6 overflow-hidden"
                style={{ borderColor: 'rgba(0,200,255,0.12)', background: '#060f1a' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.3), transparent)' }} />
                <div className="font-orbitron text-5xl font-black mb-4 leading-none" style={{ color: 'rgba(0,200,255,0.08)' }}>{s.num}</div>
                <div className="font-orbitron text-[12px] font-bold tracking-[2px] text-cyan mb-2">{s.title}</div>
                <p className="font-rajdhani text-sm leading-relaxed" style={{ color: 'rgba(150,190,220,0.6)' }}>{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 font-orbitron text-cyan/20 text-2xl">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featuresRef} className="relative z-10 py-20 border-t" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
        <div className="px-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="font-mono-tech text-[10px] tracking-[4px] mb-3" style={{ color: 'rgba(0,200,255,0.5)' }}>{'// CAPABILITIES'}</div>
            <h2 className="font-orbitron text-3xl font-black mb-3" style={{ color: 'rgba(200,230,255,0.95)' }}>EVERYTHING YOU NEED</h2>
            <p className="font-rajdhani text-lg" style={{ color: 'rgba(150,190,220,0.55)' }}>The complete back-office stack for agencies and freelancers ready to scale.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3, borderColor: `${f.color}40` }}
                className="border p-5 relative overflow-hidden cursor-default transition-all group"
                style={{ borderColor: 'rgba(0,200,255,0.1)', background: '#060f1a' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px transition-all" style={{ background: `linear-gradient(90deg, transparent, ${f.color}30, transparent)` }} />

                <div className="w-10 h-10 border flex items-center justify-center mb-4 font-mono-tech text-xl transition-colors"
                  style={{ borderColor: `${f.color}30`, color: f.color, background: `${f.color}08` }}>
                  {f.symbol}
                </div>
                <div className="font-orbitron text-[12px] font-bold tracking-[1px] mb-2 transition-colors group-hover:text-cyan"
                  style={{ color: 'rgba(200,230,255,0.9)' }}>
                  {f.title}
                </div>
                <p className="font-rajdhani text-sm leading-relaxed" style={{ color: 'rgba(150,190,220,0.55)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="relative z-10 py-20 border-t" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
        <div className="px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-10"
          >
            <h2 className="font-orbitron text-2xl font-black" style={{ color: 'rgba(200,230,255,0.9)' }}>BUILT FOR AGENCIES & FREELANCERS WHO MEAN BUSINESS</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { to: 5,  suffix: '',   label: 'AI Agents deployed',      color: '#00c8ff' },
              { to: 3,  suffix: '',   label: 'Tax jurisdictions (UK/US/CA)', color: '#00ff88' },
              { to: 30, suffix: 's',  label: 'Seconds to generate a contract', color: '#a855f7' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                whileHover={{ borderColor: `${s.color}40`, boxShadow: `0 0 30px ${s.color}15` }}
                className="border p-8 text-center relative overflow-hidden transition-all"
                style={{ borderColor: 'rgba(0,200,255,0.12)', background: '#060f1a' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)` }} />
                <div className="font-orbitron text-5xl font-black mb-2" style={{ color: s.color, textShadow: `0 0 20px ${s.color}60` }}>
                  <CountUp to={s.to} suffix={s.suffix} />
                </div>
                <div className="font-rajdhani text-sm" style={{ color: 'rgba(150,190,220,0.5)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 border-t overflow-hidden" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
        {/* Pulsing radial glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,200,255,0.08) 0%, transparent 70%)' }}
        />
        <div className="relative px-6 text-center max-w-3xl mx-auto">
          <div className="font-mono-tech text-[10px] tracking-[4px] mb-4" style={{ color: 'rgba(0,200,255,0.5)' }}>{'// INITIATE DEPLOYMENT'}</div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-orbitron font-black mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'rgba(200,230,255,0.95)' }}
          >
            READY TO DEPLOY YOUR AI TEAM?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-rajdhani text-lg mb-10"
            style={{ color: 'rgba(150,190,220,0.55)' }}
          >
            Start free. Upgrade when you need more. No card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link href="/signup"
              className="inline-block px-12 py-4 font-orbitron text-sm tracking-[2px] font-bold text-background border border-cyan"
              style={{ background: '#00c8ff', boxShadow: '0 0 40px rgba(0,200,255,0.5), 0 0 80px rgba(0,200,255,0.2)' }}>
              START FREE — NO CARD REQUIRED →
            </Link>
          </motion.div>

          <div className="flex items-center justify-center gap-8 mt-10">
            {['FREE TO START', 'CANCEL ANYTIME', 'UK · US · CA TAX'].map((t) => (
              <div key={t} className="flex items-center gap-2 font-mono-tech text-[9px] tracking-[2px]" style={{ color: 'rgba(100,140,170,0.5)' }}>
                <span className="text-green text-[8px]">✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t px-6 py-8" style={{ borderColor: 'rgba(0,200,255,0.08)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-orbitron text-[11px] tracking-[3px]" style={{ color: 'rgba(100,140,170,0.4)' }}>BVI — BLACK VAULT INTELLIGENCE</span>
          <div className="flex flex-wrap gap-6 justify-center">
            {[['Pricing', '/pricing'], ['Login', '/login'], ['Sign Up', '/signup'], ['Terms', '/terms'], ['Privacy', '/privacy'], ['Cookies', '/cookies']].map(([label, href]) => (
              <Link key={label} href={href} className="font-mono-tech text-[10px] tracking-[2px] transition-colors hover:text-cyan"
                style={{ color: 'rgba(100,140,170,0.4)' }}>{label.toUpperCase()}</Link>
            ))}
          </div>
          <span className="font-mono-tech text-[9px]" style={{ color: 'rgba(100,140,170,0.3)' }}>© {new Date().getFullYear()} BLACK VAULT INTELLIGENCE LTD · 🇬🇧 UK</span>
        </div>
      </footer>
    </div>
  )
}
