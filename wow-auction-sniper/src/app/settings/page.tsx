import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/SettingsForm'

export const metadata = {
  title: 'Settings — WoW Auction Sniper',
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  const tier = dbUser?.tier ?? 'FREE'

  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { id: 'desc' },
  })

  const tierLabel =
    tier === 'GOLD_GOBLIN' ? '🏆 Gold Goblin'
    : tier === 'PRO' ? '⭐ Pro'
    : '🆓 Free'
  const tierBadge =
    tier === 'GOLD_GOBLIN' ? 'badge-gold'
    : tier === 'PRO' ? 'badge-blue'
    : 'badge-green'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-wow-text mb-8">⚙️ Settings</h1>

      {/* Account */}
      <div className="wow-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-wow-text mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-wow-muted">Email</span>
            <span className="text-wow-text">
              {user?.emailAddresses?.[0]?.emailAddress ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-wow-border">
            <span className="text-wow-muted">Plan</span>
            <span className={`badge ${tierBadge}`}>{tierLabel}</span>
          </div>
          {tier === 'FREE' && (
            <div className="pt-2">
              <Link href="/pricing" className="btn-primary text-sm px-4 py-2">
                Upgrade Plan →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Billing */}
      {activeSub && (
        <div className="wow-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-wow-text mb-2">Billing</h2>
          <p className="text-sm text-wow-muted mb-4">
            Manage your subscription, update payment method, or view invoices.
          </p>
          <div className="flex items-center gap-3">
            <a href="/api/billing-portal" className="btn-secondary text-sm px-4 py-2">
              Open Billing Portal →
            </a>
            <span className="text-xs text-wow-muted">
              Next renewal:{' '}
              {activeSub.currentPeriodEnd.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      {/* Notifications + API key (client form handles tier gating internally) */}
      <SettingsForm
        tier={tier}
        discordWebhook={dbUser?.discordWebhook ?? ''}
        apiKey={(dbUser as any)?.apiKey ?? null}
      />

      {/* Danger zone */}
      <div className="wow-card p-6 border-wow-red/30">
        <h2 className="text-lg font-semibold text-wow-red mb-2">Danger Zone</h2>
        <p className="text-sm text-wow-muted mb-4">
          To delete your account and all data, please contact{' '}
          <a href="mailto:support@wowsniper.gg" className="text-wow-gold hover:underline">
            support@wowsniper.gg
          </a>
          .
        </p>
      </div>
    </div>
  )
}
