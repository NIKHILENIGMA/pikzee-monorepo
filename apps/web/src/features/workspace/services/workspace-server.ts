'use server'

import { auth } from '@clerk/nextjs/server'

interface Workspace {
  id: string
  name: string
  slug: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/**
 * Reusable server-side fetch to get the current user's workspaces.
 * Can be imported and called inside any Next.js Server Component or Layout.
 */
export async function getMyWorkspaces(): Promise<Workspace[]> {
  const { userId, getToken } = await auth()

  if (!userId) {
    return []
  }

  try {
    const token = await getToken()
    const res = await fetch(`${API_URL}/workspace/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 }, // Prevent caching to ensure fresh DB checks
    })

    if (!res.ok) {
      console.warn(`[Workspace Service] Fetch failed with status: ${res.status}`)
      return []
    }

    return await res.json()
  } catch (error) {
    console.error('[Workspace Service] Failed to retrieve workspaces:', error)
    return []
  }
}
