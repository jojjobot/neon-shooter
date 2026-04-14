export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 w-36 bg-wow-card rounded mb-8" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="wow-card p-6 mb-6">
          <div className="h-5 w-28 bg-wow-dark rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-wow-dark rounded" />
            <div className="h-4 w-3/4 bg-wow-dark rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
