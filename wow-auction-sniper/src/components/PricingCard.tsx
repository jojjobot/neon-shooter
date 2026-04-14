interface Props {
  name: string
  price: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
  currentPlan?: boolean
  disabled?: boolean
}

export default function PricingCard({
  name,
  price,
  features,
  ctaLabel,
  ctaHref,
  highlighted = false,
  currentPlan = false,
  disabled = false,
}: Props) {
  return (
    <div
      className={`wow-card p-6 flex flex-col relative ${
        highlighted ? 'border-wow-gold shadow-wow-glow' : ''
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="badge badge-gold px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      {currentPlan && (
        <div className="absolute top-4 right-4">
          <span className="badge badge-green text-xs">Current Plan</span>
        </div>
      )}

      {/* Plan name + price */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-wow-text">{name}</h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-bold text-wow-gold">{price}</span>
          {price !== '$0' && (
            <span className="text-wow-muted text-sm pb-1">/month</span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-wow-muted">
            <span className="text-wow-green shrink-0 mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {currentPlan || disabled ? (
        <div className="text-center text-sm py-2.5 px-4 rounded-lg font-semibold border border-wow-border text-wow-muted opacity-60 cursor-not-allowed">
          {ctaLabel}
        </div>
      ) : (
        <a
          href={ctaHref}
          className={`text-center text-sm py-2.5 px-4 rounded-lg font-semibold transition-colors ${
            highlighted ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          {ctaLabel}
        </a>
      )}
    </div>
  )
}
