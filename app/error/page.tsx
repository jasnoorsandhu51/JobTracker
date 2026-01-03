import Link from 'next/link'

export default function ErrorPage({
    searchParams,
}: {
    searchParams: { message?: string }
}) {
    const errorMessage = searchParams.message || 'Unable to authenticate. Please check your credentials.'

    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 backdrop-blur-sm text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
                <p className="mt-4 text-gray-400">{errorMessage}</p>
                <div className="mt-6 flex flex-col gap-3">
                    <Link
                        href="/signup"
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-all hover:scale-[1.02]"
                    >
                        Try signing up
                    </Link>
                    <Link
                        href="/login"
                        className="px-4 py-3 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 transition-colors"
                    >
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
