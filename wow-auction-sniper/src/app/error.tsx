'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[WoW Sniper Error]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">💥</div>
      <h2 className="text-2xl font-bold text-wow-text mb-2">Something went wrong</h2>
      <p className="text-wow-muted text-sm mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred. The auction house is experiencing turbulence.'}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary px-5 py-2.5">
          Try Again
        </button>
        <a href="/" className="btn-secondary px-5 py-2.5">
          Go Home
        </a>
      </div>
    </div>
  )
}
