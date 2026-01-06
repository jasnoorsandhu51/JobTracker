"use client";

import { signup } from './actions'
import Link from 'next/link'
import { useState } from 'react'


export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)

    async function handleSignup(formData: FormData) {
        setError(null)
        const res = await fetch('/api/signup', {
            method: 'POST',
            body: formData,
        })
        const result = await res.json()
        if (result.error) {
            setError(result.error)
        } else {
            window.location.href = '/dashboard'
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 backdrop-blur-sm">
                <div>
                    <Link href="/" className="inline-block text-xl font-bold mb-8">
                        Job<span className="text-purple-500">Tracker</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Create an account</h2>
                    <p className="mt-2 text-gray-400">Start tracking your job applications today.</p>
                </div>
                {error && (
                    <div className="fixed top-8 right-8 z-50 rounded-lg border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-transparent backdrop-blur-lg p-4 shadow-lg animate-in slide-in-from-top">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-300">{error}</p>
                        </div>
                    </div>
                )}
                <form className="mt-8 space-y-6" action={handleSignup}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-all hover:bg-purple-700 hover:scale-[1.02]"
                    >
                        Create account
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-500 hover:text-purple-400 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
