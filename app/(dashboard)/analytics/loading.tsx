export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-8 w-44 bg-surface2 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-4 h-24" />
        ))}
      </div>
      <div className="bg-surface border border-border p-5 h-56" />
      <div className="bg-surface border border-border p-5 h-48" />
    </div>
  )
}
