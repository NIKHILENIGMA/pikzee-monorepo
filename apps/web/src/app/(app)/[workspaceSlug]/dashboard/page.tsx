import React from 'react'

export default async function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>
}) {
  const { workspaceSlug } = await params

  return (
    <div className="space-y-6 bg-slate-950 text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">
          Workspace: <span className="font-semibold text-indigo-400">{workspaceSlug}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-400">Total Documents</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-400">Collaborators</h3>
          <p className="text-3xl font-bold">1</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-400">Published Posts</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
