'use client'

import { CircleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import type { CreateWorkspaceDto } from '@pikzee/shared-types'

import { useApiClient } from '../../../lib/api-client'

import { StepAccountStatus } from './step-account-status'
import { StepInviteMembers, type InviteRow } from './step-invite-members'
import { StepWorkspaceSetup } from './step-workspace-setup'

type Steps = 'first' | 'second' | 'third'

export function OnboardingWizard() {
  const [step, setStep] = useState<Steps>('first')
  const [workspaceData, setWorkspaceData] = useState<Partial<CreateWorkspaceDto>>({
    name: '',
    slug: '',
    logoUrl: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const router = useRouter()
  const apiClient = useApiClient()

  const handleNextStep1 = () => {
    setStep('second')
  }

  const handleNextStep2 = (data: CreateWorkspaceDto) => {
    setWorkspaceData(data)
    setStep('third')
  }

  const handleFinishSetup = async (invites: InviteRow[]) => {
    setLoading(true)
    setError('')

    try {
      // 1. Create workspace
      const createRes = await apiClient.post('/workspace/', workspaceData)
      const workspace = createRes.data

      // 2. Invite members if any
      if (invites.length > 0) {
        const emails = invites.map((i) => i.email)
        await apiClient.post(`/workspace/${workspace.id}/invitations`, {
          emails,
          role: invites[0].role,
        })
      }

      // 3. Redirect to dashboard
      router.push(`/${workspace.slug}/dashboard`)
    } catch (err) {
      console.error(err)
      let message = 'Failed to complete onboarding. Please try again.'
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message
        }
      }
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full border border-slate-800 bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 space-y-6 shadow-2xl">
      {/* Step Indicators */}
      <div className="flex justify-between items-center px-2">
        {['first', 'second', 'third'].map((num) => (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  step === num
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                    : step > num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                }`}
              >
                {num}
              </div>
              <span
                className={`text-xs font-medium ${step === num ? 'text-white' : 'text-slate-500'}`}
              >
                {num === 'first' ? 'Account' : num === 'second' ? 'Workspace' : 'Team'}
              </span>
            </div>
            {num < 'third' && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all ${
                  step > num ? 'bg-emerald-500/30' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="flex items-center rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400 gap-1.5">
          <CircleAlert size={15} />
          <p>{error}</p>
        </div>
      )}

      {/* Render Steps */}
      {step === 'first' && <StepAccountStatus onNext={handleNextStep1} />}
      {step === 'second' && (
        <StepWorkspaceSetup
          initialValues={workspaceData}
          onBack={() => setStep('first')}
          onNext={handleNextStep2}
        />
      )}
      {step === 'third' && (
        <StepInviteMembers
          loading={loading}
          onBack={() => setStep('second')}
          onNext={handleFinishSetup}
        />
      )}
    </div>
  )
}
