import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

function requireGoldGoblin(tier: string) {
  return tier !== 'GOLD_GOBLIN'
    ? NextResponse.json(
        { error: 'API key access requires a Gold Goblin subscription.' },
        { status: 403 }
      )
    : null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const denied = requireGoldGoblin(user?.tier ?? 'FREE')
  if (denied) return denied

  return NextResponse.json({ apiKey: (user as any).apiKey ?? null })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const denied = requireGoldGoblin(user?.tier ?? 'FREE')
  if (denied) return denied

  const apiKey = `wsnipe_${randomBytes(24).toString('hex')}`
  await prisma.user.update({ where: { id: userId }, data: { apiKey } as any })

  return NextResponse.json({ apiKey })
}
