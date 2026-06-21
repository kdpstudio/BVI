import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single()
    if (!profile?.stripe_customer_id) return NextResponse.json({ error: 'No billing account found' }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch {
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
