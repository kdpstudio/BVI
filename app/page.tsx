'use client'

import Link from 'next/link'
import { CheckCircle, Zap, Shield, TrendingUp, FileText, Brain } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

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

const STATS = [
  { stat: '5', label: 'AI Agents', suffix: '' },
  { stat: '3', label: 'Countries', suffix: '' },
  { stat: '30', label: 'Seconds to generate docs', suffix: 's' },
]

const colorMap: Record<string, string> = {
  cyan: 'text-cyan border-cyan/30 bg-cyan/5 hover:border-cyan/60 hover:shadow-[0_0_20px_rgba(0,200,255,0.15)]',
  green: 'text-green border-green/30 bg-green/5 hover:border-green/60 hover:shadow-[0_0_20px_rgba(0,255,128,0.15)]',
  purple: 'text-purple border-purple/30 bg-purple/5 hover:border-purple/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  yellow: 'text-yellow border-yellow/30 bg-yellow/5 hover:border-yellow/60 hover:shadow-[0_0_20px_rgba(255,200,0,0.15)]',
  orange: 'text-orange-400 border-orange-400/30 bg-orange-400/5 hover:border-orange-400/60 hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]',
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 150)
    }, 4000)
    return () => clearInterval(interval)
  }, [])
  return (
    <span className={`relative inline-block transition-all duration-75 ${glitch ? 'translate-x-[2px] opacity-80' : ''}`}>
      {text}
      {glitch && <span className="absolute inset-0 text-cyan/50 translate-x-[3px]">{text}</span>}
    </span>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage() {
  const agentsRef = useRef(null)
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const agentsInView = useInView(agentsRef, { once: true, margin: '-100px' })
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })

  return (
    <div className="min-h-screen bg-background text-text overflow-x-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur"
      >
        <span className="font-orbitron text-cyan text-lg tracking-widest">
          <GlitchText text="BVI" />
        </span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-textMuted font-rajdhani text-sm hover:text-text transition-colors">Pricing</Link>
          <Link href="/login" className="text-textMuted font-rajdhani text-sm hover:text-text transition-colors">Login</Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/signup" className="px-4 py-2 bg-cyan text-background font-orbitron text-xs hover:brightness-110 transition-all">
              GET STARTED
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 px-6 py-28 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border border-cyan/30 text-cyan text-xs font-orbitron px-3 py-1.5 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          FOUNDING MEMBER PRICING — LIMITED TIME
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-orbitron text-4xl sm:text-6xl text-text mb-6 leading-tight"
        >
          YOUR AI BACK OFFICE<br />
          <span className="text-cyan relative">
            FOR FREELANCERS
            <motion.span
              className="absolute bottom-0 left-0 h-[2px] bg-cyan"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-rajdhani text-textMuted text-lg mb-10 max-w-2xl mx-auto"
        >
          Five specialised AI agents handle your finances, tax, strategy, growth, and operations — so you can focus on the work you love.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/signup" className="inline-block px-8 py-3 bg-cyan text-background font-orbitron text-sm hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,200,255,0.3)]">
              START FREE →
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/pricing" className="inline-block px-8 py-3 border border-border text-textMuted font-orbitron text-sm hover:border-cyan/40 hover:text-text transition-colors">
              VIEW PRICING
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan/40"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </section>

      {/* Agents */}
      <motion.section
        ref={agentsRef}
        initial="hidden"
        animate={agentsInView ? 'visible' : 'hidden'}
        variants={stagger}
        className="relative z-10 px-6 py-16 max-w-6xl mx-auto"
      >
        <motion.h2 variants={fadeUp} className="font-orbitron text-2xl text-center text-text mb-3">MEET YOUR AI TEAM</motion.h2>
        <motion.p variants={fadeUp} className="font-rajdhani text-textMuted text-center mb-10">Five agents, one mission: grow your freelance business.</motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AGENTS.map((a, i) => (
            <motion.div
              key={a.id}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`border p-5 cursor-default transition-all duration-300 ${colorMap[a.color]}`}
            >
              <motion.div
                className="w-8 h-8 rounded-full mb-3 flex items-center justify-center text-xs font-orbitron border"
                style={{ borderColor: 'currentColor', backgroundColor: 'currentColor' }}
                animate={{ boxShadow: ['0 0 0px currentColor', '0 0 10px currentColor', '0 0 0px currentColor'] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <span className="text-background">{a.name[0]}</span>
              </motion.div>
              <p className="font-orbitron text-sm mb-0.5">{a.name}</p>
              <p className="font-rajdhani text-xs opacity-70 mb-3">{a.role}</p>
              <p className="font-rajdhani text-text text-xs leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        ref={featuresRef}
        initial="hidden"
        animate={featuresInView ? 'visible' : 'hidden'}
        variants={stagger}
        className="relative z-10 px-6 py-16 border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} className="font-orbitron text-2xl text-center text-text mb-3">EVERYTHING YOU NEED</motion.h2>
          <motion.p variants={fadeUp} className="font-rajdhani text-textMuted text-center mb-10">The complete back-office stack for modern freelancers.</motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ scale: 1.02, borderColor: 'rgba(0,200,255,0.4)' }}
                className="bg-surface border border-border p-6 transition-colors group cursor-default"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 flex items-center justify-center mb-3 border border-cyan/20 bg-cyan/5"
                >
                  <f.icon size={18} className="text-cyan" />
                </motion.div>
                <p className="font-orbitron text-sm text-text mb-2 group-hover:text-cyan transition-colors">{f.title}</p>
                <p className="font-rajdhani text-textMuted text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? 'visible' : 'hidden'}
        variants={stagger}
        className="relative z-10 px-6 py-16 border-t border-border"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="font-orbitron text-xl text-text mb-10">BUILT FOR FREELANCERS WHO MEAN BUSINESS</motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STATS.map((s) => (
              <motion.div
                key={s.stat}
                variants={fadeUp}
                whileHover={{ borderColor: 'rgba(0,200,255,0.4)', boxShadow: '0 0 20px rgba(0,200,255,0.1)' }}
                className="border border-border p-6 transition-all"
              >
                <p className="font-orbitron text-4xl text-cyan mb-2">
                  <CountUp target={parseInt(s.stat)} suffix={s.suffix} />
                </p>
                <p className="font-rajdhani text-textMuted text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 border-t border-border text-center overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,200,255,0.05) 0%, transparent 70%)' }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-orbitron text-3xl text-text mb-4"
        >
          READY TO DEPLOY YOUR AI TEAM?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-rajdhani text-textMuted mb-8"
        >
          Start free. Upgrade when ready. Cancel anytime.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/signup" className="inline-block px-10 py-4 bg-cyan text-background font-orbitron text-sm hover:brightness-110 transition-all shadow-[0_0_40px_rgba(0,200,255,0.4)]">
            START FREE — NO CARD REQUIRED →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-orbitron text-textMuted text-sm">BVI — BLACK VAULT INTELLIGENCE</span>
        <div className="flex gap-6">
          <Link href="/pricing" className="text-textMuted font-rajdhani text-xs hover:text-cyan transition-colors">Pricing</Link>
          <Link href="/login" className="text-textMuted font-rajdhani text-xs hover:text-cyan transition-colors">Login</Link>
          <Link href="/signup" className="text-textMuted font-rajdhani text-xs hover:text-cyan transition-colors">Sign Up</Link>
        </div>
        <span className="font-rajdhani text-textMuted text-xs">© {new Date().getFullYear()} BVI. All rights reserved.</span>
      </footer>
    </div>
  )
}
