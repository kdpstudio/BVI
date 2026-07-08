import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — BVI' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-orbitron text-xl text-cyan tracking-[0.2em]">BVI</Link>
        <Link href="/login" className="text-textMuted font-orbitron text-xs hover:text-cyan transition-colors">LOGIN</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="font-mono-tech text-[10px] text-cyan tracking-[3px] mb-2">{'// LEGAL'}</p>
          <h1 className="font-orbitron text-3xl text-text mb-2">PRIVACY POLICY</h1>
          <p className="text-textMuted font-rajdhani text-sm">Last updated: July 2026 · Compliant with UK GDPR and Data Protection Act 2018</p>
        </div>

        <div className="flex flex-col gap-8 font-rajdhani text-textMuted leading-relaxed">

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">1. WHO WE ARE</h2>
            <p>Black Vault Intelligence Ltd ("BVI") is the data controller for personal data collected through this platform. We are registered with the Information Commissioner's Office (ICO) in the UK.</p>
            <p className="mt-2">Contact: <span className="text-cyan">privacy@blackvaultintgelligence.com</span></p>
            <p className="mt-2">BVI currently operates in the United Kingdom only. US and Canadian services are coming soon.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">2. WHAT DATA WE COLLECT</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-text font-semibold mb-1">Account Data</p>
                <p>Full name, email address, password (hashed), country, city, business name, business type, subscription tier.</p>
              </div>
              <div>
                <p className="text-text font-semibold mb-1">Financial Data</p>
                <p>Transaction records you upload or enter manually — amounts, dates, descriptions, categories. This data is used solely to power your AI agents.</p>
              </div>
              <div>
                <p className="text-text font-semibold mb-1">AI Chat Data</p>
                <p>Messages you send to our AI agents (FINN, SAGE, ARIA, MAX, REX) and the responses generated. Stored to maintain conversation history.</p>
              </div>
              <div>
                <p className="text-text font-semibold mb-1">Payment Data</p>
                <p>Subscription status, billing cycle, Stripe customer ID. We do not store card numbers — all payment data is held by Stripe.</p>
              </div>
              <div>
                <p className="text-text font-semibold mb-1">Technical Data</p>
                <p>IP address, browser type, device information, pages visited, session data. Used for security and platform improvement.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">3. WHY WE PROCESS YOUR DATA</h2>
            <table className="w-full text-sm border border-border">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left p-3 font-orbitron text-xs text-cyan">PURPOSE</th>
                  <th className="text-left p-3 font-orbitron text-xs text-cyan">LEGAL BASIS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Providing the BVI platform and AI agents', 'Contract performance'],
                  ['Processing payments and managing subscriptions', 'Contract performance'],
                  ['Sending account and service emails', 'Contract performance'],
                  ['Improving our AI models and platform', 'Legitimate interests'],
                  ['Security monitoring and fraud prevention', 'Legitimate interests'],
                  ['Legal compliance and record keeping', 'Legal obligation'],
                  ['Marketing emails (with your consent)', 'Consent'],
                ].map(([purpose, basis], i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="p-3">{purpose}</td>
                    <td className="p-3 text-cyan font-semibold">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">4. WHO WE SHARE YOUR DATA WITH</h2>
            <p className="mb-3">We do not sell your data. We share it only with the following sub-processors to operate the platform:</p>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Supabase', role: 'Database and authentication', location: 'EU/US', link: 'supabase.com/privacy' },
                { name: 'Anthropic', role: 'AI agent processing (Claude)', location: 'US', link: 'anthropic.com/privacy' },
                { name: 'Stripe', role: 'Payment processing', location: 'US/EU', link: 'stripe.com/privacy' },
                { name: 'Vercel', role: 'Platform hosting', location: 'US/EU', link: 'vercel.com/legal/privacy-policy' },
              ].map(s => (
                <div key={s.name} className="border border-border p-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-text font-semibold">{s.name}</p>
                    <p className="text-xs">{s.role} · {s.location}</p>
                  </div>
                  <span className="text-cyan text-xs">{s.link}</span>
                </div>
              ))}
            </div>
            <p className="mt-3">Data transfers outside the UK are protected by Standard Contractual Clauses (SCCs) or equivalent safeguards.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">5. HOW LONG WE KEEP YOUR DATA</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Account data — for the duration of your account plus 2 years</li>
              <li>Financial transaction data — 7 years (UK tax record requirements)</li>
              <li>AI chat history — 12 months rolling</li>
              <li>Payment records — 7 years (legal obligation)</li>
              <li>Technical logs — 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">6. YOUR RIGHTS UNDER UK GDPR</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Right of Access', 'Request a copy of all data we hold about you'],
                ['Right to Rectification', 'Correct inaccurate personal data'],
                ['Right to Erasure', 'Delete your account and personal data'],
                ['Right to Restriction', 'Limit how we process your data'],
                ['Right to Portability', 'Receive your data in a machine-readable format'],
                ['Right to Object', 'Object to processing based on legitimate interests'],
                ['Right to Withdraw Consent', 'Withdraw marketing consent at any time'],
                ['Right to Complain', 'Lodge a complaint with the ICO at ico.org.uk'],
              ].map(([right, desc]) => (
                <div key={right} className="border border-border p-3">
                  <p className="text-text font-semibold text-sm mb-1">{right}</p>
                  <p className="text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-3">To exercise any right, email <span className="text-cyan">privacy@blackvaultintgelligence.com</span>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">7. COOKIES</h2>
            <p>We use essential cookies to keep you logged in and functional cookies to remember your preferences. See our <Link href="/cookies" className="text-cyan hover:underline">Cookie Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">8. SECURITY</h2>
            <p>We protect your data using encryption in transit (TLS) and at rest, access controls, and regular security monitoring. Financial data is stored in isolated, access-controlled databases.</p>
            <p className="mt-2">In the event of a data breach that affects your rights, we will notify you and the ICO within 72 hours as required by UK GDPR.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">9. CHANGES TO THIS POLICY</h2>
            <p>We may update this Privacy Policy. We will notify you by email of any material changes at least 30 days before they take effect.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">10. CONTACT & COMPLAINTS</h2>
            <p>Data Controller: Black Vault Intelligence Ltd</p>
            <p className="mt-1">Email: <span className="text-cyan">privacy@blackvaultintgelligence.com</span></p>
            <p className="mt-2">If you are unhappy with how we handle your data, you have the right to complain to the ICO: <span className="text-cyan">ico.org.uk/make-a-complaint</span></p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex gap-6 text-xs font-orbitron text-textMuted">
          <Link href="/terms" className="hover:text-cyan transition-colors">TERMS OF SERVICE</Link>
          <Link href="/cookies" className="hover:text-cyan transition-colors">COOKIE POLICY</Link>
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
        </div>
      </div>
    </div>
  )
}
