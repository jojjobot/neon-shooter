import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { discordWebhook } = body

  if (discordWebhook !== undefined) {
    // Validate it looks like a Discord webhook URL (or empty to clear it)
    if (discordWebhook !== '' && !discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json(
        { error: 'Invalid Discord webhook URL. Must start with https://discord.com/api/webhooks/' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.tier !== 'GOLD_GOBLIN') {
      return NextResponse.json(
        { error: 'Discord webhooks require a Gold Goblin subscription.' },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id: userId },
      data: { discordWebhook: discordWebhook || null },
    })
  }

  return NextResponse.json({ ok: true })
}
