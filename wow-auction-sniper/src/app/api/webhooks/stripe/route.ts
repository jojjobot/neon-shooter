import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Required by Stripe — disable body parsing so we can verify the raw signature
export const config = { api: { bodyParser: false } }

function tierFromPriceId(priceId: string): 'FREE' | 'PRO' | 'GOLD_GOBLIN' {
  if (priceId === process.env.STRIPE_GOLD_PRICE_ID) return 'GOLD_GOBLIN'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO'
  return 'FREE'
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (!userId || !session.subscription || !session.customer) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = sub.items.data[0]?.price.id ?? ''
      const tier = tierFromPriceId(priceId)

      await prisma.user.update({ where: { id: userId }, data: { tier } })

      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: sub.id },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripePriceId: priceId,
          stripeSubscriptionId: sub.id,
          status: sub.status as Stripe.Subscription.Status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
        update: {
          status: sub.status as Stripe.Subscription.Status,
          stripePriceId: priceId,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0]?.price.id ?? ''
      const tier = tierFromPriceId(priceId)

      const dbSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      })
      if (!dbSub) break

      await Promise.all([
        prisma.user.update({ where: { id: dbSub.userId }, data: { tier } }),
        prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status as Stripe.Subscription.Status,
            stripePriceId: priceId,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        }),
      ])
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      const dbSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      })
      if (!dbSub) break

      await Promise.all([
        prisma.user.update({ where: { id: dbSub.userId }, data: { tier: 'FREE' } }),
        prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'canceled' },
        }),
      ])
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
