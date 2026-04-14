import { prisma } from '@/lib/prisma'
import LastUpdated from '@/components/LastUpdated'
import FlipFinderTable from '@/components/FlipFinderTable'

export const revalidate = 300 // Revalidate every 5 minutes

interface FlipItem {
  itemId: number
  name: string
  category: string
  currentPrice: number
  avgPrice: number
  margin: number
  volume: number
  lastUpdated: string
  realmName: string
  realmId: number
}

async function getFlipFinderData(): Promise<FlipItem[]> {
  // Get the latest snapshot per item per realm
  const latestSnapshots = await prisma.auctionSnapshot.findMany({
    orderBy: { timestamp: 'desc' },
    distinct: ['itemId', 'realmId'],
    take: 500,
    include: {
      item: true,
      realm: true,
    },
  })

  const flips: FlipItem[] = []

  for (const snapshot of latestSnapshots) {
    const currentPrice = Number(snapshot.minBuyout)

    // Get 14-day average price
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const history = await prisma.priceHistory.findMany({
      where: {
        itemId: snapshot.itemId,
        realmId: snapshot.realmId,
        date: { gte: fourteenDaysAgo },
      },
    })

    if (history.length < 3) continue // Not enough data

    const avgPrice = history.reduce((sum, h) => sum + Number(h.close), 0) / history.length
    const margin = ((avgPrice - currentPrice) / avgPrice) * 100
    const volume = history.reduce((sum, h) => sum + h.volume, 0)

    // Only show items trading at least 15% below average
    if (margin < 15) continue

    flips.push({
      itemId: snapshot.itemId,
      name: snapshot.item.name,
      category: snapshot.item.category,
      currentPrice,
      avgPrice,
      margin,
      volume,
      lastUpdated: snapshot.timestamp.toISOString(),
      realmName: snapshot.realm.name,
      realmId: snapshot.realmId,
    })
  }

  // Sort by margin descending
  return flips.sort((a, b) => b.margin - a.margin)
}

export default async function MarketPage() {
  const flips = await getFlipFinderData()

  const lastUpdated = flips.length > 0
    ? flips.reduce((latest, f) => f.lastUpdated > latest ? f.lastUpdated : latest, flips[0].lastUpdated)
    : new Date()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-wow-text">
              📊 Flip Finder
            </h1>
            <p className="text-wow-muted mt-1">
              Items trading below their 14-day average price
            </p>
          </div>
          <LastUpdated timestamp={lastUpdated.toISOString()} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 flex items-start gap-3 bg-wow-card border border-wow-gold/30 rounded-lg p-4 text-sm text-wow-muted">
        <span className="text-wow-gold mt-0.5">ℹ️</span>
        <span>
          Data updates hourly. Prices shown are minimums from the last snapshot.
          Only items with at least 15% margin vs 14-day average are shown.
        </span>
      </div>

      {flips.length === 0 ? (
        <div className="wow-card p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-wow-muted text-lg">No flip opportunities found right now.</p>
          <p className="text-wow-muted text-sm mt-2">Check back after the next hourly update.</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-wow-muted text-sm mb-4">
            Showing <span className="text-wow-gold font-medium">{flips.length}</span> flip opportunities
          </p>

          {/* Table — sortable client component */}
          <FlipFinderTable flips={flips} />

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-wow-muted">
            <span>Margin color scale:</span>
            <span className="text-yellow-400">▶ 15–20% good deal</span>
            <span className="text-wow-gold">▶ 20–30% great deal</span>
            <span className="text-green-400">▶ 30%+ exceptional deal</span>
          </div>
        </>
      )}
    </div>
  )
}
