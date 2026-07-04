'use client'

import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import React, { useState } from 'react'

import { AuthDialog } from '../../auth'
import { LogoutButton } from '../../auth/components/logout-button'

export function Navbar() {
  const { isSignedIn } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white"
            >
              <span>Pikzee</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <Link href="/about" className="hover:text-white transition">
                About
              </Link>
              <Link href="/pricing" className="hover:text-white transition">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4 w-full">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
                >
                  Go to Dashboard
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuth('signin')}
                  className="text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 transition"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
    </>
  )
}
