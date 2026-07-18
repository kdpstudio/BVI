import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function codeFromId(id: string) {
  return Buffer.from(id).toString('base64').slice(0, 10).replace(/[^a-zA-Z0-9]/g, 'x')
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: users } = await admin.from('users').select('id')
    const match = (users || []).find(u => codeFromId(u.id) === code)

    if (!match) return NextResponse.json({ userId: null })
    return NextResponse.json({ userId: match.id })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
