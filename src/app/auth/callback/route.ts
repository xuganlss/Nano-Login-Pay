import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          // For development, always use localhost instead of 0.0.0.0
          return NextResponse.redirect(`http://localhost:3000${next}`)
        } else {
          const forwardedHost = request.headers.get('x-forwarded-host')
          if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
          } else {
            return NextResponse.redirect(`${origin}${next}`)
          }
        }
      }
    } catch (exchangeError) {
      console.error('Auth exchange error:', exchangeError)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`http://localhost:3000/auth/auth-code-error`)
}