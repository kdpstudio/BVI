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

function getPriceId(tier: string, billingCycle: string): string | undefined {
  if (billingCycle === 'lifetime') return PRICE_IDS[`${tier}_lifetime`]?.lifetime
  return PRICE_IDS[tier]?.[billingCycle]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tier, billingCycle } = await request.json() as {
      tier: 'solo' | 'studio' | 'agency'
      billingCycle: 'monthly' | 'annual' | 'lifetime'
    }

    const priceId = getPriceId(tier, billingCycle)
    if (!priceId) return NextResponse.json({ error: 'Invalid tier or billing cycle' }, { status: 400 })

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
