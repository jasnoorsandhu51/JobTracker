'use server'

import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error)
        redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }

    redirect('/dashboard')
}
