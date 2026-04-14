import { prisma } from '@/lib/prisma'
import LastUpdated from '@/components/LastUpdated'
import RealmTable from '@/components/RealmTable'

export const revalidate = 300

async function getRealmData() {
  const realms = await prisma.realm.findMany({
    orderBy: { name: 'asc' },
  })

  const realmStats = await Promise.all(
    realms.map(async (realm) => {
      // Get latest snapshot stats per realm
      const latestSnapshots = await prisma.auctionSnapshot.findMany({
        where: { realmId: realm.id },
        orderBy: { timestamp: 'desc' },
        distinct: ['itemId'],
      })

      const totalAuctions = latestSnapshots.reduce((sum, s) => sum + s.numAuctions, 0)
      const totalQuantity = latestSnapshots.reduce((sum, s) => sum + s.quantity, 0)

      // Average daily volume from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentHistory = await prisma.priceHistory.findMany({
        where: {
          realmId: realm.id,
          date: { gte: sevenDaysAgo },
        },
      })
      const avgDailyVolume = recentHistory.length > 0
        ? Math.round(recentHistory.reduce((sum, h) => sum + h.volume, 0) / 7)
        : 0

      return {
        ...realm,
        totalAuctions,
        totalQuantity,
        avgDailyVolume,
        lastSnapshotAt: realm.lastSnapshotAt,
      }
    })
  )

  // Sort by total auctions descending
  return realmStats.sort((a, b) => b.totalAuctions - a.totalAuctions)
}

export default async function RealmsPage() {
  const realms = await getRealmData()
  const lastUpdated = new Date()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-wow-text">🌐 Realm Rankings</h1>
          <p className="text-wow-muted mt-1">
            Tracked realms sorted by auction house activity
          </p>
        </div>
        <LastUpdated timestamp={lastUpdated.toISOString()} />
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="wow-card p-4 text-center">
          <div className="text-2xl font-bold text-wow-gold">{realms.length}</div>
          <div className="text-xs text-wow-muted mt-1">Tracked Realms</div>
        </div>
        <div className="wow-card p-4 text-center">
          <div className="text-2xl font-bold text-wow-gold">
            {realms.filter(r => r.region === 'US').length}
          </div>
          <div className="text-xs text-wow-muted mt-1">US Realms</div>
        </div>
        <div className="wow-card p-4 text-center">
          <div className="text-2xl font-bold text-wow-gold">
            {realms.filter(r => r.region === 'EU').length}
          </div>
          <div className="text-xs text-wow-muted mt-1">EU Realms</div>
        </div>
        <div className="wow-card p-4 text-center">
          <div className="text-2xl font-bold text-wow-gold">
            {realms.reduce((sum, r) => sum + r.totalAuctions, 0).toLocaleString()}
          </div>
          <div className="text-xs text-wow-muted mt-1">Total Auctions</div>
        </div>
      </div>

      {/* Realm table */}
      <RealmTable realms={realms} />

      <p className="mt-4 text-xs text-wow-muted text-center">
        More realms available on Pro and Gold Goblin tiers. Data updates every ~60 minutes.
      </p>
    </div>
  )
}
