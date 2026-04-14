import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import WatchlistPanel from '@/components/WatchlistPanel'

function formatGold(copper: number): string {
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  const c = copper % 100
  return `${g.toLocaleString()}g ${s}s ${c}c`
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  // Get or create user record
  let dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser && user?.emailAddresses?.[0]?.emailAddress) {
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0].emailAddress,
      },
    })
  }

  const tier = dbUser?.tier ?? 'FREE'

  // Get watchlist with item and realm info + latest snapshot
  const watchlistRaw = await prisma.watchlist.findMany({
    where: { userId, isActive: true },
    include: {
      item: true,
      realm: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const watchlist = await Promise.all(
    watchlistRaw.map(async (w) => {
      const snapshot = await prisma.auctionSnapshot.findFirst({
        where: {
          itemId: w.itemId,
          ...(w.realmId ? { realmId: w.realmId } : {}),
        },
        orderBy: { timestamp: 'desc' },
      })

      const currentPrice = snapshot ? Number(snapshot.minBuyout) : null
      const targetPrice = Number(w.targetPrice)
      const status =
        currentPrice !== null && currentPrice <= targetPrice ? 'triggered' : 'watching'

      return {
        id: w.id,
        itemId: w.itemId,
        itemName: w.item.name,
        realmName: w.realm?.name ?? 'All Realms',
        targetPrice,
        currentPrice,
        status,
        createdAt: w.createdAt.toISOString(),
      }
    })
  )

  // Get recent alerts
  const recentAlerts = await prisma.alert.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { triggeredAt: 'desc' },
    take: 10,
  })

  const alertsData = recentAlerts.map((a) => ({
    id: a.id,
    itemName: a.item.name,
    currentPrice: Number(a.currentPrice),
    triggeredAt: a.triggeredAt.toISOString(),
    sentEmail: a.sentEmail,
    sentDiscord: a.sentDiscord,
  }))

  // Get all items and realms for the add-to-watchlist form
  const items = await prisma.item.findMany({ orderBy: { name: 'asc' } })
  const realms = await prisma.realm.findMany({ where: { isTracked: true }, orderBy: { name: 'asc' } })

  const tierLimits = { FREE: 0, PRO: 20, GOLD_GOBLIN: Infinity }
  const watchlistLimit = tierLimits[tier as keyof typeof tierLimits]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wow-text">📋 Dashboard</h1>
          <p className="text-wow-muted mt-1">
            Welcome back, {user?.firstName ?? 'Adventurer'}
          </p>
        </div>
        <div className={`badge ${
          tier === 'GOLD_GOBLIN' ? 'badge-gold' :
          tier === 'PRO' ? 'badge-blue' : 'badge-green'
        } py-1.5 px-4`}>
          {tier === 'GOLD_GOBLIN' ? '🏆 Gold Goblin' :
           tier === 'PRO' ? '⭐ Pro' : '🆓 Free'}
        </div>
      </div>

      {/* Upgrade banner for Free users */}
      {tier === 'FREE' && (
        <div className="mb-8 wow-card border-wow-gold/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-wow-gold font-semibold">Unlock Snipe Alerts</p>
            <p className="text-wow-muted text-sm mt-0.5">
              Upgrade to Pro to get email alerts when prices drop below your target.
            </p>
          </div>
          <a href="/pricing" className="btn-primary text-sm px-5 py-2 whitespace-nowrap">
            Upgrade to Pro →
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Watchlist Panel - takes 2/3 */}
        <div className="lg:col-span-2">
          <WatchlistPanel
            watchlist={watchlist}
            items={items.map(i => ({ id: i.id, name: i.name }))}
            realms={realms.map(r => ({ id: r.id, name: r.name, region: r.region }))}
            tier={tier}
            watchlistLimit={watchlistLimit}
            currentCount={watchlist.length}
          />
        </div>

        {/* Recent Alerts Panel */}
        <div>
          <div className="wow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-wow-border">
              <h2 className="text-lg font-semibold text-wow-text">🔔 Recent Alerts</h2>
              <p className="text-xs text-wow-muted mt-0.5">Last 10 triggered alerts</p>
            </div>

            {alertsData.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-3">🔕</div>
                <p className="text-wow-muted text-sm">No alerts yet.</p>
                <p className="text-wow-muted text-xs mt-1">
                  Add items to your watchlist to start receiving alerts.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-wow-border">
                {alertsData.map((alert) => (
                  <li key={alert.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-wow-gold text-sm font-medium">{alert.itemName}</p>
                        <p className="text-wow-green text-xs font-mono mt-0.5">
                          {formatGold(alert.currentPrice)}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {alert.sentEmail && (
                            <span className="badge badge-blue text-xs">📧 Email</span>
                          )}
                          {alert.sentDiscord && (
                            <span className="badge badge-blue text-xs">💬 Discord</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-wow-muted whitespace-nowrap">
                        {new Date(alert.triggeredAt).toLocaleDateString()}
                        <br />
                        {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
