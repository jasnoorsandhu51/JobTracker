'use client'

import { signOut } from './actions'

export default function SignOutButton() {
    return (
        <button 
            onClick={async () => {
                await signOut()
            }}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
            Sign out
        </button>
    )
}
