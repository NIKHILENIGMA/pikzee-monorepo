import React from 'react'

import { Navbar } from '../../features/marketing'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
