import Link from 'next/link'

export const metadata = { title: 'Terms of Service — BVI' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-orbitron text-xl text-cyan tracking-[0.2em]">BVI</Link>
        <Link href="/login" className="text-textMuted font-orbitron text-xs hover:text-cyan transition-colors">LOGIN</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="font-mono-tech text-[10px] text-cyan tracking-[3px] mb-2">{'// LEGAL'}</p>
          <h1 className="font-orbitron text-3xl text-text mb-2">TERMS OF SERVICE</h1>
          <p className="text-textMuted font-rajdhani text-sm">Last updated: July 2026 · Governing law: England and Wales</p>
        </div>

        <div className="flex flex-col gap-8 font-rajdhani text-textMuted leading-relaxed">

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">1. WHO WE ARE</h2>
            <p>Black Vault Intelligence Ltd (&quot;BVI&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a company registered in England and Wales. We operate the BVI platform at blackvaultintelligence.com, an AI-powered back-office tool for freelancers and agencies.</p>
            <p className="mt-2">By creating an account or using our services, you agree to these Terms. If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">2. IMPORTANT DISCLAIMER — NOT FINANCIAL ADVICE</h2>
            <div className="border border-yellow/30 bg-yellow/5 p-4">
              <p className="text-yellow font-semibold mb-2">⚠ Please read this carefully.</p>
              <p>BVI provides AI-generated information and tools for educational and organisational purposes only. Nothing on this platform constitutes:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
                <li>Regulated financial advice under the Financial Services and Markets Act 2000 (FSMA)</li>
                <li>Regulated tax advice under HMRC guidelines</li>
                <li>Legal advice of any kind</li>
                <li>Investment advice or recommendations</li>
              </ul>
              <p className="mt-2">Always consult a qualified accountant, tax adviser, or financial adviser before making financial or tax decisions. BVI accepts no liability for decisions made based on AI-generated outputs.</p>
            </div>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">3. YOUR ACCOUNT</h2>
            <p>You must be at least 18 years old and a UK resident to use BVI. You are responsible for maintaining the security of your account credentials. You must not share your account with others unless on a multi-user plan.</p>
            <p className="mt-2">We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or misuse the platform.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">4. SUBSCRIPTIONS AND PAYMENTS</h2>
            <p>BVI offers free and paid subscription tiers. Paid plans are billed as follows:</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li><strong className="text-text">Monthly plans</strong> — billed every 30 days, cancel anytime</li>
              <li><strong className="text-text">Annual plans</strong> — billed once per year, non-refundable after 14 days</li>
              <li><strong className="text-text">Lifetime plans</strong> — one-time payment, permanent access for the lifetime of the BVI platform</li>
            </ul>
            <p className="mt-2">All prices are in GBP and inclusive of applicable VAT where required. Payments are processed securely by Stripe. We do not store your card details.</p>
            <p className="mt-2"><strong className="text-text">Refunds:</strong> You have a 14-day cooling-off period from the date of purchase under the Consumer Contracts Regulations 2013. After 14 days, payments are non-refundable except at our discretion.</p>
            <p className="mt-2"><strong className="text-text">Auto-renewal:</strong> Subscriptions renew automatically. You will receive an email reminder 7 days before renewal. Cancel anytime in Settings → Billing.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">5. FOUNDING MEMBER LIFETIME DEALS</h2>
            <p>Founding member lifetime access grants permanent access to BVI at your purchased tier for the operational lifetime of the BVI platform. &quot;Lifetime&quot; refers to the lifetime of the platform, not the user.</p>
            <p className="mt-2">In the unlikely event BVI ceases operations, we will provide at least 90 days notice to lifetime members. Founding member spots are limited and non-transferable.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">6. ACCEPTABLE USE</h2>
            <p>You must not use BVI to:</p>
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-1">
              <li>Upload fraudulent, illegal, or misleading financial data</li>
              <li>Attempt to reverse-engineer, scrape, or copy the platform</li>
              <li>Use the AI agents for any unlawful purpose</li>
              <li>Resell or white-label BVI without written permission</li>
              <li>Interfere with platform security or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">7. YOUR DATA</h2>
            <p>You retain ownership of all financial data you upload to BVI. We process your data to provide the service. See our <Link href="/privacy" className="text-cyan hover:underline">Privacy Policy</Link> for full details on how we handle your data.</p>
            <p className="mt-2">You may request deletion of your data at any time via Settings → Security → Delete Account or by emailing us.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">8. AI-GENERATED CONTENT</h2>
            <p>BVI uses Claude AI (Anthropic) to power its agents. AI outputs may occasionally be inaccurate, incomplete, or outdated. You are responsible for verifying all AI-generated information before acting on it.</p>
            <p className="mt-2">We do not guarantee the accuracy of any tax estimates, financial projections, or business advice generated by our AI agents.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">9. LIMITATION OF LIABILITY</h2>
            <p>To the maximum extent permitted by law, BVI&apos;s total liability to you for any claim arising from use of the platform is limited to the amount you paid us in the 12 months preceding the claim.</p>
            <p className="mt-2">We are not liable for any indirect, consequential, or financial losses arising from reliance on AI-generated outputs, data loss, or service interruption.</p>
            <p className="mt-2">Nothing in these Terms limits our liability for death, personal injury caused by negligence, or fraud.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">10. CHANGES TO THESE TERMS</h2>
            <p>We may update these Terms from time to time. We will notify you by email at least 30 days before material changes take effect. Continued use of BVI after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">11. GOVERNING LAW</h2>
            <p>These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
            <p className="mt-2">If you are a consumer in the UK, you also have rights under UK consumer protection law that these Terms cannot override.</p>
          </section>

          <section>
            <h2 className="font-orbitron text-sm text-cyan mb-3 tracking-widest">12. CONTACT</h2>
            <p>For any questions about these Terms, contact us at: <span className="text-cyan">legal@blackvaultintgelligence.com</span></p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex gap-6 text-xs font-orbitron text-textMuted">
          <Link href="/privacy" className="hover:text-cyan transition-colors">PRIVACY POLICY</Link>
          <Link href="/cookies" className="hover:text-cyan transition-colors">COOKIE POLICY</Link>
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
        </div>
      </div>
    </div>
  )
}
