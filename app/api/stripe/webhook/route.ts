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

async function logEvent(
  supabase: ReturnType<typeof getServiceClient>,
  userId: string,
  action: string,
  result: string
) {
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

      // ─── Checkout completed ────────────────────────────────────────────────
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

      // ─── Checkout abandoned / expired ─────────────────────────────────────
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, tier, billingCycle } = session.metadata || {}
        if (!userId) break
        await logEvent(supabase, userId, 'Checkout abandoned', `${tier} ${billingCycle} — session expired`)
        break
      }

      // ─── Invoice paid (renewal or first charge) ────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break

        const priceId = invoice.lines?.data?.[0]?.price?.id
        const resolved = priceId ? tierFromPriceId(priceId) : null

        await supabase.from('users').update({
          payment_status: 'active',
          ...(resolved ? { tier: resolved.tier, billing_cycle: resolved.cycle } : {}),
        }).eq('id', userId)

        await logEvent(supabase, userId, 'Invoice paid', `£${((invoice.amount_paid || 0) / 100).toFixed(2)}`)
        break
      }

      // ─── Invoice payment failed ────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break

        const attemptCount = invoice.attempt_count || 1
        await supabase.from('users').update({
          payment_status: attemptCount >= 3 ? 'past_due_final' : 'past_due',
        }).eq('id', userId)

        await logEvent(supabase, userId, 'Payment failed', `Attempt ${attemptCount} — ${invoice.last_finalization_error?.message || 'card declined'}`)
        break
      }

      // ─── Invoice finalization failed (address/tax ID issue) ───────────────
      case 'invoice.finalization_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break
        await logEvent(supabase, userId, 'Invoice finalization failed', invoice.last_finalization_error?.message || 'unknown error')
        break
      }

      // ─── Invoice marked uncollectible (Stripe gave up) ────────────────────
      case 'invoice.marked_uncollectible': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break

        const { data: user } = await supabase.from('users').select('billing_cycle').eq('id', userId).single()
        if (user?.billing_cycle !== 'lifetime') {
          await supabase.from('users').update({
            tier: 'free',
            billing_cycle: null,
            stripe_subscription_id: null,
            payment_status: 'uncollectible',
          }).eq('id', userId)
        }
        await logEvent(supabase, userId, 'Invoice uncollectible', 'Stripe gave up collecting — downgraded to free')
        break
      }

      // ─── Invoice voided ────────────────────────────────────────────────────
      case 'invoice.voided': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break
        await logEvent(supabase, userId, 'Invoice voided', `Invoice ${invoice.id} was voided`)
        break
      }

      // ─── Upcoming invoice (7 days before renewal) ─────────────────────────
      case 'invoice.upcoming': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.customer) break
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break
        await logEvent(supabase, userId, 'Renewal upcoming', `£${((invoice.amount_due || 0) / 100).toFixed(2)} due in 7 days`)
        break
      }

      // ─── Subscription updated ──────────────────────────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        const priceId = sub.items?.data?.[0]?.price?.id
        const resolved = priceId ? tierFromPriceId(priceId) : null
        const status = sub.status
        const isPaused = sub.pause_collection != null

        await supabase.from('users').update({
          stripe_subscription_id: sub.id,
          payment_status: isPaused ? 'paused' : status,
          ...(resolved && status === 'active' ? { tier: resolved.tier, billing_cycle: resolved.cycle } : {}),
        }).eq('id', userId)

        await logEvent(supabase, userId, `Subscription ${isPaused ? 'paused' : status}`, resolved ? `${resolved.tier} ${resolved.cycle}` : sub.id)
        break
      }

      // ─── Subscription cancelled ────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

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

      // ─── Trial ending in 3 days ────────────────────────────────────────────
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break
        await logEvent(supabase, userId, 'Trial ending soon', 'Trial ends in 3 days — charge incoming')
        break
      }

      // ─── Customer updated (email/card changed in billing portal) ──────────
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer
        const userId = customer.metadata?.userId
        if (!userId) break

        if (customer.email) {
          await supabase.from('users').update({ email: customer.email }).eq('id', userId)
        }
        await logEvent(supabase, userId, 'Customer profile updated', 'Email or billing details changed')
        break
      }

      // ─── Customer deleted from Stripe ──────────────────────────────────────
      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer
        const userId = customer.metadata?.userId
        if (!userId) break

        await supabase.from('users').update({
          tier: 'free',
          billing_cycle: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          payment_status: 'cancelled',
        }).eq('id', userId)

        await logEvent(supabase, userId, 'Stripe customer deleted', 'Customer record removed from Stripe')
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

        await logEvent(supabase, userId, 'Lifetime payment succeeded', `${tier} — £${((pi.amount || 0) / 100).toFixed(2)}`)
        break
      }

      // ─── One-off payment failed ────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const { userId } = pi.metadata || {}
        if (!userId) break
        await logEvent(supabase, userId, 'Payment failed', pi.last_payment_error?.message || 'unknown error')
        break
      }

      // ─── Card automatically updated by bank ───────────────────────────────
      case 'payment_method.automatically_updated': {
        const pm = event.data.object as Stripe.PaymentMethod
        if (!pm.customer) break
        const userId = await getUserIdFromCustomer(pm.customer as string)
        if (!userId) break
        await logEvent(supabase, userId, 'Payment method auto-updated', 'Card details updated by bank network')
        break
      }

      // ─── Charge disputed (chargeback raised) ──────────────────────────────
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const charge = await stripe.charges.retrieve(dispute.charge as string)
        if (!charge.customer) break
        const userId = await getUserIdFromCustomer(charge.customer as string)
        if (!userId) break

        await supabase.from('users').update({ payment_status: 'disputed' }).eq('id', userId)
        await logEvent(supabase, userId, 'Chargeback raised', `£${((dispute.amount || 0) / 100).toFixed(2)} — respond in Stripe before deadline`)
        break
      }

      // ─── Dispute resolved (won or lost) ───────────────────────────────────
      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute
        const charge = await stripe.charges.retrieve(dispute.charge as string)
        if (!charge.customer) break
        const userId = await getUserIdFromCustomer(charge.customer as string)
        if (!userId) break

        if (dispute.status === 'won') {
          // Dispute won — restore active status
          await supabase.from('users').update({ payment_status: 'active' }).eq('id', userId)
          await logEvent(supabase, userId, 'Dispute won', `£${((dispute.amount || 0) / 100).toFixed(2)} — access restored`)
        } else {
          // Dispute lost — keep downgraded (subscription.deleted will have fired)
          await supabase.from('users').update({ payment_status: 'dispute_lost' }).eq('id', userId)
          await logEvent(supabase, userId, 'Dispute lost', `£${((dispute.amount || 0) / 100).toFixed(2)} — chargeback accepted`)
        }
        break
      }

      // ─── Fraud warning (before chargeback arrives) ─────────────────────────
      case 'radar.early_fraud_warning.created': {
        const warning = event.data.object as Stripe.Radar.EarlyFraudWarning
        const charge = await stripe.charges.retrieve(warning.charge as string)
        if (!charge.customer) break
        const userId = await getUserIdFromCustomer(charge.customer as string)
        if (!userId) break

        await supabase.from('users').update({ payment_status: 'fraud_warning' }).eq('id', userId)
        await logEvent(supabase, userId, 'Fraud warning', `Stripe Radar flagged a charge — review before chargeback arrives`)
        break
      }

      // ─── Full refund ───────────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        if (!charge.customer) break
        const userId = await getUserIdFromCustomer(charge.customer as string)
        if (!userId) break

        const refundedAmount = charge.amount_refunded || 0
        const totalAmount = charge.amount || 0
        const isFullRefund = refundedAmount >= totalAmount

        if (isFullRefund) {
          const { data: user } = await supabase.from('users').select('billing_cycle').eq('id', userId).single()
          if (user?.billing_cycle === 'lifetime') {
            await supabase.from('users').update({
              tier: 'free',
              billing_cycle: null,
              stripe_subscription_id: null,
              payment_status: 'refunded',
            }).eq('id', userId)
          } else {
            await supabase.from('users').update({ payment_status: 'refunded' }).eq('id', userId)
          }
          await logEvent(supabase, userId, 'Full refund issued', `£${(refundedAmount / 100).toFixed(2)} — access revoked`)
        } else {
          await logEvent(supabase, userId, 'Partial refund issued', `£${(refundedAmount / 100).toFixed(2)} of £${(totalAmount / 100).toFixed(2)}`)
        }
        break
      }

      // ─── Refund failed ─────────────────────────────────────────────────────
      case 'refund.updated': {
        const refund = event.data.object as Stripe.Refund
        if (refund.status === 'failed' && refund.charge) {
          const charge = await stripe.charges.retrieve(refund.charge as string)
          if (!charge.customer) break
          const userId = await getUserIdFromCustomer(charge.customer as string)
          if (!userId) break
          await logEvent(supabase, userId, 'Refund failed', `£${((refund.amount || 0) / 100).toFixed(2)} — ${refund.failure_reason || 'unknown reason'}`)
        }
        break
      }

      // ─── Billing portal opened ─────────────────────────────────────────────
      case 'billing_portal.session.created': {
        const session = event.data.object as Stripe.BillingPortal.Session
        if (!session.customer) break
        const userId = await getUserIdFromCustomer(session.customer as string)
        if (!userId) break
        await logEvent(supabase, userId, 'Billing portal opened', 'User accessed billing portal')
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ received: true, error: 'Processing error logged' })
  }

  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic'
