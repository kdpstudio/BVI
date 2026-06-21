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
import { signIn, sendMagicLink } from '@/lib/supabase/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const magicSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type LoginForm = z.infer<typeof loginSchema>
type MagicForm = z.infer<typeof magicSchema>

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const { register: registerMagic, handleSubmit: handleMagicSubmit, formState: { errors: magicErrors }, getValues } = useForm<MagicForm>({
    resolver: zodResolver(magicSchema),
  })

  async function onSubmit(data: LoginForm) {
    setLoading(true)
    const result = await signIn(data.email, data.password)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    toast.success('Access granted. Welcome back.')
    router.push('/dashboard')
    router.refresh()
  }

  async function onMagicSubmit(data: MagicForm) {
    setLoading(true)
    const result = await sendMagicLink(data.email)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }
    setMagicSent(true)
    setLoading(false)
  }

  return (
    <div className="relative">
      {/* Corner brackets */}
      <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-cyan" />
      <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-cyan" />
      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-cyan" />
      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-cyan" />

      <div className="bg-surface border border-border p-8 shadow-[0_0_20px_rgba(0,200,255,0.15)]">
        <div className="mb-6 text-center">
          <p className="text-cyan text-xs font-orbitron uppercase tracking-[0.3em] mb-2">
            System Access
          </p>
          <h2 className="text-white text-2xl font-orbitron">BLACK VAULT INTELLIGENCE</h2>
          <p className="text-textMuted text-sm mt-1 font-rajdhani">Secure agent portal</p>
        </div>

        {mode === 'password' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <CyberButton type="submit" loading={loading} fullWidth className="mt-2">
              Authenticate
            </CyberButton>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className="text-textMuted text-sm font-rajdhani hover:text-cyan transition-colors text-center"
            >
              Send magic link instead
            </button>
          </form>
        )}

        {mode === 'magic' && !magicSent && (
          <form onSubmit={handleMagicSubmit(onMagicSubmit)} className="flex flex-col gap-4">
            <CyberInput
              label="Email"
              type="email"
              placeholder="agent@company.com"
              error={magicErrors.email?.message}
              {...registerMagic('email')}
            />
            <CyberButton type="submit" loading={loading} fullWidth className="mt-2">
              Send Magic Link
            </CyberButton>
            <button
              type="button"
              onClick={() => setMode('password')}
              className="text-textMuted text-sm font-rajdhani hover:text-cyan transition-colors text-center"
            >
              Use password instead
            </button>
          </form>
        )}

        {mode === 'magic' && magicSent && (
          <div className="text-center py-4">
            <p className="text-cyan font-orbitron text-sm mb-2">TRANSMISSION SENT</p>
            <p className="text-textMuted text-sm font-rajdhani">
              Access link transmitted to{' '}
              <span className="text-text">{getValues('email')}</span>
            </p>
            <button
              onClick={() => { setMode('password'); setMagicSent(false) }}
              className="text-textMuted text-xs mt-4 hover:text-cyan transition-colors"
            >
              Back to login
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center">
          <Link href="/signup" className="text-textMuted text-sm font-rajdhani hover:text-cyan transition-colors">
            No account? <span className="text-cyan">Initialize access →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
