'use client'

import { useState, useEffect } from 'react'
import { CyberButton } from '@/components/ui/cyber-button'
import { CyberInput } from '@/components/ui/cyber-input'
import { User, CreditCard, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type Tab = 'profile' | 'billing' | 'notifications' | 'security'

const TABS = [
  { id: 'profile' as Tab, label: 'Profile', icon: User },
  { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
  { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
  { id: 'security' as Tab, label: 'Security', icon: Shield },
]

const COUNTRIES = [
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'CA', label: '🇨🇦 Canada' },
]

interface Profile {
  full_name: string
  business_name: string
  business_type: string
  country: string
  currency: string
  city: string
  tier: string
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<Profile>({ full_name: '', business_name: '', business_type: '', country: 'UK', currency: 'GBP', city: '', tier: 'free' })
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({ weekly_report: true, tax_reminders: true, agent_updates: false, marketing: false })
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile({ full_name: data.full_name || '', business_name: data.business_name || '', business_type: data.business_type || '', country: data.country || 'UK', currency: data.currency || 'GBP', city: data.city || '', tier: data.tier || 'free' })
          if (data.notification_prefs) setNotifications(data.notification_prefs)
        }
      })
    })
    fetch('/api/referral').then(r => r.json()).then(d => { setReferralCode(d.code || ''); setReferralCount(d.referrals || 0) }).catch(() => null)
    fetch('/api/usage').then(r => r.json()).then(d => { if (!d.error) setUsage({ used: d.used, limit: d.limit }) }).catch(() => null)
  }, [])

  async function handleSaveProfile() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('users').update({ full_name: profile.full_name, business_name: profile.business_name, business_type: profile.business_type, country: profile.country, currency: profile.currency, city: profile.city }).eq('id', user.id)
      if (error) throw error
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTestReport() {
    setSendingTest(true)
    try {
      const res = await fetch('/api/email/weekly-report', { method: 'POST' })
      const data = await res.json()
      if (data.skipped) { toast.info('Weekly report is disabled — toggle it on first'); return }
      if (!res.ok) throw new Error()
      toast.success('Test report sent — check your inbox')
    } catch {
      toast.error('Failed to send test report')
    } finally {
      setSendingTest(false)
    }
  }

  async function handleSaveNotifications() {
    setSavingNotifications(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('users').update({ notification_prefs: notifications }).eq('id', user.id)
      if (error) throw error
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSavingNotifications(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      window.location.href = '/login'
    } catch {
      toast.error('Failed to delete account. Contact support.')
    } finally {
      setDeleting(false)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error('No portal URL')
    } catch {
      toast.error('Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div>
        <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-1">{'// VAULT CONFIGURATION'}</div>
        <div className="font-orbitron text-2xl text-text">
          SYSTEM <span className="text-cyan" style={{ textShadow: '0 0 10px rgba(0,200,255,0.4)' }}>SETTINGS</span>
        </div>
        <div className="font-mono-tech text-[9px] tracking-[2px] text-textMuted mt-1">
          {'// MANAGE YOUR ACCOUNT AND PREFERENCES'}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-cyan/15 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 font-orbitron text-[10px] uppercase tracking-[2px] transition-colors relative ${
              tab === t.id
                ? 'text-cyan border-b-2 border-cyan -mb-px'
                : 'text-textMuted hover:text-text'
            }`}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="relative bg-surface border border-cyan/20 p-5">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// PROFILE INFORMATION'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <CyberInput label="Full Name" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Jane Smith" />
            <CyberInput label="Business Name" value={profile.business_name} onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))} placeholder="Smith Studio" />
            <CyberInput label="Business Type" value={profile.business_type} onChange={e => setProfile(p => ({ ...p, business_type: e.target.value }))} placeholder="Freelancer" />
            <CyberInput label="City" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="London" />
          </div>
          <div className="mb-4">
            <label className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 block mb-2">{'// COUNTRY'}</label>
            <select
              value={profile.country}
              onChange={e => setProfile(p => ({ ...p, country: e.target.value, currency: e.target.value === 'UK' ? 'GBP' : e.target.value === 'US' ? 'USD' : 'CAD' }))}
              className="w-full px-4 py-3 bg-background border border-border text-text font-rajdhani text-sm outline-none focus:border-cyan transition-colors"
            >
              {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="mb-5">
            <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-2">{'// CURRENT TIER'}</div>
            <span className={`font-mono-tech text-[10px] px-3 py-1 border tracking-[2px] ${
              profile.tier === 'agency' ? 'text-yellow border-yellow/30 bg-yellow/5' :
              profile.tier === 'studio' ? 'text-purple border-purple/30 bg-purple/5' :
              profile.tier === 'solo' ? 'text-cyan border-cyan/30 bg-cyan/5' :
              'text-textMuted border-border'
            }`}>
              {profile.tier.toUpperCase()}
            </span>
          </div>
          <CyberButton onClick={handleSaveProfile} loading={saving}>SAVE CHANGES</CyberButton>
        </div>
      )}

      {/* Billing tab */}
      {tab === 'billing' && (
        <div className="flex flex-col gap-4">
          <div className="relative bg-surface border border-purple/20 p-5">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-purple/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-purple/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-purple/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-purple/40" />
            <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// SUBSCRIPTION'}</div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-orbitron text-text text-sm uppercase tracking-wider">{profile.tier} Plan</p>
                <p className="text-textMuted font-rajdhani text-xs mt-1">
                  {profile.tier === 'free' ? 'Upgrade to unlock all AI agents' : 'Full access to BVI platform'}
                </p>
              </div>
              <span className={`font-mono-tech text-[9px] px-2 py-0.5 border tracking-[2px] ${
                profile.tier !== 'free'
                  ? 'text-cyan border-cyan/30 bg-cyan/5'
                  : 'text-textMuted border-border'
              }`}>
                {profile.tier === 'free' ? 'FREE' : 'ACTIVE'}
              </span>
            </div>
            {profile.tier === 'free' ? (
              <CyberButton variant="cyan" onClick={() => window.location.href = '/pricing'}>UPGRADE PLAN</CyberButton>
            ) : (
              <CyberButton variant="ghost" onClick={handlePortal} loading={portalLoading}>MANAGE BILLING →</CyberButton>
            )}
          </div>

          {usage && (
            <div className="relative bg-surface border border-cyan/20 p-5">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
              <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// TODAY\'S USAGE'}</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-textMuted font-rajdhani text-sm">AI Messages</span>
                <span className="font-orbitron text-sm text-text">{usage.used} / {usage.limit}</span>
              </div>
              <div className="h-1.5 bg-border overflow-hidden mb-1">
                <div
                  className={`h-full transition-all ${usage.used >= usage.limit ? 'bg-red' : usage.used >= usage.limit * 0.8 ? 'bg-yellow' : 'bg-cyan'}`}
                  style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                />
              </div>
              <p className="text-textMuted font-rajdhani text-xs">Resets at midnight UTC. {profile.tier === 'free' && <a href="/pricing" className="text-cyan hover:opacity-80">Upgrade for more →</a>}</p>
            </div>
          )}

          <div className="relative bg-surface border border-cyan/20 p-5">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
            <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-3">{'// BILLING HISTORY'}</div>
            <p className="text-textMuted font-rajdhani text-sm">Access your invoices and payment history through the billing portal.</p>
            {profile.tier !== 'free' && (
              <button onClick={handlePortal} className="text-cyan text-xs font-orbitron mt-3 hover:opacity-80 transition-opacity tracking-wider">
                OPEN BILLING PORTAL →
              </button>
            )}
          </div>

          <div className="relative bg-surface border border-cyan/20 p-5">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
            <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-3">{'// REFERRAL PROGRAMME'}</div>
            <p className="text-textMuted font-rajdhani text-sm mb-4">Share BVI with other freelancers. You get 1 month free for every paying referral.</p>
            {referralCode && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-background border border-cyan/20 px-3 py-2 font-mono-tech text-xs text-cyan tracking-widest">
                  {typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referralCode}` : `/signup?ref=${referralCode}`}
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralCode}`); toast.success('Referral link copied') }}
                  className="font-orbitron text-[10px] text-cyan border border-cyan/30 px-3 py-2 hover:bg-cyan/10 transition-colors tracking-wider"
                >
                  COPY
                </button>
              </div>
            )}
            <p className="font-mono-tech text-[10px] text-textMuted tracking-[2px]">{referralCount} referral{referralCount !== 1 ? 's' : ''} so far</p>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div className="relative bg-surface border border-cyan/20 p-5">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
          <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// NOTIFICATION PREFERENCES'}</div>
          <div className="flex flex-col gap-4">
            {[
              { key: 'weekly_report', label: 'Weekly Financial Report', desc: 'Receive a summary every Monday' },
              { key: 'tax_reminders', label: 'Tax Deadline Reminders', desc: 'SAGE alerts before key dates' },
              { key: 'agent_updates', label: 'Agent Activity Updates', desc: 'Notifications when agents complete tasks' },
              { key: 'marketing', label: 'Product Updates & Tips', desc: 'New features and freelance tips' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-text font-rajdhani font-semibold text-sm">{label}</p>
                  <p className="text-textMuted font-rajdhani text-xs">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(p => ({ ...p, [key]: !p[key as keyof typeof notifications] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? 'bg-cyan' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <CyberButton onClick={handleSaveNotifications} loading={savingNotifications}>SAVE PREFERENCES</CyberButton>
            <CyberButton variant="ghost" onClick={handleSendTestReport} loading={sendingTest}>SEND TEST REPORT →</CyberButton>
          </div>
          <p className="text-textMuted font-rajdhani text-xs mt-3">Weekly reports send every Monday at 08:00 UTC. Tax reminders fire 30, 14, 7, and 3 days before each deadline.</p>
        </div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <div className="flex flex-col gap-4">
          <div className="relative bg-surface border border-cyan/20 p-5">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
            <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-4">{'// CHANGE PASSWORD'}</div>
            <div className="flex flex-col gap-3 mb-4">
              <CyberInput label="New Password" type="password" placeholder="Min 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} showPasswordToggle />
              <CyberInput label="Confirm Password" type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} showPasswordToggle />
            </div>
            <CyberButton onClick={handleChangePassword} loading={savingPassword}>UPDATE PASSWORD</CyberButton>
          </div>

          <div className="relative bg-surface border border-cyan/20 p-5">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
            <div className="font-mono-tech text-[10px] tracking-[3px] text-cyan/60 mb-3">{'// SESSIONS'}</div>
            <p className="text-textMuted font-rajdhani text-sm mb-4">You are currently signed in on this device.</p>
            <CyberButton variant="danger" onClick={async () => { const s = createClient(); await s.auth.signOut(); window.location.href = '/login' }}>
              SIGN OUT ALL DEVICES
            </CyberButton>
          </div>

          <div className="relative bg-surface border border-cyan/20 p-5">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan/40" />
            <div className="font-mono-tech text-[10px] tracking-[3px] text-red/60 mb-3">{'// DANGER ZONE'}</div>
            <p className="text-textMuted font-rajdhani text-sm mb-4">
              Permanently delete your account and all data. This cancels any active subscription and cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <label className="font-mono-tech text-[10px] tracking-[3px] text-red/60">
                TYPE <span className="text-red font-bold">DELETE</span> TO CONFIRM
              </label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="px-4 py-2.5 bg-background border border-red/30 text-text font-mono-tech text-sm outline-none focus:border-red/60 transition-colors tracking-widest w-48"
              />
              <CyberButton
                variant="danger"
                onClick={handleDeleteAccount}
                loading={deleting}
                disabled={deleteConfirm !== 'DELETE'}
              >
                DELETE MY ACCOUNT
              </CyberButton>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
