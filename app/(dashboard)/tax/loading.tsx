export default function TaxLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-8 w-52 bg-surface2 rounded" />
      <div className="bg-surface border border-yellow/10 p-4 h-12" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border p-4 h-24" />
        ))}
      </div>
      <div className="bg-surface border border-border p-5 h-48" />
      <div className="bg-surface border border-border p-5 h-40" />
    </div>
  )
}
