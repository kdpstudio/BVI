import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BVI Pricing — AI Back Office for Freelancers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#020408', fontFamily: 'monospace', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(123,47,255,0.12) 0%, transparent 70%)',
        }} />

        {[
          { top: 24, left: 24, borderTop: '2px solid #7b2fff', borderLeft: '2px solid #7b2fff' },
          { top: 24, right: 24, borderTop: '2px solid #7b2fff', borderRight: '2px solid #7b2fff' },
          { bottom: 24, left: 24, borderBottom: '2px solid #7b2fff', borderLeft: '2px solid #7b2fff' },
          { bottom: 24, right: 24, borderBottom: '2px solid #7b2fff', borderRight: '2px solid #7b2fff' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 32, height: 32, ...s }} />
        ))}

        <div style={{ color: 'rgba(0,200,255,0.5)', fontSize: 14, letterSpacing: 6, marginBottom: 24 }}>
          // PRICING
        </div>

        <div style={{
          color: 'rgba(200,230,255,0.95)', fontSize: 64, fontWeight: 900,
          letterSpacing: 2, textAlign: 'center', lineHeight: 1.1, marginBottom: 24,
        }}>
          YOUR AI TEAM.<br />YOUR PRICE.
        </div>

        <div style={{
          color: 'rgba(150,190,220,0.6)', fontSize: 22, textAlign: 'center', marginBottom: 48, letterSpacing: 1,
        }}>
          Free to start · No credit card · Cancel anytime
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'FREE', price: '£0', color: '#64748b' },
            { label: 'SOLO', price: '£12', color: '#00c8ff' },
            { label: 'STUDIO', price: '£29', color: '#a855f7' },
            { label: 'AGENCY', price: '£59', color: '#ffb800' },
          ].map(t => (
            <div key={t.label} style={{
              border: `1px solid ${t.color}40`,
              background: `${t.color}08`,
              padding: '16px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              minWidth: 140,
            }}>
              <div style={{ color: t.color, fontSize: 13, letterSpacing: 4 }}>{t.label}</div>
              <div style={{ color: 'rgba(200,230,255,0.9)', fontSize: 28, fontWeight: 700 }}>{t.price}</div>
              <div style={{ color: 'rgba(150,190,220,0.4)', fontSize: 11, letterSpacing: 2 }}>/MO</div>
            </div>
          ))}
        </div>

        <div style={{
          position: 'absolute', bottom: 40,
          color: 'rgba(100,140,170,0.4)', fontSize: 13, letterSpacing: 4,
        }}>
          BLACKVAULTINTELLIGENCE.COM
        </div>
      </div>
    ),
    { ...size }
  )
}
