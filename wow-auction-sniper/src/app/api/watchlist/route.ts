import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TIER_LIMITS: Record<string, number> = {
  FREE: 0,
  PRO: 20,
  GOLD_GOBLIN: Infinity,
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await prisma.watchlist.findMany({
    where: { userId, isActive: true },
    include: { item: true, realm: true },
    orderBy: { createdAt: 'desc' },
  })

  const data = await Promise.all(
    rows.map(async (w) => {
      const snapshot = await prisma.auctionSnapshot.findFirst({
        where: {
          itemId: w.itemId,
          ...(w.realmId ? { realmId: w.realmId } : {}),
        },
        orderBy: { timestamp: 'desc' },
      })
      const currentPrice = snapshot ? Number(snapshot.minBuyout) : null
      const targetPrice = Number(w.targetPrice)
      return {
        id: w.id,
        itemId: w.itemId,
        itemName: w.item.name,
        realmName: w.realm?.name ?? 'All Realms',
        targetPrice,
        currentPrice,
        status: currentPrice !== null && currentPrice <= targetPrice ? 'triggered' : 'watching',
        createdAt: w.createdAt.toISOString(),
      }
    })
  )

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { itemId, realmId, targetPrice } = body

  if (!itemId || !targetPrice || isNaN(Number(targetPrice))) {
    return NextResponse.json(
      { error: 'itemId and a numeric targetPrice are required.' },
      { status: 400 }
    )
  }

  // Verify item exists
  const item = await prisma.item.findUnique({ where: { id: Number(itemId) } })
  if (!item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 })

  // Check tier limit
  let dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser) {
    dbUser = await prisma.user.create({ data: { id: userId, email: '' } })
  }
  const tier = dbUser.tier ?? 'FREE'
  const limit = TIER_LIMITS[tier] ?? 0

  if (limit === 0) {
    return NextResponse.json(
      { error: 'Upgrade to Pro to use the watchlist.' },
      { status: 403 }
    )
  }

  const count = await prisma.watchlist.count({ where: { userId, isActive: true } })
  if (count >= limit) {
    return NextResponse.json(
      {
        error: `Watchlist limit reached (${limit} items). Upgrade to Gold Goblin for unlimited tracking.`,
      },
      { status: 403 }
    )
  }

  const entry = await prisma.watchlist.create({
    data: {
      userId,
      itemId: Number(itemId),
      realmId: realmId ? Number(realmId) : null,
      targetPrice: BigInt(Math.round(Number(targetPrice))),
    },
    include: { item: true, realm: true },
  })

  return NextResponse.json({
    id: entry.id,
    itemId: entry.itemId,
    itemName: entry.item.name,
    realmName: entry.realm?.name ?? 'All Realms',
    targetPrice: Number(entry.targetPrice),
    currentPrice: null,
    status: 'watching',
    createdAt: entry.createdAt.toISOString(),
  })
}

export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') ?? '')
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 })

  const entry = await prisma.watchlist.findFirst({ where: { id, userId } })
  if (!entry) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

  await prisma.watchlist.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
