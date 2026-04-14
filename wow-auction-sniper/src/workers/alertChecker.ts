import { Worker, Job } from 'bullmq'
import { prisma } from '../lib/prisma'
import { sendSnipeAlert } from '../lib/resend'

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }

const ONE_HOUR_MS = 60 * 60 * 1000

async function sendDiscordWebhook(webhookUrl: string, itemName: string, currentPrice: number, targetPrice: number): Promise<void> {
  const formatGold = (copper: number) => {
    const g = Math.floor(copper / 10000)
    const s = Math.floor((copper % 10000) / 100)
    const c = copper % 100
    return `${g.toLocaleString()}g ${s}s ${c}c`
  }

  const margin = (((targetPrice - currentPrice) / targetPrice) * 100).toFixed(1)

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title: '⚔️ WoW Auction Sniper Alert',
          description: `**${itemName}** is below your target price!`,
          color: 0xc8a84b,
          fields: [
            { name: 'Current Price', value: formatGold(currentPrice), inline: true },
            { name: 'Target Price', value: formatGold(targetPrice), inline: true },
            { name: 'Savings', value: `${margin}% below target`, inline: true },
          ],
          footer: { text: 'WoW Auction Sniper • wowsniper.app' },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })
}

async function checkAlerts(): Promise<void> {
  console.log('[alertChecker] Checking watchlist alerts...')

  const activeWatchlists = await prisma.watchlist.findMany({
    where: { isActive: true },
    include: {
      item: true,
      user: true,
      realm: true,
    },
  })

  console.log(`[alertChecker] Found ${activeWatchlists.length} active watchlist entries`)

  let alertsFired = 0

  for (const watchlist of activeWatchlists) {
    try {
      // Get the latest snapshot for this item (on the specific realm if set)
      const snapshotWhere = watchlist.realmId
        ? { realmId: watchlist.realmId, itemId: watchlist.itemId }
        : { itemId: watchlist.itemId }

      const latestSnapshot = await prisma.auctionSnapshot.findFirst({
        where: snapshotWhere,
        orderBy: { timestamp: 'desc' },
      })

      if (!latestSnapshot) continue

      const currentPrice = Number(latestSnapshot.minBuyout)
      const targetPrice = Number(watchlist.targetPrice)

      // Only trigger if current price is below target
      if (currentPrice >= targetPrice) continue

      // Check if we've already sent an alert in the last hour
      const recentAlert = await prisma.alert.findFirst({
        where: {
          watchlistId: watchlist.id,
          triggeredAt: { gte: new Date(Date.now() - ONE_HOUR_MS) },
        },
        orderBy: { triggeredAt: 'desc' },
      })

      if (recentAlert) {
        console.log(`[alertChecker] Skipping ${watchlist.item.name} — alert already sent recently`)
        continue
      }

      // Create the alert record
      const alert = await prisma.alert.create({
        data: {
          userId: watchlist.userId,
          watchlistId: watchlist.id,
          itemId: watchlist.itemId,
          currentPrice: latestSnapshot.minBuyout,
          sentEmail: false,
          sentDiscord: false,
        },
      })

      let sentEmail = false
      let sentDiscord = false

      // Send email alert
      try {
        await sendSnipeAlert(watchlist.user.email, watchlist.item.name, currentPrice, targetPrice)
        sentEmail = true
        console.log(`[alertChecker] Email sent for ${watchlist.item.name} to ${watchlist.user.email}`)
      } catch (err) {
        console.error(`[alertChecker] Failed to send email for watchlist ${watchlist.id}:`, err)
      }

      // Send Discord webhook if configured (Gold Goblin tier)
      if (watchlist.user.discordWebhook && watchlist.user.tier === 'GOLD_GOBLIN') {
        try {
          await sendDiscordWebhook(watchlist.user.discordWebhook, watchlist.item.name, currentPrice, targetPrice)
          sentDiscord = true
          console.log(`[alertChecker] Discord webhook sent for ${watchlist.item.name}`)
        } catch (err) {
          console.error(`[alertChecker] Failed to send Discord webhook for watchlist ${watchlist.id}:`, err)
        }
      }

      // Update alert record with send status
      await prisma.alert.update({
        where: { id: alert.id },
        data: { sentEmail, sentDiscord },
      })

      alertsFired++
    } catch (err) {
      console.error(`[alertChecker] Error processing watchlist ${watchlist.id}:`, err)
    }
  }

  console.log(`[alertChecker] Fired ${alertsFired} alerts`)
}

export const alertCheckerWorker = new Worker(
  'alert-checking',
  async (_job: Job) => {
    await checkAlerts()
  },
  { connection }
)

alertCheckerWorker.on('completed', (job: Job) => {
  console.log(`[alertChecker] Job ${job.id} completed`)
})

alertCheckerWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[alertChecker] Job ${job?.id} failed:`, err.message)
})
