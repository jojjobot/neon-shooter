import { Queue } from 'bullmq'
import { ahPollerWorker } from './ahPoller'
import { alertCheckerWorker } from './alertChecker'

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 }

async function main() {
  console.log('Starting WoW Auction Sniper workers...')

  // Create queues
  const ahPollingQueue = new Queue('ah-polling', { connection })
  const alertQueue = new Queue('alert-checking', { connection })

  // Remove existing repeatable jobs to avoid duplicates on restart
  const existingAhJobs = await ahPollingQueue.getRepeatableJobs()
  for (const job of existingAhJobs) {
    await ahPollingQueue.removeRepeatableByKey(job.key)
  }

  const existingAlertJobs = await alertQueue.getRepeatableJobs()
  for (const job of existingAlertJobs) {
    await alertQueue.removeRepeatableByKey(job.key)
  }

  // Schedule commodity AH polling every 60 minutes
  await ahPollingQueue.add(
    'poll-commodities',
    {},
    {
      repeat: { pattern: '0 * * * *' },
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    }
  )

  // Schedule realm AH polling every 60 minutes (offset by 5 mins)
  await ahPollingQueue.add(
    'poll-realms',
    {},
    {
      repeat: { pattern: '5 * * * *' },
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    }
  )

  // Schedule alert checker every 15 minutes
  await alertQueue.add(
    'check-alerts',
    {},
    {
      repeat: { pattern: '*/15 * * * *' },
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    }
  )

  console.log('Workers scheduled:')
  console.log('  - AH Commodity Poller: every hour (cron: 0 * * * *)')
  console.log('  - AH Realm Poller:     every hour + 5min (cron: 5 * * * *)')
  console.log('  - Alert Checker:       every 15 minutes (cron: */15 * * * *)')

  // Run an immediate poll on startup
  await ahPollingQueue.add('poll-commodities', {}, { priority: 1 })
  await ahPollingQueue.add('poll-realms', {}, { priority: 2 })
  await alertQueue.add('check-alerts', {}, { priority: 1 })

  console.log('Workers started. Press Ctrl+C to stop.')

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down workers...')
    await ahPollerWorker.close()
    await alertCheckerWorker.close()
    await ahPollingQueue.close()
    await alertQueue.close()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('Shutting down workers...')
    await ahPollerWorker.close()
    await alertCheckerWorker.close()
    await ahPollingQueue.close()
    await alertQueue.close()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('Worker startup failed:', err)
  process.exit(1)
})
