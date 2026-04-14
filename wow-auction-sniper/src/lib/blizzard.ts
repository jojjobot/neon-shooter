import { redis } from './redis'

const BLIZZARD_TOKEN_KEY = 'blizzard:access_token'
const AH_CACHE_TTL = 60 * 55 // 55 minutes

interface BlizzardToken {
  access_token: string
  expires_in: number
}

interface AuctionData {
  auctions?: Array<{
    id: number
    item: { id: number }
    buyout?: number
    unit_price?: number
    quantity: number
    time_left: string
  }>
}

/**
 * Obtains a Blizzard Battle.net OAuth access token using client credentials flow.
 * Token is cached in Redis.
 */
export async function getAccessToken(): Promise<string> {
  // Check Redis cache first
  const cached = await redis.get(BLIZZARD_TOKEN_KEY)
  if (cached) {
    return cached
  }

  const clientId = process.env.BLIZZARD_CLIENT_ID
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET must be set')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://oauth.battle.net/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Failed to get Blizzard access token: ${response.statusText}`)
  }

  const data = (await response.json()) as BlizzardToken

  // Cache token with expiry buffer (subtract 5 minutes for safety)
  const ttl = Math.max(data.expires_in - 300, 60)
  await redis.setex(BLIZZARD_TOKEN_KEY, ttl, data.access_token)

  return data.access_token
}

/**
 * Fetches commodity auction data from the Blizzard API.
 * Commodities are cross-realm and tracked separately from realm AH data.
 */
export async function getCommodityAuctions(region: string = 'us'): Promise<AuctionData> {
  const cacheKey = `blizzard:commodities:${region}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as AuctionData
  }

  const token = await getAccessToken()
  const namespace = `dynamic-${region}`
  const url = `https://${region}.api.blizzard.com/data/wow/auctions/commodities?namespace=${namespace}&locale=en_US`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch commodity auctions: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as AuctionData

  // Cache for 55 minutes
  await redis.setex(cacheKey, AH_CACHE_TTL, JSON.stringify(data))

  return data
}

/**
 * Fetches connected realm auction house data from the Blizzard API.
 * This covers non-commodity (equipment, craftables) listings for a specific realm cluster.
 */
export async function getConnectedRealmAuctions(
  connectedRealmId: number,
  region: string = 'us'
): Promise<AuctionData> {
  const cacheKey = `blizzard:realm:${region}:${connectedRealmId}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached) as AuctionData
  }

  const token = await getAccessToken()
  const namespace = `dynamic-${region}`
  const url = `https://${region}.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=${namespace}&locale=en_US`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch realm ${connectedRealmId} auctions: ${response.status} ${response.statusText}`
    )
  }

  const data = (await response.json()) as AuctionData

  // Cache for 55 minutes
  await redis.setex(cacheKey, AH_CACHE_TTL, JSON.stringify(data))

  return data
}
