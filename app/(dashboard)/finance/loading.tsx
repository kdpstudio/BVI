export default function FinanceLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-surface2" />
        <div className="h-6 w-40 bg-surface2 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-4 h-24" />
        ))}
      </div>
      <div className="bg-surface border border-cyan/10 p-5 h-28" />
      <div className="bg-surface border border-border p-5 h-56" />
      <div className="bg-surface border border-border p-5 h-72" />
    </div>
  )
}
