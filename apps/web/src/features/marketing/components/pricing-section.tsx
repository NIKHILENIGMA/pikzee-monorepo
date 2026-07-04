'use client'

import React from 'react'

export function PricingSection() {
  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="container mx-auto px-4 max-w-5xl text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-slate-400">Choose the plan that fits your workflow.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 space-y-6 text-left">
            <h3 className="text-xl font-bold">Free</h3>
            <p className="text-3xl font-bold">₹0</p>
            <p className="text-sm text-slate-400">Perfect for individuals getting started.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ 1 Workspace</li>
              <li>✓ 500 MB Storage</li>
              <li>✓ 10 AI edits/mo</li>
            </ul>
          </div>
          {/* Plus Plan */}
          <div className="rounded-lg border-2 border-indigo-500 bg-slate-900 p-8 space-y-6 text-left relative">
            <span className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              Popular
            </span>
            <h3 className="text-xl font-bold">Plus</h3>
            <p className="text-3xl font-bold">₹TBD</p>
            <p className="text-sm text-slate-400">Great for small teams and power users.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ 3 Workspaces</li>
              <li>✓ 10 GB Storage</li>
              <li>✓ 500 AI edits/mo</li>
              <li>✓ Twitter/X Publishing</li>
            </ul>
          </div>
          {/* Pro Plan */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 space-y-6 text-left">
            <h3 className="text-xl font-bold">Pro</h3>
            <p className="text-3xl font-bold">₹TBD</p>
            <p className="text-sm text-slate-400">For agencies and growing organizations.</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>✓ Unlimited Workspaces</li>
              <li>✓ 50 GB Storage</li>
              <li>✓ Unlimited AI edits/mo</li>
              <li>✓ All Social Publishing</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
