'use server'

import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function loadApplications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })

    if (error) {
        console.error('Error loading applications:', error)
        return []
    }

    return data || []
}

export async function createApplication(application: {
    company: string
    role: string
    status: string
    applied_at: string
    notes: string
    location?: string
    link?: string
    tags?: string[]
    custom_fields?: Record<string, any>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('applications')
        .insert([{
            ...application,
            user_id: user.id
        }])
        .select()
        .single()

    if (error) {
        console.error('Error creating application:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { data }
}

export async function updateApplication(id: string, updates: Partial<{
    company: string
    role: string
    status: string
    applied_at: string
    notes: string
    location?: string
    link?: string
    tags?: string[]
    custom_fields?: Record<string, any>
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating application:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { data }
}

export async function deleteApplication(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting application:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
