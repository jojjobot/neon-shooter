export default function PricingLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      <div className="text-center mb-12">
        <div className="h-10 w-64 bg-wow-card rounded mx-auto mb-3" />
        <div className="h-4 w-80 bg-wow-card rounded mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="wow-card p-6">
            <div className="h-5 w-20 bg-wow-dark rounded mb-3" />
            <div className="h-10 w-16 bg-wow-dark rounded mb-6" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-3 w-full bg-wow-dark rounded mb-3" />
            ))}
            <div className="h-10 bg-wow-dark rounded-lg mt-6" />
          </div>
        ))}
      </div>
    </div>
  )
}
