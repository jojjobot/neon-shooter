import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">⚔️</div>
      <h1 className="text-5xl font-bold text-wow-gold mb-2">404</h1>
      <p className="text-wow-muted text-lg mb-2">This page was lost in the Auction House...</p>
      <p className="text-wow-muted text-sm mb-8">It may have been sniped, expired, or never listed.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary px-6 py-2.5">
          Return Home
        </Link>
        <Link href="/market" className="btn-secondary px-6 py-2.5">
          Browse Market
        </Link>
      </div>
    </div>
  )
}
