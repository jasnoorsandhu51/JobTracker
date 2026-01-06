"use client";

import Link from "next/link";
import GradientBackground from "./dashboard/GradientBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient Background */}
      <GradientBackground />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between relative">
          <div className="text-xl font-bold">
            Job<span className="text-purple-500">Tracker</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Track your career journey
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
              Your job search,
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                simplified
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Stay organized and in control. Track applications, manage interviews,
              and land your dream job with ease.
            </p>

            {/* CTA Buttons */}

            <div className="flex justify-center mb-16">
              <Link
                href="/login"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all hover:scale-105"
              >
                Start tracking for free
              </Link>
            </div>

            {/* Dashboard Screenshot */}
            <div className="mt-16 mb-12">
              <div className="relative max-w-5xl mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-3xl"></div>
                {/* Screenshot container */}
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
                  <img
                    src="/Screen_dash.png"
                    alt="JobTracker Dashboard"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-center text-gray-500 text-sm mb-8 italic">
              Built by a student who got tired of spreadsheets
            </p>
          </div>

          {/* Features Grid */}
          <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Never Lose Track of an Application</h3>
              <p className="text-gray-400">
                Every company, role, status, and note—always in sync.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interviews, Without the Chaos</h3>
              <p className="text-gray-400">
                Set reminders so nothing slips through the cracks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">See Momentum, Not Guesswork</h3>
              <p className="text-gray-400">
                Visual insights into where your search actually stands.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 mt-20">
        <div className="mx-auto max-w-7xl text-center text-gray-500 text-sm">
          © 2026 JobTracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
