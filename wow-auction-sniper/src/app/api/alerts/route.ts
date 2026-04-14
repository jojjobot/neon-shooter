import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const alerts = await prisma.alert.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { triggeredAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(
    alerts.map((a) => ({
      id: a.id,
      itemId: a.itemId,
      itemName: a.item.name,
      currentPrice: Number(a.currentPrice),
      triggeredAt: a.triggeredAt.toISOString(),
      sentEmail: a.sentEmail,
      sentDiscord: a.sentDiscord,
    }))
  )
}
