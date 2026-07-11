import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { type ReactNode } from 'react'

import { getMyWorkspaces } from '../../../features/workspace/services/workspace-server'

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  // Fetch the user's workspaces from the server
  const workspaces = await getMyWorkspaces()
  // If the user has no workspaces, redirect to onboarding
  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding?redirect=true')
  }

  // If the user has workspaces, check if the workspaceSlug exists
  const workspace = workspaces.find((ws) => ws.slug === workspaceSlug)
  // If the workspaceSlug does not exist, redirect to the first workspace's dashboard
  if (!workspace) {
    redirect(`/${workspaces[0].slug}/dashboard`)
  }

  // If the workspaceSlug exists, render the children
  return <>{children}</>
}
