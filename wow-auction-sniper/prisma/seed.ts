import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const items = [
  { id: 172057, name: 'Shadowghast Ingot', category: 'Metal & Stone' },
  { id: 171828, name: 'Elethium Ore', category: 'Metal & Stone' },
  { id: 171829, name: 'Laestrite Ore', category: 'Metal & Stone' },
  { id: 171830, name: 'Solenium Ore', category: 'Metal & Stone' },
  { id: 171831, name: 'Oxxein Ore', category: 'Metal & Stone' },
  { id: 171832, name: 'Phaedrum Ore', category: 'Metal & Stone' },
  { id: 171833, name: 'Sinvyr Ore', category: 'Metal & Stone' },
  { id: 171834, name: 'Twilight Bark', category: 'Herb' },
  { id: 171840, name: 'Nightshade', category: 'Herb' },
  { id: 171841, name: 'Rising Glory', category: 'Herb' },
  { id: 171842, name: 'Marrowroot', category: 'Herb' },
  { id: 171843, name: 'Death Blossom', category: 'Herb' },
  { id: 171844, name: 'Widowbloom', category: 'Herb' },
  { id: 171845, name: "Vigil's Torch", category: 'Herb' },
  { id: 168586, name: 'Ores (generic)', category: 'Metal & Stone' },
  { id: 172054, name: 'Anima Crystal Fragment', category: 'Reagent' },
  { id: 172061, name: 'Shadowghast Ring', category: 'Jewelry' },
  { id: 187700, name: 'Rousing Fire', category: 'Elemental' },
  { id: 187701, name: 'Rousing Air', category: 'Elemental' },
  { id: 187702, name: 'Rousing Earth', category: 'Elemental' },
  { id: 187703, name: 'Rousing Frost', category: 'Elemental' },
  { id: 187704, name: 'Rousing Order', category: 'Elemental' },
  { id: 190311, name: 'Awakened Fire', category: 'Elemental' },
  { id: 190312, name: 'Awakened Air', category: 'Elemental' },
  { id: 190313, name: 'Awakened Earth', category: 'Elemental' },
  { id: 190314, name: 'Awakened Frost', category: 'Elemental' },
  { id: 190315, name: 'Awakened Order', category: 'Elemental' },
  { id: 194755, name: 'Flightstones', category: 'Currency' },
  { id: 204460, name: 'Resonance Crystals', category: 'Currency' },
  { id: 168185, name: "Zin'anthid", category: 'Herb' },
  { id: 152668, name: "Siren's Pollen", category: 'Herb' },
  { id: 152669, name: "Winter's Kiss", category: 'Herb' },
  { id: 152670, name: 'Anchor Weed', category: 'Herb' },
  { id: 152671, name: 'Sea Stalks', category: 'Herb' },
  { id: 152672, name: 'Riverbud', category: 'Herb' },
  { id: 152673, name: 'Star Moss', category: 'Herb' },
  { id: 124124, name: 'Foxflower', category: 'Herb' },
  { id: 124101, name: 'Felwort', category: 'Herb' },
  { id: 124102, name: 'Dreamleaf', category: 'Herb' },
  { id: 123918, name: 'Fjarnskaggl', category: 'Herb' },
  { id: 109128, name: 'Frostweed', category: 'Herb' },
  { id: 109129, name: 'Fireweed', category: 'Herb' },
  { id: 109130, name: 'Gorgrond Flytrap', category: 'Herb' },
  { id: 109131, name: 'Starflower', category: 'Herb' },
  { id: 109132, name: 'Nagrand Arrowbloom', category: 'Herb' },
  { id: 109133, name: 'Talador Orchid', category: 'Herb' },
  { id: 72238, name: 'Ghost Iron Ore', category: 'Metal & Stone' },
  { id: 89639, name: 'Kyparite', category: 'Metal & Stone' },
  { id: 72092, name: 'Windwool Cloth', category: 'Cloth' },
  { id: 23445, name: 'Netherweave Cloth', category: 'Cloth' },
]

const realms = [
  { id: 1, name: 'Stormrage', slug: 'stormrage', region: 'US', connectedRealmId: 1 },
  { id: 2, name: 'Area 52', slug: 'area-52', region: 'US', connectedRealmId: 2 },
  { id: 3, name: 'Illidan', slug: 'illidan', region: 'US', connectedRealmId: 3 },
  { id: 4, name: 'Ravencrest', slug: 'ravencrest', region: 'EU', connectedRealmId: 4 },
  { id: 5, name: 'Tarren Mill', slug: 'tarren-mill', region: 'EU', connectedRealmId: 5 },
]

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateOHLC(basePrice: number): { open: number; high: number; low: number; close: number; volume: number } {
  const volatility = 0.15
  const open = Math.floor(basePrice * (1 + (Math.random() - 0.5) * volatility))
  const close = Math.floor(basePrice * (1 + (Math.random() - 0.5) * volatility))
  const high = Math.floor(Math.max(open, close) * (1 + Math.random() * volatility * 0.5))
  const low = Math.floor(Math.min(open, close) * (1 - Math.random() * volatility * 0.5))
  const volume = randomBetween(100, 5000)
  return { open, high, low, close, volume }
}

