import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id, billing_cycle')
      .eq('id', user.id)
      .single()

    // Cancel Stripe subscription if active (not lifetime)
    if (profile?.stripe_subscription_id && profile?.billing_cycle !== 'lifetime') {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
      } catch {
        // Non-fatal — continue with deletion
      }
    }

    // Wipe user data using service role (bypasses RLS)
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await Promise.all([
      admin.from('transactions').delete().eq('user_id', user.id),
      admin.from('agent_chats').delete().eq('user_id', user.id),
      admin.from('agent_logs').delete().eq('user_id', user.id),
    ])

    await admin.from('users').delete().eq('id', user.id)
    await admin.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
