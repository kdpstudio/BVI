import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single()
    const name = profile?.full_name?.split(' ')[0] || 'there'

    await sendWelcomeEmail(user.email!, name)
    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}
