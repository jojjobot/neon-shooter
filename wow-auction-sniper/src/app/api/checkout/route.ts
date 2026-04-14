import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createCheckoutSession, STRIPE_PRO_PRICE_ID, STRIPE_GOLD_PRICE_ID } from '@/lib/stripe'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const { searchParams } = new URL(req.url)
  const plan = searchParams.get('plan')

  const priceId =
    plan === 'gold' ? STRIPE_GOLD_PRICE_ID
    : plan === 'pro' ? STRIPE_PRO_PRICE_ID
    : null

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  const origin = new URL(req.url).origin
  const url = await createCheckoutSession(
    userId,
    email,
    priceId,
    `${origin}/dashboard?upgraded=1`,
    `${origin}/pricing`,
  )

  return NextResponse.redirect(url)
}
