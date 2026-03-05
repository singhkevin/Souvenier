'use server'

import { supabaseAdmin as supabase } from '@/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function requestQuote(data: {
    userId: string
    clientId: string
    productId: string
}) {
    try {
        const { data: quote, error } = await supabase
            .from('quotes')
            .insert({
                user_id: data.userId,
                client_id: data.clientId,
                product_id: data.productId,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/admin')
        return { success: true, quote }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getQuotes() {
    const { data, error } = await supabase
        .from('quotes')
        .select(`
      *,
      clients(name),
      products(name, image_url)
    `)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}
