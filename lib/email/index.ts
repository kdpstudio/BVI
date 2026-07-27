import { Resend } from 'resend'

const FROM = 'BVI <hello@blackvaultintelligence.com>'

// Constructed lazily: `new Resend()` throws when RESEND_API_KEY is unset, and
// at module scope that crashes `next build` during page-data collection —
// even though no email is actually sent at build time.
let client: Resend | null = null
function resendClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export async function sendRecurringInvoiceEmail(to: string, data: {
  clientName: string
  fromName: string
  invoiceHtml: string
  invoiceNo: string
}) {
  return resendClient().emails.send({
    from: FROM,
    to,
    subject: `Invoice ${data.invoiceNo} from ${data.fromName || 'your provider'}`,
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f6f8;padding:24px;">
        <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;">
          ${data.invoiceHtml}
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">Sent automatically by Black Vault Intelligence on behalf of ${data.fromName || 'your provider'}.</p>
      </div>
    `,
  })
}

export async function sendWeeklyReport(to: string, data: {
  name: string
  income: number
  expenses: number
  net: number
  currency: string
}) {
  const fmt = (n: number) => `${data.currency === 'GBP' ? '£' : data.currency === 'USD' ? '$' : 'CA$'}${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  return resendClient().emails.send({
    from: FROM,
    to,
    subject: `BVI Weekly Report — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
    html: `
      <div style="font-family:monospace;background:#060d14;color:#e2e8f0;padding:32px;max-width:560px;margin:0 auto;border:1px solid #0d2137;">
        <div style="color:#00c8ff;font-size:10px;letter-spacing:4px;margin-bottom:16px;">// BLACK VAULT INTELLIGENCE</div>
        <h1 style="font-size:20px;margin:0 0 8px;">WEEKLY REPORT</h1>
        <p style="color:#64748b;font-size:13px;margin:0 0 24px;">Hi ${data.name}, here's your financial summary.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr style="border-bottom:1px solid #0d2137;">
            <td style="padding:12px 0;color:#64748b;font-size:12px;">INCOME</td>
            <td style="padding:12px 0;text-align:right;color:#00ff88;font-size:14px;">${fmt(data.income)}</td>
          </tr>
          <tr style="border-bottom:1px solid #0d2137;">
            <td style="padding:12px 0;color:#64748b;font-size:12px;">EXPENSES</td>
            <td style="padding:12px 0;text-align:right;color:#ff2d78;font-size:14px;">${fmt(data.expenses)}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#64748b;font-size:12px;">NET PROFIT</td>
            <td style="padding:12px 0;text-align:right;color:#00c8ff;font-size:14px;font-weight:bold;">${fmt(data.net)}</td>
          </tr>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#00c8ff;color:#060d14;padding:10px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;">VIEW FULL DASHBOARD →</a>
        <p style="color:#1e3a5f;font-size:10px;margin-top:24px;">Black Vault Intelligence Ltd · <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#1e3a5f;">Manage notifications</a></p>
      </div>
    `,
  })
}

export async function sendTaxReminder(to: string, data: {
  name: string
  deadline: string
  description: string
  daysLeft: number
}) {
  return resendClient().emails.send({
    from: FROM,
    to,
    subject: `⚠️ Tax Deadline in ${data.daysLeft} days — ${data.deadline}`,
    html: `
      <div style="font-family:monospace;background:#060d14;color:#e2e8f0;padding:32px;max-width:560px;margin:0 auto;border:1px solid #0d2137;">
        <div style="color:#00c8ff;font-size:10px;letter-spacing:4px;margin-bottom:16px;">// BLACK VAULT INTELLIGENCE · SAGE TAX ADVISOR</div>
        <h1 style="font-size:20px;margin:0 0 8px;color:#ffb800;">TAX DEADLINE ALERT</h1>
        <p style="color:#64748b;font-size:13px;margin:0 0 24px;">Hi ${data.name}, SAGE has flagged an upcoming deadline.</p>
        <div style="border:1px solid #ffb800;padding:16px;margin-bottom:24px;">
          <div style="color:#ffb800;font-size:10px;letter-spacing:2px;margin-bottom:8px;">// DEADLINE</div>
          <div style="font-size:18px;margin-bottom:4px;">${data.deadline}</div>
          <div style="color:#64748b;font-size:13px;">${data.description}</div>
          <div style="color:#ffb800;font-size:12px;margin-top:8px;">${data.daysLeft} days remaining</div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/tax" style="display:inline-block;background:#ffb800;color:#060d14;padding:10px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;">OPEN TAX DASHBOARD →</a>
        <p style="color:#1e3a5f;font-size:10px;margin-top:24px;">This is an automated reminder from SAGE. Not regulated financial advice. · <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#1e3a5f;">Manage notifications</a></p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  return resendClient().emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Black Vault Intelligence',
    html: `
      <div style="font-family:monospace;background:#060d14;color:#e2e8f0;padding:32px;max-width:560px;margin:0 auto;border:1px solid #0d2137;">
        <div style="color:#00c8ff;font-size:10px;letter-spacing:4px;margin-bottom:16px;">// BLACK VAULT INTELLIGENCE</div>
        <h1 style="font-size:20px;margin:0 0 8px;">VAULT ACCESS GRANTED</h1>
        <p style="color:#64748b;font-size:13px;margin:0 0 24px;">Welcome, ${name}. Your AI back office is ready.</p>
        <div style="border-left:2px solid #00c8ff;padding-left:16px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:13px;">💰 <strong>FINN</strong> — Your AI CFO. Upload your bank CSV to get started.</p>
          <p style="margin:0 0 8px;font-size:13px;">🧾 <strong>SAGE</strong> — Your AI Tax Advisor. Get real-time tax estimates.</p>
          <p style="margin:0 0 8px;font-size:13px;">💼 <strong>ARIA</strong> — Your AI CEO. Morning briefs and strategic insights.</p>
          <p style="margin:0 0 8px;font-size:13px;">📈 <strong>MAX</strong> — Your AI Growth Manager. Revenue analysis.</p>
          <p style="margin:0;font-size:13px;">🗂️ <strong>REX</strong> — Your AI Ops Manager. Proposals and contracts.</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#7b2fff;color:#fff;padding:10px 24px;text-decoration:none;font-size:11px;letter-spacing:2px;">ENTER THE VAULT →</a>
        <p style="color:#1e3a5f;font-size:10px;margin-top:24px;">Black Vault Intelligence Ltd · AI-generated information only, not regulated financial advice.</p>
      </div>
    `,
  })
}
