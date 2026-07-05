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

// Resolve tier from a Stripe price ID
const PRICE_TO_TIER: Record<string, { tier: string; cycle: string }> = {
  // Founding lifetime
  'price_1TprUNRxxgLHRQXXm7rt4uj3': { tier: 'solo',   cycle: 'lifetime' },
  'price_1TprT3RxxgLHRQXXsRbw3klW': { tier: 'studio', cycle: 'lifetime' },
  'price_1TprR2RxxgLHRQXXCrIvqMmd': { tier: 'agency', cycle: 'lifetime' },
  // Regular monthly
  'price_1Tpq2IRxxgLHRQXXLo32Vgki': { tier: 'solo',   cycle: 'monthly' },
  'price_1TprAcRxxgLHRQXXBvFtBZcf': { tier: 'studio', cycle: 'monthly' },
  'price_1TprEYRxxgLHRQXXG5w9OL5P': { tier: 'agency', cycle: 'monthly' },
  // Regular annual
  'price_1TpqpcRxxgLHRQXX8ahbX2Du': { tier: 'solo',   cycle: 'annual' },
  'price_1TprAcRxxgLHRQXXlNbRcVHH': { tier: 'studio', cycle: 'annual' },
  'price_1TprEYRxxgLHRQXXAH2Yf13A': { tier: 'agency', cycle: 'annual' },
}

function tierFromPriceId(priceId: string) {
  return PRICE_TO_TIER[priceId] ?? null
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const customer = await stripe.customers.retrieve(customerId)
  if (customer.deleted) return null
  return (customer as Stripe.Customer).metadata?.userId ?? null
}

async function logEvent(supabase: ReturnType<typeof getServiceClient>, userId: string, action: string, result: string) {
  await supabase.from('agent_logs').insert({ user_id: userId, agent: 'SYSTEM', action, result })
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

      // ─── Payment completed (subscription or one-off) ───────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, tier, billingCycle } = session.metadata || {}
        if (!userId || !tier) break

        await supabase.from('users').update({
          tier,
          billing_cycle: billingCycle || null,
          payment_status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string || null,
        }).eq('id', userId)

        await logEvent(supabase, userId, `Upgraded to ${tier} (${billingCycle})`, 'checkout.session.completed')
        break
      }

      // ─── Recurring invoice paid (renewal) ──────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break

        // Resolve tier from the first line item's price
        const priceId = invoice.lines?.data?.[0]?.price?.id
        const resolved = priceId ? tierFromPriceId(priceId) : null

        await supabase.from('users').update({
          payment_status: 'active',
          ...(resolved ? { tier: resolved.tier, billing_cycle: resolved.cycle } : {}),
        }).eq('id', userId)

        await logEvent(supabase, userId, 'Invoice paid', `Amount: £${((invoice.amount_paid || 0) / 100).toFixed(2)}`)
        break
      }

      // ─── Payment failed (card declined, expired, etc.) ─────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break

        const attemptCount = invoice.attempt_count || 1

        // After 3 failed attempts Stripe will cancel — we flag it here
        await supabase.from('users').update({
          payment_status: attemptCount >= 3 ? 'past_due_final' : 'past_due',
        }).eq('id', userId)

        await logEvent(supabase, userId, 'Payment failed', `Attempt ${attemptCount} — ${invoice.last_finalization_error?.message || 'card declined'}`)
        break
      }

      // ─── Subscription updated (upgrade, downgrade, renewal) ────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        const priceId = sub.items?.data?.[0]?.price?.id
        const resolved = priceId ? tierFromPriceId(priceId) : null

        const status = sub.status // active, past_due, canceled, unpaid, trialing
        const isPaused = sub.pause_collection != null

        await supabase.from('users').update({
          stripe_subscription_id: sub.id,
          payment_status: isPaused ? 'paused' : status,
          ...(resolved && status === 'active' ? { tier: resolved.tier, billing_cycle: resolved.cycle } : {}),
        }).eq('id', userId)

        await logEvent(supabase, userId, `Subscription ${status}`, resolved ? `${resolved.tier} ${resolved.cycle}` : sub.id)
        break
      }

      // ─── Subscription cancelled ────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        // Only downgrade to free if not a lifetime customer
        const { data: user } = await supabase.from('users').select('billing_cycle').eq('id', userId).single()
        if (user?.billing_cycle !== 'lifetime') {
          await supabase.from('users').update({
            tier: 'free',
            billing_cycle: null,
            stripe_subscription_id: null,
            payment_status: 'cancelled',
          }).eq('id', userId)
        }

        await logEvent(supabase, userId, 'Subscription cancelled', sub.cancellation_details?.reason || 'cancelled')
        break
      }

      // ─── Lifetime / one-off payment succeeded ──────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { userId, tier, billingCycle } = pi.metadata || {}
        if (!userId || !tier) break

        await supabase.from('users').update({
          tier,
          billing_cycle: billingCycle || 'lifetime',
          payment_status: 'active',
        }).eq('id', userId)

        await logEvent(supabase, userId, `Lifetime payment succeeded`, `${tier} — £${((pi.amount || 0) / 100).toFixed(2)}`)
        break
      }

      // ─── Payment intent failed ─────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { userId } = pi.metadata || {}
        if (!userId) break

        await logEvent(supabase, userId, 'Payment failed', pi.last_payment_error?.message || 'unknown error')
        break
      }

      // ─── Trial ending soon (3 days before) ────────────────────────────────
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        await logEvent(supabase, userId, 'Trial ending soon', 'Trial ends in 3 days')
        break
      }

      // ─── Charge disputed ──────────────────────────────────────────────────
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const charge = await stripe.charges.retrieve(dispute.charge as string)
        if (!charge.customer) break
        const userId = await getUserIdFromCustomer(charge.customer as string)
        if (!userId) break

        await supabase.from('users').update({ payment_status: 'disputed' }).eq('id', userId)
        await logEvent(supabase, userId, 'Chargeback raised', `Amount: £${((dispute.amount || 0) / 100).toFixed(2)}`)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Return 200 to prevent Stripe retrying — log the error instead
    return NextResponse.json({ received: true, error: 'Processing error logged' })
  }

  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic'
