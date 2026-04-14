export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-40 bg-wow-card rounded mb-2" />
          <div className="h-4 w-48 bg-wow-card rounded" />
        </div>
        <div className="h-7 w-28 bg-wow-card rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Watchlist panel */}
        <div className="lg:col-span-2 wow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-wow-border flex items-center justify-between">
            <div>
              <div className="h-5 w-28 bg-wow-dark rounded mb-1" />
              <div className="h-3 w-36 bg-wow-dark rounded" />
            </div>
            <div className="h-8 w-24 bg-wow-dark rounded-lg" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-wow-border last:border-0">
              <div className="h-4 w-40 bg-wow-dark rounded mb-2" />
              <div className="h-3 w-64 bg-wow-dark rounded" />
            </div>
          ))}
        </div>

        {/* Alerts panel */}
        <div className="wow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-wow-border">
            <div className="h-5 w-32 bg-wow-dark rounded mb-1" />
            <div className="h-3 w-40 bg-wow-dark rounded" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-wow-border last:border-0">
              <div className="h-4 w-32 bg-wow-dark rounded mb-2" />
              <div className="h-3 w-20 bg-wow-dark rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
