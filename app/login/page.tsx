import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 backdrop-blur-sm">
                <div>
                    <Link href="/" className="inline-block text-xl font-bold mb-8">
                        Job<span className="text-purple-500">Tracker</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white">Sign in</h2>
                    <p className="mt-2 text-gray-400">Welcome back! Please enter your details.</p>
                </div>
                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
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
                        formAction={login}
                        className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-all hover:bg-purple-700 hover:scale-[1.02]"
                    >
                        Sign in
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-purple-500 hover:text-purple-400 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
