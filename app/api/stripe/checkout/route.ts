import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

// Stripe Price IDs
const PRICE_IDS: Record<string, Record<string, string>> = {
  // Founding member — lifetime only
  solo_lifetime:    { lifetime: 'price_1TprUNRxxgLHRQXXm7rt4uj3' },
  studio_lifetime:  { lifetime: 'price_1TprT3RxxgLHRQXXsRbw3klW' },
  agency_lifetime:  { lifetime: 'price_1TprR2RxxgLHRQXXCrIvqMmd' },
  // Regular subscriptions
  solo:   { monthly: 'price_1Tpq2IRxxgLHRQXXLo32Vgki', annual: 'price_1TpqpcRxxgLHRQXX8ahbX2Du' },
  studio: { monthly: 'price_1TprAcRxxgLHRQXXBvFtBZcf', annual: 'price_1TprAcRxxgLHRQXXlNbRcVHH' },
  agency: { monthly: 'price_1TprEYRxxgLHRQXXG5w9OL5P', annual: 'price_1TprEYRxxgLHRQXXAH2Yf13A' },
}

// Message Boost — one-time top-up of 100 messages, added to a persistent
// bonus pool consumed only after the user's daily plan cap is hit.
const BOOST_PRICE_ID = process.env.STRIPE_BOOST_PRICE_ID || 'price_boost_100_messages'
const BOOST_MESSAGE_COUNT = 100

// Recurring add-on subscriptions, billed separately from the main tier plan.
const ADDON_PRICE_IDS: Record<'branded_invoices' | 'recurring_invoices', string> = {
  branded_invoices: process.env.STRIPE_BRANDED_INVOICES_PRICE_ID || 'price_addon_branded_invoices',
  recurring_invoices: process.env.STRIPE_RECURRING_INVOICES_PRICE_ID || 'price_addon_recurring_invoices',
}

function getPriceId(tier: string, billingCycle: string): string | undefined {
  if (billingCycle === 'lifetime') return PRICE_IDS[`${tier}_lifetime`]?.lifetime
  return PRICE_IDS[tier]?.[billingCycle]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json() as {
      tier?: 'solo' | 'studio' | 'agency'
      billingCycle?: 'monthly' | 'annual' | 'lifetime'
      product?: 'boost' | 'branded_invoices' | 'recurring_invoices'
    }

    const { data: profile } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (body.product === 'boost') {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price: BOOST_PRICE_ID, quantity: 1 }],
        metadata: { userId: user.id, product: 'boost', messageCount: String(BOOST_MESSAGE_COUNT) },
        success_url: `${baseUrl}/agents?boosted=true`,
        cancel_url: `${baseUrl}/agents`,
      })
      return NextResponse.json({ url: session.url })
    }

    if (body.product === 'branded_invoices' || body.product === 'recurring_invoices') {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: ADDON_PRICE_IDS[body.product], quantity: 1 }],
        metadata: { userId: user.id, product: body.product },
        success_url: `${baseUrl}/invoice?addon=${body.product}`,
        cancel_url: `${baseUrl}/invoice`,
      })
      return NextResponse.json({ url: session.url })
    }

    const { tier, billingCycle } = body
    if (!tier || !billingCycle) return NextResponse.json({ error: 'Missing tier or billing cycle' }, { status: 400 })

    const priceId = getPriceId(tier, billingCycle)
    if (!priceId) return NextResponse.json({ error: 'Invalid tier or billing cycle' }, { status: 400 })

    const isLifetime = billingCycle === 'lifetime'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isLifetime ? 'payment' : 'subscription',
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user.id, tier, billingCycle },
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
