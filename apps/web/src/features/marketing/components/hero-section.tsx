'use client'

import React, { useState } from 'react'

import { AuthDialog } from '../../auth'

export function HeroSection() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-24 text-center bg-slate-950">
      <div className="container relative z-10 mx-auto max-w-4xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
          Real-time collaborative workspaces for teams
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl">
          Write documents, coordinate projects, and publish your content seamlessly—all in one place
          with real-time collaboration.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"
          >
            Get Started for Free
          </button>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode="signup" />
    </section>
  )
}
