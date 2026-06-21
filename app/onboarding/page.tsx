'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CyberButton } from '@/components/ui/cyber-button'
import { CyberInput } from '@/components/ui/cyber-input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Step = 1 | 2 | 3

const COUNTRIES = [
  { value: 'UK', label: '🇬🇧 United Kingdom', currency: 'GBP' },
  { value: 'US', label: '🇺🇸 United States', currency: 'USD' },
  { value: 'CA', label: '🇨🇦 Canada', currency: 'CAD' },
]

const BUSINESS_TYPES = ['Freelancer', 'Consultant', 'Agency', 'Designer', 'Developer', 'Writer', 'Photographer', 'Other']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', business_name: '', business_type: 'Freelancer', country: 'UK', currency: 'GBP', city: '' })

  function set(key: string, value: string) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function handleComplete() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('users').update({ ...form, onboarded: true }).eq('id', user.id)
      if (error) throw error
      toast.success('Welcome to BVI!')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {([1, 2, 3] as Step[]).map(s => (
            <div key={s} className={`flex-1 h-0.5 transition-colors ${s <= step ? 'bg-cyan' : 'bg-border'}`} />
          ))}
        </div>

        <div className="mb-8">
          <h1 className="font-orbitron text-xl text-text mb-2">
            {step === 1 && 'WHO ARE YOU?'}
            {step === 2 && 'YOUR BUSINESS'}
            {step === 3 && 'YOUR LOCATION'}
          </h1>
          <p className="text-textMuted font-rajdhani text-sm">
            {step === 1 && 'Tell BVI about yourself so your agents can personalise their advice.'}
            {step === 2 && 'Help FINN, SAGE, and REX understand your business context.'}
            {step === 3 && "Set your country so SAGE gives you the right tax guidance."}
          </p>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <CyberInput label="Full Name" placeholder="Jane Smith" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            <CyberInput label="City (optional)" placeholder="London" value={form.city} onChange={e => set('city', e.target.value)} />
            <CyberButton onClick={() => setStep(2)} disabled={!form.full_name.trim()}>NEXT →</CyberButton>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <CyberInput label="Business / Trading Name" placeholder="Smith Studio" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
            <div>
              <label className="text-cyan text-xs font-orbitron uppercase tracking-widest block mb-1">Business Type</label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_TYPES.map(t => (
                  <button key={t} onClick={() => set('business_type', t)} className={`px-3 py-1.5 font-rajdhani text-xs transition-colors ${form.business_type === t ? 'bg-cyan text-background' : 'border border-border text-textMuted hover:border-cyan/40'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <CyberButton variant="ghost" onClick={() => setStep(1)}>← BACK</CyberButton>
              <CyberButton onClick={() => setStep(3)}>NEXT →</CyberButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-cyan text-xs font-orbitron uppercase tracking-widest block mb-2">Country</label>
              <div className="flex flex-col gap-2">
                {COUNTRIES.map(c => (
                  <button key={c.value} onClick={() => { set('country', c.value); set('currency', c.currency) }} className={`flex items-center gap-3 px-4 py-3 border font-rajdhani text-sm transition-colors ${form.country === c.value ? 'border-cyan bg-cyan/5 text-cyan' : 'border-border text-textMuted hover:border-cyan/30'}`}>
                    <span className="text-lg">{c.label.split(' ')[0]}</span>
                    <span>{c.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-cyan/20 bg-cyan/5 p-3">
              <p className="text-cyan text-xs font-rajdhani">Your agents will use {form.country === 'UK' ? 'UK' : form.country === 'US' ? 'US' : 'Canadian'} tax rules and display amounts in {form.currency}.</p>
            </div>
            <div className="flex gap-3">
              <CyberButton variant="ghost" onClick={() => setStep(2)}>← BACK</CyberButton>
              <CyberButton onClick={handleComplete} loading={saving}>LAUNCH BVI →</CyberButton>
            </div>
          </div>
        )}

        <p className="text-textMuted text-xs font-rajdhani text-center mt-6">Step {step} of 3</p>
      </div>
    </div>
  )
}
