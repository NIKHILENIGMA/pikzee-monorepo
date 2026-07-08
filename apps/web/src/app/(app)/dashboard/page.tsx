'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useApiClient } from '../../../lib/api-client'

export default function DashboardRouterPage() {
  const router = useRouter()
  const apiClient = useApiClient()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function checkWorkspaces() {
      try {
        const res = await apiClient.get('/workspace/mine')
        const workspaces = res.data

        if (workspaces && workspaces.length > 0) {
          // Redirect to the first workspace dashboard
          router.replace(`/${workspaces[0].slug}/dashboard`)
        } else {
          // No workspaces found, redirect to onboarding
          router.replace('/onboarding')
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err)
        setError('Failed to load workspaces. Redirecting to onboarding...')
        setTimeout(() => {
          router.replace('/onboarding')
        }, 2000)
      }
    }

    checkWorkspaces()
  }, [apiClient, router])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="text-sm text-slate-400 font-medium">{error || 'Loading your workspace...'}</p>
    </div>
  )
}
