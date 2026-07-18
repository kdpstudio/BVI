import Link from 'next/link'

interface EmptyStateProps {
  symbol?: string
  title: string
  description: string
  action?: { label: string; href: string }
  color?: string
}

export function EmptyState({ symbol = '◈', title, description, action, color = '#00c8ff' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 border flex items-center justify-center font-mono-tech text-2xl mb-5"
        style={{ borderColor: `${color}30`, color, background: `${color}08` }}
      >
        {symbol}
      </div>
      <div className="font-orbitron text-sm tracking-[2px] mb-2" style={{ color }}>
        {title}
      </div>
      <p className="font-rajdhani text-sm max-w-xs" style={{ color: 'rgba(150,190,220,0.5)' }}>
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 px-5 py-2 font-orbitron text-[11px] tracking-[2px] border transition-colors hover:opacity-80"
          style={{ borderColor: `${color}50`, color }}
        >
          {action.label} →
        </Link>
      )}
    </div>
  )
}
