import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const code = Buffer.from(user.id).toString('base64').slice(0, 10).replace(/[^a-zA-Z0-9]/g, 'x')
    const { count } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', user.id)

    return NextResponse.json({ code, referrals: count || 0 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
