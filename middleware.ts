import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// IP-based sliding window rate limiter for agent chat endpoints
const ipStore = new Map<string, { count: number; reset: number }>()
const CHAT_WINDOW_MS = 60_000
const CHAT_MAX_REQ = 30

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now()
  let entry = ipStore.get(ip)
  if (!entry || entry.reset < now) {
    entry = { count: 0, reset: now + CHAT_WINDOW_MS }
    ipStore.set(ip, entry)
  }
  entry.count++
  return entry.count <= CHAT_MAX_REQ
}

export async function middleware(request: NextRequest) {
  // Rate limit agent chat routes by IP
  if (request.method === 'POST' && /^\/api\/agents\/[^/]+\/chat$/.test(request.nextUrl.pathname)) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown'
    if (!checkIpRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/agents', '/finance', '/tax', '/growth', '/documents', '/settings', '/analytics', '/clients', '/invoice']
  const authRoutes = ['/login', '/signup']

  const pathname = request.nextUrl.pathname
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // Check if onboarded — redirect to onboarding if not
    const { data: profile } = await supabase.from('users').select('onboarded').eq('id', user.id).single()
    const url = request.nextUrl.clone()
    url.pathname = profile?.onboarded ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users from onboarding if already onboarded
  if (pathname.startsWith('/onboarding') && user) {
    const { data: profile } = await supabase.from('users').select('onboarded').eq('id', user.id).single()
    if (profile?.onboarded) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  if (!user && pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
