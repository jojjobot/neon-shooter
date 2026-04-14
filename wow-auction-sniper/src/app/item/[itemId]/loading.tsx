export default function ItemLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-6">
        <div className="h-4 w-12 bg-wow-card rounded" />
        <div className="h-4 w-2 bg-wow-card rounded" />
        <div className="h-4 w-16 bg-wow-card rounded" />
        <div className="h-4 w-2 bg-wow-card rounded" />
        <div className="h-4 w-32 bg-wow-card rounded" />
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 bg-wow-card rounded-lg shrink-0" />
        <div>
          <div className="h-8 w-56 bg-wow-card rounded mb-2" />
          <div className="h-5 w-28 bg-wow-card rounded" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="wow-card p-4">
            <div className="h-3 w-20 bg-wow-dark rounded mb-2" />
            <div className="h-6 w-32 bg-wow-dark rounded" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="wow-card p-6 mb-8">
        <div className="h-5 w-40 bg-wow-dark rounded mb-6" />
        <div className="h-72 bg-wow-dark rounded" />
      </div>

      {/* Snapshot */}
      <div className="wow-card p-6">
        <div className="h-5 w-36 bg-wow-dark rounded mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-24 bg-wow-dark rounded mb-2" />
              <div className="h-5 w-32 bg-wow-dark rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
