export default function RealmsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-wow-card rounded mb-2" />
          <div className="h-4 w-64 bg-wow-card rounded" />
        </div>
        <div className="h-5 w-32 bg-wow-card rounded" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="wow-card p-4">
            <div className="h-7 w-12 bg-wow-dark rounded mx-auto mb-2" />
            <div className="h-3 w-24 bg-wow-dark rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="wow-card overflow-hidden">
        <div className="h-10 bg-wow-dark border-b border-wow-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-4 py-4 border-b border-wow-border last:border-0">
            <div className="h-4 w-32 bg-wow-card rounded" />
            <div className="h-5 w-14 bg-wow-card rounded-full" />
            <div className="h-4 w-24 bg-wow-card rounded ml-auto" />
            <div className="h-4 w-24 bg-wow-card rounded" />
            <div className="h-4 w-20 bg-wow-card rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
