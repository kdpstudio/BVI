export function MetricCardSkeleton({ count = 4, style = 'default' }: { count?: number; style?: 'default' | 'vault' }) {
  if (style === 'vault') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="relative border border-cyan/15 p-4 overflow-hidden" style={{ background: '#060f1a' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.15), transparent)' }} />
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/20" />
            <div className="h-2 w-24 rounded-sm bg-cyan/10 animate-pulse mb-3" />
            <div className="h-7 w-20 rounded-sm bg-cyan/10 animate-pulse mb-2" />
            <div className="h-2 w-16 rounded-sm bg-cyan/10 animate-pulse mb-3" />
            <div className="h-0.5 w-full rounded-sm bg-cyan/10 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border p-4 h-24 relative overflow-hidden">
          <div className="h-2 w-20 rounded-sm bg-border animate-pulse mb-3" />
          <div className="h-6 w-24 rounded-sm bg-border animate-pulse mb-2" />
          <div className="h-2 w-14 rounded-sm bg-border animate-pulse" />
        </div>
      ))}
    </div>
  )
}