// Base prices for items in copper (realistic WoW prices)
const basePrices: Record<number, number> = {
  172057: 250000,  // Shadowghast Ingot ~25g
  171828: 80000,   // Elethium Ore ~8g
  171829: 60000,   // Laestrite Ore ~6g
  171830: 75000,   // Solenium Ore ~7.5g
  171831: 90000,   // Oxxein Ore ~9g
  171832: 85000,   // Phaedrum Ore ~8.5g
  171833: 95000,   // Sinvyr Ore ~9.5g
  171834: 45000,   // Twilight Bark ~4.5g
  171840: 55000,   // Nightshade ~5.5g
  171841: 40000,   // Rising Glory ~4g
  171842: 50000,   // Marrowroot ~5g
  171843: 35000,   // Death Blossom ~3.5g
  171844: 48000,   // Widowbloom ~4.8g
  171845: 52000,   // Vigil's Torch ~5.2g
  168586: 70000,   // Ores generic ~7g
  172054: 30000,   // Anima Crystal Fragment ~3g
  172061: 500000,  // Shadowghast Ring ~50g
  187700: 200000,  // Rousing Fire ~20g
  187701: 220000,  // Rousing Air ~22g
  187702: 180000,  // Rousing Earth ~18g
  187703: 210000,  // Rousing Frost ~21g
  187704: 350000,  // Rousing Order ~35g
  190311: 1800000, // Awakened Fire ~180g
  190312: 2000000, // Awakened Air ~200g
  190313: 1600000, // Awakened Earth ~160g
  190314: 1900000, // Awakened Frost ~190g
  190315: 3200000, // Awakened Order ~320g
  194755: 150000,  // Flightstones ~15g
  204460: 120000,  // Resonance Crystals ~12g
  168185: 65000,   // Zin'anthid ~6.5g
  152668: 45000,   // Siren's Pollen ~4.5g
  152669: 48000,   // Winter's Kiss ~4.8g
  152670: 120000,  // Anchor Weed ~12g
  152671: 42000,   // Sea Stalks ~4.2g
  152672: 38000,   // Riverbud ~3.8g
  152673: 55000,   // Star Moss ~5.5g
  124124: 35000,   // Foxflower ~3.5g
  124101: 250000,  // Felwort ~25g
  124102: 32000,   // Dreamleaf ~3.2g
  123918: 40000,   // Fjarnskaggl ~4g
  109128: 25000,   // Frostweed ~2.5g
  109129: 28000,   // Fireweed ~2.8g
  109130: 80000,   // Gorgrond Flytrap ~8g
  109131: 30000,   // Starflower ~3g
  109132: 22000,   // Nagrand Arrowbloom ~2.2g
  109133: 20000,   // Talador Orchid ~2g
  72238: 15000,    // Ghost Iron Ore ~1.5g
  89639: 18000,    // Kyparite ~1.8g
  72092: 12000,    // Windwool Cloth ~1.2g
  23445: 8000,     // Netherweave Cloth ~0.8g
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.alert.deleteMany()
  await prisma.watchlist.deleteMany()
  await prisma.auctionSnapshot.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.item.deleteMany()
  await prisma.realm.deleteMany()

  // Seed items
  console.log('Seeding items...')
  for (const item of items) {
    await prisma.item.create({ data: item })
  }
  console.log(`Created ${items.length} items`)

  // Seed realms
  console.log('Seeding realms...')
  const now = new Date()
  for (const realm of realms) {
    await prisma.realm.create({
      data: {
        ...realm,
        isTracked: true,
        lastSnapshotAt: now,
      },
    })
  }
  console.log(`Created ${realms.length} realms`)

  // Seed 14-day price history
  console.log('Seeding price history...')
  let historyCount = 0
  for (const item of items) {
    const basePrice = basePrices[item.id] ?? 50000
    for (const realm of realms) {
      // Realms have slight price variations
      const realmMultiplier = 0.8 + Math.random() * 0.4
      const realmBasePrice = Math.floor(basePrice * realmMultiplier)

      for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
        const date = new Date(now)
        date.setDate(date.getDate() - daysAgo)
        date.setHours(0, 0, 0, 0)

        // Add a gentle trend
        const trendMultiplier = 1 + (daysAgo * 0.005 * (Math.random() > 0.5 ? 1 : -1))
        const dayBasePrice = Math.floor(realmBasePrice * trendMultiplier)
        const ohlc = generateOHLC(dayBasePrice)

        await prisma.priceHistory.create({
          data: {
            itemId: item.id,
            realmId: realm.id,
            date,
            open: BigInt(ohlc.open),
            high: BigInt(ohlc.high),
            low: BigInt(ohlc.low),
            close: BigInt(ohlc.close),
            volume: ohlc.volume,
          },
        })
        historyCount++
      }
    }
  }
  console.log(`Created ${historyCount} price history records`)

  // Seed latest auction snapshots
  console.log('Seeding auction snapshots...')
  let snapshotCount = 0
  for (const item of items) {
    const basePrice = basePrices[item.id] ?? 50000
    for (const realm of realms) {
      const realmMultiplier = 0.8 + Math.random() * 0.4
      const snapshotPrice = Math.floor(basePrice * realmMultiplier * (0.85 + Math.random() * 0.3))

      await prisma.auctionSnapshot.create({
        data: {
          realmId: realm.id,
          itemId: item.id,
          timestamp: now,
          minBuyout: BigInt(snapshotPrice),
          quantity: randomBetween(50, 2000),
          numAuctions: randomBetween(5, 200),
        },
      })
      snapshotCount++
    }
  }
  console.log(`Created ${snapshotCount} auction snapshots`)

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
