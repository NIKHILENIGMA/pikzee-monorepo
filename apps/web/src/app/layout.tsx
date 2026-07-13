import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import './global.css'

export const metadata = {
  title: 'Pikzee — Collaborative Workspace & Publishing',
  description: 'Write, collaborate, and publish to social channels in one unified workspace.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark bg-slate-950">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  )
}
