import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // TESTING: Completely disable all auth checks - allow anyone to access
  // const { data: { user } } = await supabase.auth.getUser()

  // if (request.nextUrl.pathname.startsWith('/admin')) {
  //   if (!user && request.nextUrl.pathname !== '/admin/login') {
  //     return NextResponse.redirect(new URL('/admin/login', request.url))
  //   }

  //   if (user && request.nextUrl.pathname === '/admin/login') {
  //     return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  //   }
  // }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
