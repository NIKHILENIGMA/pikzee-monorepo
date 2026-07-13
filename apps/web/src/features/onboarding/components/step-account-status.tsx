import { useUser } from '@clerk/nextjs'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import React from 'react'

import { Button } from '@pikzee/ui'

interface StepAccountStatusProps {
  onNext: () => void
}

export function StepAccountStatus({ onNext }: StepAccountStatusProps) {
  const { user } = useUser()

  return (
    <div className="space-y-6 text-center py-4">
      <div className="flex justify-center">
        <div className="rounded-full bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 size={48} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Account Created!</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Welcome to Pikzee{user?.firstName ? `, ${user.firstName}` : ''}. Your account is ready.
          Let&apos;s set up your team workspace to get started.
        </p>
      </div>

      <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-3 text-left max-w-sm mx-auto space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Signed in as
        </div>
        <div className="text-sm text-slate-300 font-medium truncate">
          {user?.emailAddresses[0]?.emailAddress}
        </div>
      </div>

      <Button
        type="button"
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 group mt-2"
      >
        <span>Set up workspace</span>
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>
  )
}
