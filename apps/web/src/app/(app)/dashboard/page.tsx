import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { getMyWorkspaces } from '../../../features/workspace/services/workspace-server'

export default async function DashboardRouterPage() {
  const { userId } = await auth()

  // If the user is not authenticated, redirect to the home page
  if (!userId) {
    redirect('/')
  }
  // Fetch the user's workspaces from the server
  const workspaces = await getMyWorkspaces()

  // If the user has no workspaces, redirect to onboarding
  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding?redirect=true')
  }

  // If the user has workspaces, redirect to the first workspace's dashboard
  redirect(`/${workspaces[0].slug}/dashboard`)
}
