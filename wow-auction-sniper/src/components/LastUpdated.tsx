'use client'
import { useState, useEffect } from 'react'

interface Props {
  timestamp: string
  compact?: boolean
}

function timeAgo(ts: string): string {
  const diffSec = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

export default function LastUpdated({ timestamp, compact = false }: Props) {
  const [label, setLabel] = useState(() => timeAgo(timestamp))

  useEffect(() => {
    setLabel(timeAgo(timestamp))
    const id = setInterval(() => setLabel(timeAgo(timestamp)), 60_000)
    return () => clearInterval(id)
  }, [timestamp])

  if (compact) {
    return <span className="text-xs text-wow-muted">{label}</span>
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-wow-muted">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Last updated {label}</span>
    </div>
  )
}
