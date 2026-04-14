import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WoW Auction Sniper — Track Prices & Find Flips',
  description:
    'Track World of Warcraft auction house prices, find profitable flips, and get snipe alerts when items drop below your target price.',
  keywords: ['World of Warcraft', 'WoW', 'Auction House', 'Gold', 'Price Tracker', 'Flip Finder'],
  openGraph: {
    title: 'WoW Auction Sniper',
    description: 'Track prices, find flips, dominate the Auction House',
    siteName: 'WoW Auction Sniper',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-wow-dark text-wow-text min-h-screen`}>
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-wow-border mt-20 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚔️</span>
                  <span className="text-wow-gold font-semibold">WoW Auction Sniper</span>
                </div>
                <p className="text-wow-muted text-sm text-center">
                  AH data updates every ~60 minutes. Not affiliated with Blizzard Entertainment.
                </p>
                <div className="flex gap-4 text-sm text-wow-muted">
                  <a href="/pricing" className="hover:text-wow-gold transition-colors">Pricing</a>
                  <a href="/market" className="hover:text-wow-gold transition-colors">Market</a>
                  <a href="/realms" className="hover:text-wow-gold transition-colors">Realms</a>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}
