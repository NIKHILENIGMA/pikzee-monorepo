import React from 'react'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl space-y-8 bg-slate-950 text-slate-300">
      <div className="space-y-3 border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Terms of Service</h1>
        <p className="text-sm text-slate-500">Last updated: July 13, 2026</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing or using Pikzee (the &quot;Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Description of Service</h2>
          <p className="leading-relaxed">
            Pikzee is a monorepo platform providing asset management, document editing, and social
            media scheduling tools for teams and independent creators. We reserve the right to
            modify or discontinue any part of the Service at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. User Accounts &amp; Security</h2>
          <p className="leading-relaxed">
            To use certain features of the Service, you must register for an account using our
            secure third-party provider (Clerk). You are solely responsible for maintaining the
            confidentiality of your credentials and for all activities that occur under your
            account.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. User Content</h2>
          <p className="leading-relaxed">
            You retain ownership of any media, text, documents, or other assets you upload to the
            Service. By uploading assets, you grant Pikzee a worldwide, non-exclusive license to
            host and process your content solely to provide the services described.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Prohibited Conduct</h2>
          <p className="leading-relaxed">
            You agree not to use the Service for any unlawful purpose, to upload malicious code, or
            to publish content that violates third-party intellectual property rights. We reserve
            the right to terminate accounts that violate these rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">6. Limitation of Liability</h2>
          <p className="leading-relaxed">
            Pikzee is provided &quot;as is&quot; without warranties of any kind. Under no
            circumstances shall we be liable for any indirect, incidental, or consequential damages
            resulting from the use or inability to use the Service.
          </p>
        </section>
      </div>
    </div>
  )
}
