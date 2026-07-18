import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="font-mono-tech text-[10px] tracking-[4px] text-cyan/40 mb-4">{'// ERROR 404'}</div>
        <h1 className="font-orbitron text-6xl text-cyan mb-2" style={{ textShadow: '0 0 20px rgba(0,200,255,0.4)' }}>404</h1>
        <p className="font-orbitron text-lg text-text mb-2">PAGE NOT FOUND</p>
        <p className="text-textMuted font-rajdhani text-sm mb-8">This sector of the vault does not exist or has been decommissioned.</p>
        <Link
          href="/dashboard"
          className="font-orbitron text-xs text-cyan border border-cyan/40 px-6 py-3 hover:bg-cyan/10 transition-colors tracking-wider"
          style={{ boxShadow: '0 0 10px rgba(0,200,255,0.1)' }}
        >
          RETURN TO VAULT →
        </Link>
      </div>
    </div>
  )
}
