export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-8 w-48 bg-surface2 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-4 h-24" />
        ))}
      </div>
      <div className="bg-surface border border-border p-5 h-48" />
      <div className="bg-surface border border-border p-5 h-64" />
    </div>
  )
}
