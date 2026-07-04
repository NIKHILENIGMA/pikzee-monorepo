import React from 'react'

import { LogoutButton } from '../../features/auth/components/logout-button'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 hidden md:block">
        <div className="text-lg font-bold tracking-tight text-white mb-6">Pikzee</div>
        <nav className="space-y-2 text-sm text-slate-400">
          <div className="px-2 py-1 font-semibold text-slate-500 uppercase tracking-wider text-xs">
            Workspaces
          </div>
          <div className="hover:text-white transition px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer bg-slate-800 text-white">
            Dashboard
          </div>
          <div className="hover:text-white transition px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer">
            Documents
          </div>
          <div className="hover:text-white transition px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer">
            Publishing
          </div>
          <LogoutButton />
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
