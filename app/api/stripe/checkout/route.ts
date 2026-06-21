import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getPrice, convertPrice } from '@/lib/pricing/config'
import { Currency } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tier, billingCycle, isFounding } = await request.json() as {
      tier: 'solo' | 'studio' | 'agency'
      billingCycle: 'monthly' | 'annual' | 'lifetime'
      isFounding: boolean
    }

    // Get user profile for currency
    const { data: profile } = await supabase.from('users').select('stripe_customer_id, currency, email').eq('id', user.id).single()
    const currency = (profile?.currency || 'GBP') as Currency

    // Create or retrieve Stripe customer
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const gbpAmount = getPrice(tier, billingCycle, isFounding)
    const amount = convertPrice(gbpAmount, currency)
    const currencyCode = currency.toLowerCase()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    let session: Stripe.Checkout.Session

    if (billingCycle === 'lifetime') {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        allow_promotion_codes: true,
        line_items: [{
          price_data: {
            currency: currencyCode,
            product_data: { name: `BVI ${tier.toUpperCase()} — Lifetime Access` },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }],
        metadata: { userId: user.id, tier, billingCycle, isFounding: String(isFounding) },
        success_url: `${baseUrl}/dashboard?upgraded=true`,
        cancel_url: `${baseUrl}/pricing`,
      })
    } else {
      const interval = billingCycle === 'annual' ? 'year' : 'month'
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        allow_promotion_codes: true,
        line_items: [{
          price_data: {
            currency: currencyCode,
            product_data: { name: `BVI ${tier.toUpperCase()} — ${billingCycle}` },
            recurring: { interval },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }],
        metadata: { userId: user.id, tier, billingCycle, isFounding: String(isFounding) },
        success_url: `${baseUrl}/dashboard?upgraded=true`,
        cancel_url: `${baseUrl}/pricing`,
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
