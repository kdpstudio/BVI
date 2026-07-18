import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ agent: string }> }) {
  try {
    const { agent } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('agent_chats')
      .delete()
      .eq('user_id', user.id)
      .eq('agent', agent.toUpperCase())

    if (error) throw error
    return NextResponse.json({ cleared: true })
  } catch {
    return NextResponse.json({ error: 'Failed to clear chat' }, { status: 500 })
  }
}
