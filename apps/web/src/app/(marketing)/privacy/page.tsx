import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl space-y-8 bg-slate-950 text-slate-300">
      <div className="space-y-3 border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: July 13, 2026</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
          <p className="leading-relaxed">
            We collect information you provide directly to us when creating an account, editing
            documents, or uploading media assets. This includes your name, email address, password
            hashes managed by our authentication system (Clerk), and workspace settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. How We Use Information</h2>
          <p className="leading-relaxed">
            We use the information we collect to operate, maintain, and improve the Pikzee platform.
            Specifically, we use it to manage user authentication, configure workspaces, and
            coordinate asset delivery/scheduling to integrated social platforms (YouTube, Twitter/X,
            and LinkedIn).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. Information Sharing and Disclosure</h2>
          <p className="leading-relaxed">
            We do not share your personal information with third parties except as necessary to
            provide the Service. We share data with our secure hosting providers (AWS/Vercel),
            identity providers (Clerk), and API integrations when you explicitly authorize
            publishing to social platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Cookies and Tracking</h2>
          <p className="leading-relaxed">
            We use functional session cookies to verify logged-in states, store UI preferences (like
            active dark mode themes), and prevent security vulnerabilities. You can disable cookies
            in your browser settings, but some features of Pikzee may fail to function correctly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Data Security</h2>
          <p className="leading-relaxed">
            We employ industry-standard security protocols to safeguard your personal data and
            assets. All user data, databases, and assets are encrypted in transit and at rest using
            modern secure encryption.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">6. Your Rights &amp; Contact</h2>
          <p className="leading-relaxed">
            Depending on your location, you may have legal rights to access, delete, or modify the
            personal information we store about you. For any inquiries regarding your privacy
            settings, please contact our support channel.
          </p>
        </section>
      </div>
    </div>
  )
}
