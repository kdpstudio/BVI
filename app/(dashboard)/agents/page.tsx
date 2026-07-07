import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AgentCard } from '@/components/agents/agent-card'
import { Agent, Tier } from '@/types'

const AGENTS: Agent[] = ['FINN', 'SAGE', 'ARIA', 'MAX', 'REX']

export default async function AgentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('users').select('tier').eq('id', user.id).single()
  const tier = (profile?.tier || 'free') as Tier

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-orbitron text-2xl text-text mb-2">AGENT ROSTER</h1>
        <p className="text-textMuted font-rajdhani">Your AI team, ready to deploy</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {AGENTS.map(agent => (
          <AgentCard key={agent} agent={agent} tier={tier} />
        ))}
      </div>
    </div>
  )
}
