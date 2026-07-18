import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Black Vault Intelligence — AI Back Office for Freelancers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020408',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,200,255,0.12) 0%, transparent 70%)',
        }} />

        {/* Corner accents */}
        {[
          { top: 24, left: 24, borderTop: '2px solid #00c8ff', borderLeft: '2px solid #00c8ff' },
          { top: 24, right: 24, borderTop: '2px solid #00c8ff', borderRight: '2px solid #00c8ff' },
          { bottom: 24, left: 24, borderBottom: '2px solid #00c8ff', borderLeft: '2px solid #00c8ff' },
          { bottom: 24, right: 24, borderBottom: '2px solid #00c8ff', borderRight: '2px solid #00c8ff' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 32, height: 32, ...s }} />
        ))}

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, border: '2px solid #00c8ff',
            transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,200,255,0.4)',
          }}>
            <div style={{ width: 14, height: 14, background: '#00c8ff', transform: 'rotate(-45deg)' }} />
          </div>
          <span style={{ color: '#00c8ff', fontSize: 28, letterSpacing: 8, textShadow: '0 0 20px #00c8ff' }}>
            BVI
          </span>
        </div>

        {/* Agent badges */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          {[
            { id: 'FINN', color: '#00c8ff' },
            { id: 'SAGE', color: '#00ff88' },
            { id: 'ARIA', color: '#a855f7' },
            { id: 'MAX',  color: '#ffb800' },
            { id: 'REX',  color: '#ff2d78' },
          ].map(a => (
            <div key={a.id} style={{
              border: `1px solid ${a.color}60`,
              background: `${a.color}10`,
              color: a.color,
              padding: '6px 16px',
              fontSize: 13,
              letterSpacing: 3,
            }}>{a.id}</div>
          ))}
        </div>

        {/* Headline */}
        <div style={{
          color: 'rgba(200,230,255,0.95)',
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: 2,
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: 20,
          maxWidth: 900,
        }}>
          AI BACK OFFICE FOR FREELANCERS
        </div>

        {/* Subline */}
        <div style={{
          color: 'rgba(150,190,220,0.6)',
          fontSize: 22,
          textAlign: 'center',
          maxWidth: 700,
          letterSpacing: 1,
        }}>
          Bookkeeping · Tax Intelligence · Growth Analytics · Document Forge
        </div>

        {/* Bottom line */}
        <div style={{
          position: 'absolute', bottom: 40,
          color: 'rgba(100,140,170,0.4)',
          fontSize: 13,
          letterSpacing: 4,
        }}>
          BLACKVAULTINTELLIGENCE.COM
        </div>
      </div>
    ),
    { ...size }
  )
}
