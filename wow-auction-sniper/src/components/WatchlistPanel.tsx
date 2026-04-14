'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface WatchlistItem {
  id: number
  itemId: number
  itemName: string
  realmName: string
  targetPrice: number
  currentPrice: number | null
  status: 'watching' | 'triggered'
  createdAt: string
}

interface ItemOption {
  id: number
  name: string
}

interface RealmOption {
  id: number
  name: string
  region: string
}

interface Props {
  watchlist: WatchlistItem[]
  items: ItemOption[]
  realms: RealmOption[]
  tier: string
  watchlistLimit: number
  currentCount: number
}

function formatGold(copper: number): string {
  const g = Math.floor(copper / 10000)
  const s = Math.floor((copper % 10000) / 100)
  const c = copper % 100
  return `${g.toLocaleString()}g ${s}s ${c}c`
}

export default function WatchlistPanel({
  watchlist: initialList,
  items,
  realms,
  tier,
  watchlistLimit,
  currentCount,
}: Props) {
  const [watchlist, setWatchlist] = useState(initialList)
  const [showForm, setShowForm] = useState(false)
  const [itemSearch, setItemSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null)
  const [realmId, setRealmId] = useState('')
  const [targetGold, setTargetGold] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const canAdd =
    tier !== 'FREE' &&
    (watchlistLimit === Infinity || watchlist.length < watchlistLimit)

  const filteredItems = items
    .filter((i) => i.name.toLowerCase().includes(itemSearch.toLowerCase()))
    .slice(0, 15)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const resetForm = () => {
    setItemSearch('')
    setSelectedItem(null)
    setRealmId('')
    setTargetGold('')
    setError('')
    setShowDropdown(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) { setError('Please select an item from the list.'); return }
    if (!targetGold || isNaN(parseFloat(targetGold))) { setError('Enter a valid target price in gold.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          realmId: realmId ? parseInt(realmId) : null,
          targetPrice: Math.round(parseFloat(targetGold) * 10000),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to add item.')
      } else {
        setWatchlist((prev) => [data, ...prev])
        resetForm()
        setShowForm(false)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' })
    if (res.ok) setWatchlist((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="wow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-wow-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-wow-text">📌 Watchlist</h2>
          <p className="text-xs text-wow-muted mt-0.5">
            {watchlistLimit === Infinity
              ? `${watchlist.length} items tracked`
              : tier === 'FREE'
              ? 'Upgrade to track items'
              : `${watchlist.length} / ${watchlistLimit} items`}
          </p>
        </div>
        {tier === 'FREE' ? (
          <Link href="/pricing" className="btn-secondary text-xs px-3 py-1.5">
            Upgrade to Track →
          </Link>
        ) : (
          canAdd && (
            <button
              onClick={() => { setShowForm((v) => !v); if (showForm) resetForm() }}
              className="btn-primary text-xs px-3 py-1.5"
            >
              {showForm ? 'Cancel' : '+ Add Item'}
            </button>
          )
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="border-b border-wow-border bg-wow-dark/40 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Item search with dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs text-wow-muted mb-1">Item *</label>
              <input
                type="text"
                placeholder="Search items…"
                value={itemSearch}
                onChange={(e) => {
                  setItemSearch(e.target.value)
                  setSelectedItem(null)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-wow-card border border-wow-border rounded-md px-3 py-2 text-sm text-wow-text focus:outline-none focus:border-wow-gold"
              />
              {showDropdown && itemSearch && !selectedItem && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-wow-card border border-wow-border rounded-md shadow-xl max-h-48 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-wow-muted">No items found</div>
                  ) : (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm text-wow-text hover:bg-wow-gold/10 hover:text-wow-gold transition-colors"
                        onClick={() => {
                          setSelectedItem(item)
                          setItemSearch(item.name)
                          setShowDropdown(false)
                        }}
                      >
                        {item.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Realm */}
            <div>
              <label className="block text-xs text-wow-muted mb-1">Realm (optional)</label>
              <select
                value={realmId}
                onChange={(e) => setRealmId(e.target.value)}
                className="w-full bg-wow-card border border-wow-border rounded-md px-3 py-2 text-sm text-wow-text focus:outline-none focus:border-wow-gold"
              >
                <option value="">All Realms</option>
                {realms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.region} — {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Target price */}
            <div>
              <label className="block text-xs text-wow-muted mb-1">Target Price (gold) *</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 500"
                value={targetGold}
                onChange={(e) => setTargetGold(e.target.value)}
                className="w-full bg-wow-card border border-wow-border rounded-md px-3 py-2 text-sm text-wow-text focus:outline-none focus:border-wow-gold"
              />
            </div>
          </div>

          {error && <p className="mt-2 text-xs text-wow-red">{error}</p>}

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding…' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      )}

      {/* Limit warning */}
      {!canAdd && tier !== 'FREE' && (
        <div className="border-b border-wow-border px-5 py-3 bg-wow-gold/5 text-sm text-wow-muted flex items-center justify-between gap-3">
          <span>Watchlist limit reached ({watchlistLimit} items).</span>
          <Link href="/pricing" className="text-wow-gold hover:underline text-xs whitespace-nowrap">
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* Items */}
      {watchlist.length === 0 ? (
        <div className="p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-wow-muted">Your watchlist is empty.</p>
          {tier !== 'FREE' && (
            <p className="text-wow-muted text-sm mt-1">
              Click "+ Add Item" to start tracking prices.
            </p>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-wow-border">
          {watchlist.map((w) => (
            <li key={w.id} className="px-5 py-4 hover:bg-wow-gold/5 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/item/${w.itemId}`}
                      className="text-wow-gold font-medium hover:underline text-sm"
                    >
                      {w.itemName}
                    </Link>
                    <span
                      className={`badge text-xs ${
                        w.status === 'triggered' ? 'badge-green' : 'badge-blue'
                      }`}
                    >
                      {w.status === 'triggered' ? '🔔 Triggered' : '👁 Watching'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-wow-muted">
                    <span>Realm: {w.realmName}</span>
                    <span>
                      Target:{' '}
                      <span className="font-mono text-wow-gold">
                        {formatGold(w.targetPrice)}
                      </span>
                    </span>
                    {w.currentPrice !== null && (
                      <span>
                        Current:{' '}
                        <span
                          className={`font-mono ${
                            w.currentPrice <= w.targetPrice
                              ? 'text-wow-green'
                              : 'text-wow-muted'
                          }`}
                        >
                          {formatGold(w.currentPrice)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-wow-muted hover:text-wow-red transition-colors p-1 shrink-0"
                  aria-label="Remove from watchlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
