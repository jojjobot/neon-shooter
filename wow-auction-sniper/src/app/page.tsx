import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-bg relative overflow-hidden pt-20 pb-32">
        {/* Decorative background orbs */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-wow-gold opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 opacity-3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge badge-gold mb-6 py-1 px-4 text-sm">
              <span>⚔️</span>
              <span>Now tracking 50+ items across 5 realms</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-wow-text">WoW </span>
              <span className="text-wow-gold">Auction</span>
              <br />
              <span className="text-wow-text">Sniper</span>
            </h1>

            <p className="text-xl sm:text-2xl text-wow-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              Track prices, find flips, dominate the Auction House. Get alerted the moment a deal appears.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/market" className="btn-primary text-lg px-8 py-4">
                View Market →
              </Link>
              <Link href="/pricing" className="btn-secondary text-lg px-8 py-4">
                Get Started Free
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12">
              {[
                { value: '50+', label: 'Items tracked' },
                { value: '5', label: 'Realms' },
                { value: '~60min', label: 'Update interval' },
                { value: '14 days', label: 'Price history' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-wow-gold">{stat.value}</div>
                  <div className="text-sm text-wow-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-wow-card border-y border-wow-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-wow-text mb-4">
              Everything you need to{' '}
              <span className="text-wow-gold">print gold</span>
            </h2>
            <p className="text-wow-muted text-lg max-w-2xl mx-auto">
              Stop guessing. Start sniping. Our tools give you the edge over the competition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="wow-card p-8 hover:border-wow-gold transition-colors duration-200">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-wow-gold mb-3">Flip Finder</h3>
              <p className="text-wow-muted leading-relaxed">
                Find items trading more than 15% below their 14-day average price. Updated hourly
                so you&apos;re always seeing the latest deals.
              </p>
              <Link
                href="/market"
                className="inline-flex items-center gap-1 mt-4 text-wow-gold text-sm font-medium hover:text-wow-gold-light"
              >
                Browse Flips →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="wow-card p-8 hover:border-wow-gold transition-colors duration-200 relative">
              <div className="absolute top-4 right-4 badge badge-gold text-xs">Popular</div>
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-wow-gold mb-3">Price History</h3>
              <p className="text-wow-muted leading-relaxed">
                30 days of OHLC candlestick charts per item per realm. Spot trends, seasonal
                patterns, and the best time to buy or sell.
              </p>
              <Link
                href="/item/172057"
                className="inline-flex items-center gap-1 mt-4 text-wow-gold text-sm font-medium hover:text-wow-gold-light"
              >
                View Charts →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="wow-card p-8 hover:border-wow-gold transition-colors duration-200">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-wow-gold mb-3">Snipe Alerts</h3>
              <p className="text-wow-muted leading-relaxed">
                Set a target price and get emailed the moment a deal appears. Gold Goblin members
                also get Discord webhook alerts.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 mt-4 text-wow-gold text-sm font-medium hover:text-wow-gold-light"
              >
                Get Alerts →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-wow-text mb-4">
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🔍', title: 'Browse Market', desc: 'Check the Flip Finder for items below 14-day average' },
              { step: '2', icon: '📉', title: 'Set Target Price', desc: 'Add items to your watchlist with a target buy price' },
              { step: '3', icon: '📧', title: 'Get Alerted', desc: 'Receive an email (or Discord ping) when prices drop' },
              { step: '4', icon: '💰', title: 'Print Gold', desc: 'Snipe the deal before anyone else sees it' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-wow-card border border-wow-gold flex items-center justify-center mx-auto mb-4 text-wow-gold font-bold text-lg">
                  {item.step}
                </div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-wow-text mb-2">{item.title}</h3>
                <p className="text-wow-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-wow-card border-y border-wow-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-wow-text mb-4">
            Simple pricing
          </h2>
          <p className="text-wow-muted text-lg mb-10 max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready to dominate.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { name: 'Free', price: '$0', desc: 'Flip Finder + Price History' },
              { name: 'Pro', price: '$4/mo', desc: 'Alerts + Watchlist', highlight: true },
              { name: 'Gold Goblin', price: '$9/mo', desc: 'Discord + API + Unlimited realms' },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`wow-card px-8 py-6 min-w-48 ${
                  tier.highlight ? 'border-wow-gold gold-glow' : ''
                }`}
              >
                {tier.highlight && (
                  <div className="badge badge-gold text-xs mb-3">Most Popular</div>
                )}
                <div className="text-wow-gold text-2xl font-bold">{tier.price}</div>
                <div className="text-wow-text font-semibold mt-1">{tier.name}</div>
                <div className="text-wow-muted text-sm mt-1">{tier.desc}</div>
              </div>
            ))}
          </div>

          <Link href="/pricing" className="btn-primary text-base px-8 py-3">
            See Full Pricing →
          </Link>
        </div>
      </section>

      {/* Realm Coverage */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-wow-text mb-4">
              Realm coverage
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'US — Stormrage', flag: '🇺🇸' },
              { name: 'US — Area 52', flag: '🇺🇸' },
              { name: 'US — Illidan', flag: '🇺🇸' },
              { name: 'EU — Ravencrest', flag: '🇪🇺' },
              { name: 'EU — Tarren Mill', flag: '🇪🇺' },
            ].map((realm) => (
              <div key={realm.name} className="badge badge-green py-2 px-4 text-sm">
                {realm.flag} {realm.name}
              </div>
            ))}
          </div>
          <p className="text-center text-wow-muted text-sm mt-6">
            More realms available on Pro and Gold Goblin tiers.{' '}
            <Link href="/realms" className="text-wow-gold hover:underline">
              View realm stats →
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
