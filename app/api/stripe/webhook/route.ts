import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, tier, billingCycle } = session.metadata || {}
        if (userId && tier) {
          await supabase.from('users').update({
            tier,
            billing_cycle: billingCycle,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string || null,
          }).eq('id', userId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(sub.customer as string)
        if ('metadata' in customer && customer.metadata.userId) {
          const tier = sub.metadata?.tier
          if (tier) {
            await supabase.from('users').update({ tier, stripe_subscription_id: sub.id }).eq('id', customer.metadata.userId)
          }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(sub.customer as string)
        if ('metadata' in customer && customer.metadata.userId) {
          await supabase.from('users').update({ tier: 'free', stripe_subscription_id: null }).eq('id', customer.metadata.userId)
        }
        break
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { userId, tier } = pi.metadata || {}
        if (userId && tier) {
          await supabase.from('users').update({ tier, billing_cycle: 'lifetime' }).eq('id', userId)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
  }

  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic'
