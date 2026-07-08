'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { CyberInput } from '@/components/ui/cyber-input'
import { CyberButton } from '@/components/ui/cyber-button'
import { signUp, SignUpResult } from '@/lib/supabase/auth'

const CURRENCIES: Record<string, string> = { UK: 'GBP', US: 'USD', CA: 'CAD' }

const BUSINESS_TYPES = [
  'Freelancer', 'Agency', 'Consultant', 'Designer', 'Developer',
  'Copywriter', 'Photographer', 'Video Producer', 'Marketing', 'Other'
]

const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
  country: z.enum(['UK', 'US', 'CA']),
  city: z.string().min(2, 'City required'),
  business_name: z.string().min(2, 'Business name required'),
  business_type: z.string().min(1, 'Business type required'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState('')
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { country: 'UK' },
  })

  const selectedCountry = watch('country')

  async function onSubmit(data: SignupForm) {
    setLoading(true)
    const currency = CURRENCIES[data.country]
    const result = await signUp({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      country: data.country,
      currency,
      city: data.city,
      business_name: data.business_name,
      business_type: data.business_type,
    }) as SignUpResult
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    if (result.needsEmailConfirm) {
      setCheckEmail(data.email)
      setLoading(false)
      return
    }
    toast.success('Account activated. Welcome to BVI.')
    router.push('/dashboard')
    router.refresh()
  }

  if (checkEmail) {
    return (
      <div className="bg-surface border border-cyan/30 p-8 shadow-[0_0_20px_rgba(0,200,255,0.1)] text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="font-orbitron text-xl text-cyan mb-2">CHECK YOUR EMAIL</h2>
        <p className="text-textMuted font-rajdhani text-sm mb-1">Confirmation sent to:</p>
        <p className="text-text font-mono-tech text-sm mb-4">{checkEmail}</p>
        <p className="text-textMuted font-rajdhani text-xs">Click the link in the email to activate your account and access BVI.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-purple" />
      <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-purple" />
      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-purple" />
      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-purple" />

      <div className="bg-surface border border-border p-8 shadow-[0_0_20px_rgba(123,47,255,0.15)]">
        <div className="mb-6 text-center">
          <p className="text-purple text-xs font-orbitron uppercase tracking-[0.3em] mb-2">
            New Account
          </p>
          <h2 className="text-white text-2xl font-orbitron">INITIALIZE ACCOUNT</h2>
          <p className="text-textMuted text-sm mt-1 font-rajdhani">Join the intelligence network</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <CyberInput
            label="Full Name"
            placeholder="Your full name"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <CyberInput
            label="Email"
            type="email"
            placeholder="agent@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <CyberInput
            label="Password"
            showPasswordToggle
            placeholder="Min 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <CyberInput
            label="Confirm Password"
            showPasswordToggle
            placeholder="Repeat password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          {/* Country selector */}
          <div className="flex flex-col gap-1">
            <label className="text-cyan text-xs font-orbitron uppercase tracking-widest">Country</label>
            <select
              className="w-full px-4 py-3 bg-surface border border-border text-text font-rajdhani text-base outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,200,255,0.2)] transition-all appearance-none"
              {...register('country')}
            >
              <option value="UK">United Kingdom — GBP</option>
              <option value="US">United States — USD</option>
              <option value="CA">Canada — CAD</option>
            </select>
            <p className="text-textMuted text-xs font-rajdhani">
              Currency auto-set to: <span className="text-cyan">{CURRENCIES[selectedCountry] || 'GBP'}</span>
            </p>
          </div>

          <CyberInput
            label="City"
            placeholder="e.g. London, New York, Toronto"
            error={errors.city?.message}
            {...register('city')}
          />
          <p className="text-textMuted text-xs font-rajdhani -mt-2">Used for weather in your dashboard</p>

          <CyberInput
            label="Business Name"
            placeholder="Your business or trading name"
            error={errors.business_name?.message}
            {...register('business_name')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-cyan text-xs font-orbitron uppercase tracking-widest">Business Type</label>
            <select
              className="w-full px-4 py-3 bg-surface border border-border text-text font-rajdhani text-base outline-none focus:border-cyan focus:shadow-[0_0_10px_rgba(0,200,255,0.2)] transition-all appearance-none"
              {...register('business_type')}
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.business_type && (
              <p className="text-red text-xs font-rajdhani">{errors.business_type.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2 mt-2">
            <input type="checkbox" id="terms" required className="mt-1 accent-cyan" />
            <label htmlFor="terms" className="text-textMuted text-xs font-rajdhani leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="text-cyan hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" className="text-cyan hover:underline">Privacy Policy</Link>.
              I understand that BVI provides AI-generated information, not regulated financial or tax advice.
            </label>
          </div>

          <CyberButton type="submit" variant="purple" loading={loading} fullWidth className="mt-2">
            Activate Account
          </CyberButton>
        </form>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <Link href="/login" className="text-textMuted text-sm font-rajdhani hover:text-cyan transition-colors">
            Already have access? <span className="text-cyan">Sign in →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
