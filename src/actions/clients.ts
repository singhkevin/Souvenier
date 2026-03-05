'use server'

import { supabaseAdmin as supabase } from '@/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function uploadBrandLogo(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { success: false, error: 'No file provided' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `logos/${fileName}`

    const { data, error } = await supabase.storage
        .from('product-images') // Re-using existing public bucket or create a new one
        .upload(filePath, file)

    if (error) return { success: false, error: error.message }

    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

    return { success: true, publicUrl }
}

export async function createClientAndUser(data: {
    clientName: string
    clientSlug: string
    email: string
    password?: string
    primaryColor?: string
    marginPercent?: number
    logoUrl?: string
}) {
    try {
        const password = data.password || Math.random().toString(36).slice(-10)

        // 1. Create the User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: password,
            email_confirm: true,
        })

        if (authError) throw authError

        const userId = authData.user.id

        // 2. Create the Client (Brand)
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({
                name: data.clientName,
                slug: data.clientSlug.toLowerCase(),
                primary_color: data.primaryColor || '#8b5cf6',
                margin_percent: data.marginPercent || 20,
                logo_url: data.logoUrl,
            })
            .select()
            .single()

        if (clientError) {
            // Rollback auth user if client creation fails
            await supabase.auth.admin.deleteUser(userId)
            throw clientError
        }

        // 3. Create the Profile link
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                client_id: client.id
            })

        if (profileError) {
            // Rollback if profile creation fails
            await supabase.auth.admin.deleteUser(userId)
            await supabase.from('clients').delete().eq('id', client.id)
            throw profileError
        }

        revalidatePath('/admin/clients')
        return {
            success: true,
            client,
            credentials: { email: data.email, password }
        }
    } catch (error: any) {
        console.error('Error in createClientAndUser:', error)
        return { success: false, error: error.message }
    }
}

export async function getAllClients() {
    const { data, error } = await supabase
        .from('clients')
        .select(`
            *,
            profiles (
                id
            )
        `)

    if (error) {
        console.error('Error fetching clients:', error)
        return []
    }
    return data
}
