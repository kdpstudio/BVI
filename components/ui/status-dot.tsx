import { cn } from '@/lib/utils'

interface StatusDotProps {
  status?: 'active' | 'idle' | 'processing'
  label?: boolean
}

export function StatusDot({ status = 'active', label = false }: StatusDotProps) {
  const styles = {
    active: { dot: 'bg-green shadow-[0_0_6px_rgba(0,255,136,0.8)]', text: 'text-green', label: 'ACTIVE' },
    idle: { dot: 'bg-textMuted', text: 'text-textMuted', label: 'IDLE' },
    processing: { dot: 'bg-cyan shadow-[0_0_6px_rgba(0,200,255,0.8)]', text: 'text-cyan', label: 'PROCESSING' },
  }
  const s = styles[status]

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full animate-pulse', s.dot)} />
      {label && <span className={cn('font-orbitron text-xs', s.text)}>{s.label}</span>}
    </span>
  )
}
