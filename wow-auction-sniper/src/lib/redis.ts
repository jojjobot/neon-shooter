import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

/**
 * Cache helper — returns cached value or computes + stores it.
 * @param key   Redis cache key
 * @param ttl   Time-to-live in seconds
 * @param fn    Async function to compute the value on cache miss
 */
export async function getOrCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch {
    // Redis miss or error — fall through to compute
  }

  const value = await fn()

  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch {
    // Ignore cache write errors
  }

  return value
}
