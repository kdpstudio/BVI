import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-orbitron text-4xl text-cyan mb-4">BVI</h1>
        <p className="text-textMuted mb-8">Black Vault Intelligence</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-6 py-2 border border-cyan text-cyan font-orbitron text-sm hover:bg-cyanGlow transition-colors">
            LOGIN
          </Link>
          <Link href="/signup" className="px-6 py-2 bg-cyan text-background font-orbitron text-sm hover:brightness-110 transition-all">
            GET STARTED
          </Link>
        </div>
      </div>
    </div>
  )
}
