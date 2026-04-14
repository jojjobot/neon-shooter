import { Worker, Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { getCommodityAuctions, getConnectedRealmAuctions } from '../lib/blizzard'

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }

interface AuctionItem {
  id: number
  item: { id: number }
  buyout?: number
  unit_price?: number
  quantity: number
  time_left: string
}

async function upsertDailyOHLC(
  itemId: number,
  realmId: number | null,
  price: number,
  volume: number
): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.priceHistory.findUnique({
    where: {
      itemId_realmId_date: {
        itemId,
        realmId: realmId ?? 0,
        date: today,
      },
    },
  })

  if (existing) {
    await prisma.priceHistory.update({
      where: { id: existing.id },
      data: {
        high: existing.high < BigInt(price) ? BigInt(price) : existing.high,
        low: existing.low > BigInt(price) ? BigInt(price) : existing.low,
        close: BigInt(price),
        volume: existing.volume + volume,
      },
    })
  } else {
    await prisma.priceHistory.create({
      data: {
        itemId,
        realmId,
        date: today,
        open: BigInt(price),
        high: BigInt(price),
        low: BigInt(price),
        close: BigInt(price),
        volume,
      },
    })
  }
}

async function processCommodityAuctions(): Promise<void> {
  console.log('[ahPoller] Fetching commodity auctions...')

  const data = await getCommodityAuctions('us')
  const auctions = data.auctions ?? []

  // Get our tracked item IDs
  const trackedItems = await prisma.item.findMany({ select: { id: true } })
  const trackedIds = new Set(trackedItems.map((i) => i.id))

  // Group auctions by item
  const itemMap = new Map<number, { minPrice: number; totalQuantity: number; count: number }>()

  for (const auction of auctions) {
    const itemId = auction.item?.id
    if (!itemId || !trackedIds.has(itemId)) continue

    const price = auction.unit_price ?? auction.buyout ?? 0
    if (price <= 0) continue

    const existing = itemMap.get(itemId)
    if (!existing) {
      itemMap.set(itemId, { minPrice: price, totalQuantity: auction.quantity, count: 1 })
    } else {
      itemMap.set(itemId, {
        minPrice: Math.min(existing.minPrice, price),
        totalQuantity: existing.totalQuantity + auction.quantity,
        count: existing.count + 1,
      })
    }
  }

  const now = new Date()
  let saved = 0

  for (const [itemId, stats] of itemMap.entries()) {
    // For commodities we use realmId = null (cross-realm)
    // Use realm 1 as default for snapshots since it requires a realmId FK
    const trackedRealms = await prisma.realm.findMany({ where: { isTracked: true } })

    for (const realm of trackedRealms) {
      await prisma.auctionSnapshot.create({
        data: {
          realmId: realm.id,
          itemId,
          timestamp: now,
          minBuyout: BigInt(stats.minPrice),
          quantity: stats.totalQuantity,
          numAuctions: stats.count,
        },
      })

      await upsertDailyOHLC(itemId, realm.id, stats.minPrice, stats.totalQuantity)
      saved++
    }
  }

  console.log(`[ahPoller] Saved ${saved} commodity snapshots`)
}

async function processRealmAuctions(): Promise<void> {
  const trackedRealms = await prisma.realm.findMany({ where: { isTracked: true } })
  const trackedItems = await prisma.item.findMany({ select: { id: true } })
  const trackedIds = new Set(trackedItems.map((i) => i.id))

  console.log(`[ahPoller] Processing ${trackedRealms.length} realms...`)

  for (const realm of trackedRealms) {
    try {
      console.log(`[ahPoller] Fetching realm ${realm.name} (${realm.connectedRealmId})...`)
      const data = await getConnectedRealmAuctions(realm.connectedRealmId, realm.region.toLowerCase())
      const auctions = (data.auctions ?? []) as AuctionItem[]

      const itemMap = new Map<number, { minPrice: number; totalQuantity: number; count: number }>()

      for (const auction of auctions) {
        const itemId = auction.item?.id
        if (!itemId || !trackedIds.has(itemId)) continue

        const price = auction.buyout ?? auction.unit_price ?? 0
        if (price <= 0) continue

        const existing = itemMap.get(itemId)
        if (!existing) {
          itemMap.set(itemId, { minPrice: price, totalQuantity: auction.quantity, count: 1 })
        } else {
          itemMap.set(itemId, {
            minPrice: Math.min(existing.minPrice, price),
            totalQuantity: existing.totalQuantity + auction.quantity,
            count: existing.count + 1,
          })
        }
      }

      const now = new Date()
      for (const [itemId, stats] of itemMap.entries()) {
        await prisma.auctionSnapshot.create({
          data: {
            realmId: realm.id,
            itemId,
            timestamp: now,
            minBuyout: BigInt(stats.minPrice),
            quantity: stats.totalQuantity,
            numAuctions: stats.count,
          },
        })

        await upsertDailyOHLC(itemId, realm.id, stats.minPrice, stats.totalQuantity)
      }

      // Update realm last snapshot time
      await prisma.realm.update({
        where: { id: realm.id },
        data: { lastSnapshotAt: now },
      })

      console.log(`[ahPoller] Realm ${realm.name}: ${itemMap.size} items processed`)
    } catch (error) {
      console.error(`[ahPoller] Failed to process realm ${realm.name}:`, error)
    }
  }
}

export const ahPollerWorker = new Worker(
  'ah-polling',
  async (job: Job) => {
    if (job.name === 'poll-commodities') {
      await processCommodityAuctions()
    } else if (job.name === 'poll-realms') {
      await processRealmAuctions()
    }
  },
  { connection }
)

ahPollerWorker.on('completed', (job: Job) => {
  console.log(`[ahPoller] Job ${job.id} (${job.name}) completed`)
})

ahPollerWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[ahPoller] Job ${job?.id} failed:`, err.message)
})
