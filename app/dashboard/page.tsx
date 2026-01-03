import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JobTrackerTable from './JobTrackerTable'
import SignOutButton from './SignOutButton'
import QuoteFooter from './QuoteFooter'
import GradientBackground from './GradientBackground'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = user.user_metadata?.full_name || user.email

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Gradient Background */}
            <GradientBackground />

            {/* Status Bar */}
            <div className="border-b border-white/10 bg-black/80 backdrop-blur-lg sticky top-0 z-20 relative">
                <div className="px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-normal hover:opacity-80 transition-opacity">
                        Job<span className="text-purple-500">Tracker</span>
                    </Link>
                    <p className="text-sm text-gray-400">Welcome, {fullName}!</p>
                    <SignOutButton />
                </div>
            </div>

            {/* Central Workspace */}
            <div className="p-8 relative z-10">
                <JobTrackerTable userId={user.id} />
            </div>

            {/* Quote Footer */}
            <QuoteFooter />
        </div>
    )
}
