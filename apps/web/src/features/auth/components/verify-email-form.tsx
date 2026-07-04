'use client'

import { useVerifyEmailForm } from '../hooks/use-verify-email-form'

interface VerifyEmailFormProps {
  email: string
  onSuccess: () => void
  onBackToSignUp: () => void
}

export function VerifyEmailForm({ email, onSuccess, onBackToSignUp }: VerifyEmailFormProps) {
  const { code, setCode, handleSubmit, error, loading } = useVerifyEmailForm({ onSuccess })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-slate-400 mt-1">We sent a 6-digit code to {email}</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-center text-lg font-bold tracking-widest text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-55"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="text-center text-sm text-slate-400">
        Didn&apos;t receive code?{' '}
        <button
          onClick={onBackToSignUp}
          className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
