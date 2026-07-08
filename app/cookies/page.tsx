import Link from 'next/link'

export const metadata = { title: 'Cookie Policy — BVI' }

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-orbitron text-xl text-cyan tracking-[0.2em]">BVI</Link>
        <Link href="/login" className="text-textMuted font-orbitron text-xs hover:text-cyan transition-colors">LOGIN</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="font-mono-tech text-[10px] text-cyan tracking-[3px] mb-2">{'// LEGAL'}</p>
          <h1 className="font-orbitron text-3xl text-text mb-2">COOKIE POLICY</h1>
          <p className="text-textMuted font-rajdhani text-sm">Last updated: July 2026 · Compliant with UK PECR</p>
        </div>

        <div className="flex flex-col gap-8 font-rajdhani text-textMuted leading-relaxed">

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">1. WHAT ARE COOKIES</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us keep you logged in, remember your preferences, and understand how the platform is used.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">2. COOKIES WE USE</h2>
            <div className="flex flex-col gap-4">
              <div className="border border-green/30 bg-green/5 p-4">
                <p className="text-green font-orbitron text-xs mb-2">ESSENTIAL COOKIES — Always active, no consent required</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-orbitron text-xs text-textMuted">NAME</th>
                      <th className="text-left py-2 font-orbitron text-xs text-textMuted">PURPOSE</th>
                      <th className="text-left py-2 font-orbitron text-xs text-textMuted">DURATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['sb-auth-token', 'Keeps you logged in (Supabase session)', '1 week'],
                      ['sb-refresh-token', 'Refreshes your login session', '1 month'],
                      ['__Host-next-auth', 'Next.js security token', 'Session'],
                    ].map(([name, purpose, duration]) => (
                      <tr key={name} className="border-b border-border/30">
                        <td className="py-2 font-mono-tech text-xs text-cyan">{name}</td>
                        <td className="py-2 text-xs">{purpose}</td>
                        <td className="py-2 text-xs">{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-cyan/30 bg-cyan/5 p-4">
                <p className="text-cyan font-orbitron text-xs mb-2">FUNCTIONAL COOKIES — Require consent</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-orbitron text-xs text-textMuted">NAME</th>
                      <th className="text-left py-2 font-orbitron text-xs text-textMuted">PURPOSE</th>
                      <th className="text-left py-2 font-orbitron text-xs text-textMuted">DURATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['bvi-currency', 'Remembers your selected currency', '1 year'],
                      ['bvi-theme', 'Remembers your display preferences', '1 year'],
                      ['bvi-cookie-consent', 'Records your cookie consent choice', '1 year'],
                    ].map(([name, purpose, duration]) => (
                      <tr key={name} className="border-b border-border/30">
                        <td className="py-2 font-mono-tech text-xs text-cyan">{name}</td>
                        <td className="py-2 text-xs">{purpose}</td>
                        <td className="py-2 text-xs">{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">3. WE DO NOT USE</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Advertising or tracking cookies</li>
              <li>Third-party analytics (e.g. Google Analytics)</li>
              <li>Social media tracking pixels</li>
              <li>Cross-site tracking of any kind</li>
            </ul>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">4. HOW TO CONTROL COOKIES</h2>
            <p>You can withdraw your consent for functional cookies at any time via the cookie banner (click "Cookie Settings" in the footer). Essential cookies cannot be disabled as the platform will not function without them.</p>
            <p className="mt-2">You can also control cookies through your browser settings. Note that disabling all cookies will prevent you from logging in to BVI.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">5. LEGAL BASIS</h2>
            <p>We use essential cookies under our legitimate interest in providing a functional service. Functional cookies are used only with your explicit consent, as required by the UK Privacy and Electronic Communications Regulations (PECR).</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">6. CONTACT</h2>
            <p>Questions about cookies: <span className="text-cyan">privacy@blackvaultintgelligence.com</span></p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex gap-6 text-xs font-orbitron text-textMuted">
          <Link href="/terms" className="hover:text-cyan transition-colors">TERMS OF SERVICE</Link>
          <Link href="/privacy" className="hover:text-cyan transition-colors">PRIVACY POLICY</Link>
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
        </div>
      </div>
    </div>
  )
}
