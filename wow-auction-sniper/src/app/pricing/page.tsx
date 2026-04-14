import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import PricingCard from '@/components/PricingCard'

export const metadata = {
  title: 'Pricing — WoW Auction Sniper',
}

export default async function PricingPage() {
  const { userId } = await auth()

  let tier = 'FREE'
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    tier = user?.tier ?? 'FREE'
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: [
        'Flip Finder — top opportunities',
        '30-day price history charts',
        'Realm rankings & activity',
        'Commodity price tracking',
        'Ad-supported',
      ],
      ctaLabel: tier === 'FREE' ? 'Current Plan' : 'Downgrade',
      ctaHref: '#',
      highlighted: false,
      currentPlan: tier === 'FREE',
      disabled: tier !== 'FREE',
    },
    {
      name: '⭐ Pro',
      price: '$4',
      features: [
        'Everything in Free',
        'Watchlist — up to 20 items',
        'Email snipe alerts',
        'Up to 5 tracked realms',
        'Ad-free experience',
        'Priority data updates',
      ],
      ctaLabel: tier === 'PRO' ? 'Current Plan' : 'Upgrade to Pro',
      ctaHref: '/api/checkout?plan=pro',
      highlighted: true,
      currentPlan: tier === 'PRO',
      disabled: false,
    },
    {
      name: '🏆 Gold Goblin',
      price: '$9',
      features: [
        'Everything in Pro',
        'Unlimited watchlist items',
        'Discord webhook alerts',
        'All realms unlocked',
        'API key access',
        'Early access features',
      ],
      ctaLabel: tier === 'GOLD_GOBLIN' ? 'Current Plan' : 'Go Gold Goblin',
      ctaHref: '/api/checkout?plan=gold',
      highlighted: false,
      currentPlan: tier === 'GOLD_GOBLIN',
      disabled: false,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-wow-text">Choose Your Plan</h1>
        <p className="mt-3 text-wow-muted max-w-xl mx-auto text-base">
          Start free. Upgrade when you need snipe alerts. No contracts — cancel anytime.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>

      {/* Feature comparison */}
      <div className="mt-16 wow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-wow-border">
          <h2 className="text-lg font-semibold text-wow-text">Full Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="wow-table">
            <thead>
              <tr>
                <th className="w-1/2">Feature</th>
                <th className="text-center">Free</th>
                <th className="text-center text-wow-gold">Pro</th>
                <th className="text-center text-wow-gold">Gold Goblin</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Flip Finder', '✓', '✓', '✓'],
                ['Price History (30-day)', '✓', '✓', '✓'],
                ['Realm Rankings', '✓', '✓', '✓'],
                ['Watchlist Items', '—', '20', 'Unlimited'],
                ['Email Alerts', '—', '✓', '✓'],
                ['Discord Webhook', '—', '—', '✓'],
                ['Tracked Realms', '5', '5', 'All'],
                ['API Access', '—', '—', '✓'],
                ['Ad-free', '—', '✓', '✓'],
              ].map(([feature, free, pro, gold]) => (
                <tr key={feature}>
                  <td className="text-wow-muted">{feature}</td>
                  <td className="text-center text-sm">
                    <span className={free === '—' ? 'text-wow-muted' : 'text-wow-green'}>
                      {free}
                    </span>
                  </td>
                  <td className="text-center text-sm">
                    <span className={pro === '—' ? 'text-wow-muted' : 'text-wow-gold'}>
                      {pro}
                    </span>
                  </td>
                  <td className="text-center text-sm">
                    <span className={gold === '—' ? 'text-wow-muted' : 'text-wow-gold'}>
                      {gold}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-sm text-wow-muted space-y-1">
        <p>Payments processed securely by Stripe. Prices in USD.</p>
        <p>
          Questions?{' '}
          <a href="mailto:support@wowsniper.gg" className="text-wow-gold hover:underline">
            support@wowsniper.gg
          </a>
        </p>
      </div>
    </div>
  )
}
