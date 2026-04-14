import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const sub = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { id: 'desc' },
  })

  if (!sub) {
    // No subscription found — send to pricing
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  const origin = new URL(req.url).origin
  const url = await createPortalSession(sub.stripeCustomerId, `${origin}/settings`)
  return NextResponse.redirect(url)
}
