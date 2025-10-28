'use client'

import { createClient } from '@/lib/supabase/client'
import { Github } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error logging in:', error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to Nano Banana
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in quickly with your GitHub account
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGitHubLogin}
            className="group relative flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}