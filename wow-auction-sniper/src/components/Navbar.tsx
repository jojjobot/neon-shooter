'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useAuth } from '@clerk/nextjs'

export default function Navbar() {
  const pathname = usePathname()
  const { isSignedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/market', label: 'Market' },
    { href: '/realms', label: 'Realms' },
    { href: '/pricing', label: 'Pricing' },
    ...(isSignedIn ? [{ href: '/dashboard', label: 'Dashboard' }, { href: '/settings', label: 'Settings' }] : []),
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="sticky top-0 z-50 bg-wow-dark border-b border-wow-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">⚔️</span>
            <span className="text-wow-gold font-bold text-sm sm:text-base tracking-tight">
              WoW Auction Sniper
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? 'text-wow-gold'
                    : 'text-wow-muted hover:text-wow-text'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="hidden sm:block text-sm text-wow-muted hover:text-wow-gold transition-colors"
              >
                Sign in
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />

            {/* Mobile hamburger */}
            <button
              className="sm:hidden text-wow-muted hover:text-wow-text p-1 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-wow-border bg-wow-card">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block py-2 text-sm font-medium transition-colors ${
                  isActive(l.href) ? 'text-wow-gold' : 'text-wow-muted hover:text-wow-text'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="block py-2 text-sm text-wow-muted hover:text-wow-gold"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
