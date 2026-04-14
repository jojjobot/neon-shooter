'use client'
import { useState } from 'react'
import Link from 'next/link'
import LastUpdated from './LastUpdated'

interface FlipItem {
  itemId: number
  name: string
  category: string
  currentPrice: number
  avgPrice: number
  margin: number
  volume: number
  lastUpdated: string
  realmName: string
  realmId: number
}

type SortKey = 'name' | 'currentPrice' | 'avgPrice' | 'margin' | 'volume'

interface Props {
  flips: FlipItem[]
}

function formatGold(copper: number): string {
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  const c = copper % 100
  return `${g.toLocaleString()}g ${s}s ${c}c`
}

function getMarginColor(margin: number): string {
  if (margin >= 30) return 'text-green-400'
  if (margin >= 20) return 'text-wow-gold'
  return 'text-yellow-400'
}

export default function FlipFinderTable({ flips }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('margin')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = [...flips].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir === 'asc'
      ? (av as number) - (bv as number)
      : (bv as number) - (av as number)
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortTh = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="cursor-pointer select-none hover:text-wow-gold transition-colors"
      onClick={() => handleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === k && (
          <span className="text-wow-gold text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  )

  return (
    <div className="wow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="wow-table">
          <thead>
            <tr>
              <SortTh k="name" label="Item" />
              <th>Category</th>
              <th>Realm</th>
              <SortTh k="currentPrice" label="Current Price" />
              <SortTh k="avgPrice" label="14-Day Avg" />
              <SortTh k="margin" label="Margin" />
              <SortTh k="volume" label="Daily Vol." />
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((flip, i) => (
              <tr key={`${flip.itemId}-${flip.realmId}-${i}`}>
                <td>
                  <Link
                    href={`/item/${flip.itemId}`}
                    className="text-wow-gold hover:text-wow-gold-light font-medium hover:underline"
                  >
                    {flip.name}
                  </Link>
                </td>
                <td>
                  <span className="badge badge-blue">{flip.category}</span>
                </td>
                <td className="text-wow-muted">{flip.realmName}</td>
                <td>
                  <span className="font-mono text-wow-green">
                    {formatGold(flip.currentPrice)}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-wow-muted">
                    {formatGold(Math.round(flip.avgPrice))}
                  </span>
                </td>
                <td>
                  <span className={`font-bold ${getMarginColor(flip.margin)}`}>
                    +{flip.margin.toFixed(1)}%
                  </span>
                </td>
                <td className="text-wow-muted">
                  {Math.round(flip.volume / 14).toLocaleString()}
                </td>
                <td>
                  <LastUpdated timestamp={flip.lastUpdated} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
