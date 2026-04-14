import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LastUpdated from '@/components/LastUpdated'
import PriceChart from '@/components/PriceChart'

function formatGold(copper: number): string {
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  const c = copper % 100
  return `${g.toLocaleString()}g ${s}s ${c}c`
}

function calcAvg(history: { close: bigint }[], days: number): number {
  const slice = history.slice(-days)
  if (slice.length === 0) return 0
  const sum = slice.reduce((acc, h) => acc + Number(h.close), 0)
  return sum / slice.length
}

interface PageProps {
  params: { itemId: string }
  searchParams: { realm?: string }
}

export const revalidate = 300

export default async function ItemDetailPage({ params, searchParams }: PageProps) {
  const itemId = parseInt(params.itemId, 10)
  if (isNaN(itemId)) notFound()

  const item = await prisma.item.findUnique({ where: { id: itemId } })
  if (!item) notFound()

  const realms = await prisma.realm.findMany({ where: { isTracked: true }, orderBy: { name: 'asc' } })
  const selectedRealmId = searchParams.realm ? parseInt(searchParams.realm, 10) : realms[0]?.id
  const selectedRealm = realms.find((r) => r.id === selectedRealmId) ?? realms[0]

  // Get 30 days of price history
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const history = await prisma.priceHistory.findMany({
    where: {
      itemId,
      realmId: selectedRealm?.id,
      date: { gte: thirtyDaysAgo },
    },
    orderBy: { date: 'asc' },
  })

  // Get latest snapshot
  const latestSnapshot = await prisma.auctionSnapshot.findFirst({
    where: { itemId, realmId: selectedRealm?.id },
    orderBy: { timestamp: 'desc' },
  })

  const chartData = history.map((h) => ({
    date: h.date.toISOString().split('T')[0],
    close: Number(h.close),
    high: Number(h.high),
    low: Number(h.low),
    open: Number(h.open),
  }))

  const avg7 = calcAvg(history, 7)
  const avg14 = calcAvg(history, 14)
  const avg30 = calcAvg(history, 30)
  const currentPrice = latestSnapshot ? Number(latestSnapshot.minBuyout) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-wow-muted mb-6">
        <Link href="/" className="hover:text-wow-gold">Home</Link>
        <span>/</span>
        <Link href="/market" className="hover:text-wow-gold">Market</Link>
        <span>/</span>
        <span className="text-wow-text">{item.name}</span>
      </div>

      {/* Item Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          {/* Icon placeholder */}
          <div className="w-16 h-16 rounded-lg bg-wow-card border border-wow-border flex items-center justify-center text-3xl">
            {item.category === 'Herb' ? '🌿' :
             item.category === 'Metal & Stone' ? '⛏️' :
             item.category === 'Elemental' ? '✨' :
             item.category === 'Cloth' ? '🧵' :
             item.category === 'Currency' ? '💰' : '📦'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-wow-gold">{item.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-blue">{item.category}</span>
              <span className="text-wow-muted text-sm">Item #{item.id}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {latestSnapshot && (
            <LastUpdated timestamp={latestSnapshot.timestamp.toISOString()} />
          )}
          <Link
            href="/dashboard"
            className="btn-secondary text-sm px-4 py-2"
          >
            + Add to Watchlist
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Current Min',
            value: currentPrice ? formatGold(currentPrice) : '—',
            sub: 'Latest snapshot',
            color: 'text-wow-green',
          },
          {
            label: '7-Day Avg',
            value: avg7 ? formatGold(Math.round(avg7)) : '—',
            sub: `${history.slice(-7).length} data points`,
            color: 'text-wow-gold',
          },
          {
            label: '14-Day Avg',
            value: avg14 ? formatGold(Math.round(avg14)) : '—',
            sub: `${history.slice(-14).length} data points`,
            color: 'text-wow-gold',
          },
          {
            label: '30-Day Avg',
            value: avg30 ? formatGold(Math.round(avg30)) : '—',
            sub: `${history.length} data points`,
            color: 'text-wow-muted',
          },
        ].map((stat) => (
          <div key={stat.label} className="wow-card p-4">
            <div className="text-xs text-wow-muted uppercase tracking-wide mb-1">{stat.label}</div>
            <div className={`text-lg font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-wow-muted mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Realm Selector + Chart */}
      <div className="wow-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-wow-text">30-Day Price History</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-wow-muted">Realm:</label>
            <form>
              <select
                name="realm"
                defaultValue={selectedRealm?.id}
                className="bg-wow-dark border border-wow-border rounded-md px-3 py-1.5 text-sm text-wow-text focus:outline-none focus:border-wow-gold"
                onChange={(e) => {
                  // This is a server component, so we need a form submit
                }}
              >
                {realms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.region} — {r.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="ml-2 text-xs text-wow-gold hover:underline">
                Go
              </button>
            </form>
          </div>
        </div>

        {chartData.length > 0 ? (
          <PriceChart data={chartData} height={300} />
        ) : (
          <div className="flex items-center justify-center h-48 text-wow-muted">
            <div className="text-center">
              <div className="text-3xl mb-2">📉</div>
              <p>No price history available for this realm.</p>
            </div>
          </div>
        )}
      </div>

      {/* Auction Snapshot Details */}
      {latestSnapshot && (
        <div className="wow-card p-6">
          <h2 className="text-lg font-semibold text-wow-text mb-4">Latest Snapshot</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-wow-muted uppercase tracking-wide">Min Buyout</div>
              <div className="text-wow-green font-mono font-bold mt-1">
                {formatGold(Number(latestSnapshot.minBuyout))}
              </div>
            </div>
            <div>
              <div className="text-xs text-wow-muted uppercase tracking-wide">Total Quantity</div>
              <div className="text-wow-text font-bold mt-1">
                {latestSnapshot.quantity.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-wow-muted uppercase tracking-wide">Num Auctions</div>
              <div className="text-wow-text font-bold mt-1">
                {latestSnapshot.numAuctions.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
