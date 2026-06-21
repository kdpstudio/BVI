import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 scanline" />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center z-20">
        <Link href="/">
          <h1 className="font-orbitron text-2xl text-cyan tracking-[0.3em] hover:text-white transition-colors">
            BVI
          </h1>
          <p className="text-textMuted text-xs tracking-[0.2em] mt-1 font-rajdhani uppercase">
            Black Vault Intelligence
          </p>
        </Link>
      </div>

      <div className="w-full max-w-md px-4 z-20">
        {children}
      </div>
    </div>
  )
}
