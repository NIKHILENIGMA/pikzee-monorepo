import React from 'react'

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-md py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create a new workspace</h1>
        <p className="text-sm text-slate-400 mt-1">
          To get started with Pikzee, create your first team workspace.
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Workspace Name</label>
          <input
            type="text"
            required
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Acme Corp"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          Create Workspace
        </button>
      </form>
    </div>
  )
}
