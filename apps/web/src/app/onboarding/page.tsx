import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

import { OnboardingWizard } from '../../features/onboarding'
import { getMyWorkspaces } from '../../features/workspace/services/workspace-server'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  const { redirect: shouldRedirect } = await searchParams

  // 1. If redirected from signup, skip the API call and render the wizard immediately
  if (shouldRedirect === 'true') {
    return (
      <div className="flex w-full min-h-screen items-center justify-center py-12 px-4">
        <OnboardingWizard />
      </div>
    )
  }

  // 2. If the user is already authenticated, check if they have a workspace
  const workspace = await getMyWorkspaces()

  // 3. If the user has a workspace, redirect to the first workspace's dashboard
  if (workspace && workspace.length > 0) {
    redirect(`/${workspace[0].slug}/dashboard`)
  }

  // 4. If the user doesn't have a workspace or an error occurred, render the onboarding wizard
  return (
    <div className="flex w-full min-h-screen items-center justify-center py-12 px-4">
      <OnboardingWizard />
    </div>
  )
}
