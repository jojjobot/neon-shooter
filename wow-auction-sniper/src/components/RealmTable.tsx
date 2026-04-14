'use client'
import { useState } from 'react'
import LastUpdated from './LastUpdated'

interface RealmStat {
  id: number
  name: string
  region: string
  totalAuctions: number
  totalQuantity: number
  avgDailyVolume: number
  lastSnapshotAt: Date | string | null
}

type SortKey = 'name' | 'totalAuctions' | 'totalQuantity' | 'avgDailyVolume'

interface Props {
  realms: RealmStat[]
}

export default function RealmTable({ realms }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('totalAuctions')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = [...realms].sort((a, b) => {
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
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
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
              <SortTh k="name" label="Realm" />
              <th>Region</th>
              <SortTh k="totalAuctions" label="Active Auctions" />
              <SortTh k="totalQuantity" label="Total Quantity" />
              <SortTh k="avgDailyVolume" label="Avg Daily Volume" />
              <th>Last Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const ts = r.lastSnapshotAt
              const tsStr = ts
                ? typeof ts === 'string'
                  ? ts
                  : (ts as Date).toISOString()
                : null

              return (
                <tr key={r.id}>
                  <td className="font-medium text-wow-gold">{r.name}</td>
                  <td>
                    <span className="badge badge-blue">{r.region}</span>
                  </td>
                  <td className="font-mono">{r.totalAuctions.toLocaleString()}</td>
                  <td className="font-mono text-wow-muted">
                    {r.totalQuantity.toLocaleString()}
                  </td>
                  <td className="font-mono text-wow-muted">
                    {r.avgDailyVolume.toLocaleString()}
                  </td>
                  <td>
                    {tsStr ? (
                      <LastUpdated timestamp={tsStr} compact />
                    ) : (
                      <span className="text-wow-muted text-xs">Never</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
