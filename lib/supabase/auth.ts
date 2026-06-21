import { createClient } from './client'
import { ApiResponse, User } from '@/types'

export interface SignUpData {
  email: string
  password: string
  full_name: string
  country: string
  currency: string
  city: string
  business_name: string
  business_type: string
}

export async function signIn(email: string, password: string): Promise<ApiResponse<User>> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { data: data.user as unknown as User }
}

export async function signUp(formData: SignUpData): Promise<ApiResponse<User>> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.full_name,
        country: formData.country,
        currency: formData.currency,
        city: formData.city,
        business_name: formData.business_name,
        business_type: formData.business_type,
      }
    }
  })
  if (error) return { error: error.message }
  if (data.user) {
    // Update profile with all fields
    await supabase.from('users').upsert({
      id: data.user.id,
      email: formData.email,
      full_name: formData.full_name,
      country: formData.country,
      currency: formData.currency,
      city: formData.city,
      business_name: formData.business_name,
      business_type: formData.business_type,
    })
  }
  return { data: data.user as unknown as User }
}

export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/login'
}

export async function sendMagicLink(email: string): Promise<ApiResponse<void>> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` }
  })
  if (error) return { error: error.message }
  return { data: undefined }
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
