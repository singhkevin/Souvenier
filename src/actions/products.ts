'use server'

import { supabaseAdmin as supabase } from '@/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function uploadProductImage(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { success: false, error: 'No file provided' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

    if (error) return { success: false, error: error.message }

    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

    return { success: true, publicUrl }
}

export async function createProduct(data: {
    name: string
    procurement_price: number
    image_url: string
    client_ids: string[] // List of clients to assign this product to
}) {
    try {
        // 1. Create Product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                name: data.name,
                procurement_price: data.procurement_price,
                image_url: data.image_url,
            })
            .select()
            .single()

        if (productError) throw productError

        // 2. Map to Clients
        if (data.client_ids.length > 0) {
            const mappings = data.client_ids.map(clientId => ({
                client_id: clientId,
                product_id: product.id,
            }))

            const { error: mappingError } = await supabase
                .from('client_products')
                .insert(mappings)

            if (mappingError) throw mappingError
        }

        revalidatePath('/admin/products')
        return { success: true, product }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getClients() {
    const { data, error } = await supabase.from('clients').select('id, name')
    if (error) return []
    return data
}

export async function getProducts(clientId?: string) {
    // If clientId is provided, we use the !inner hint to filter the top-level products
    const selectStr = `
        *,
        client_products${clientId ? '!inner' : ''} (
            client_id,
            clients (
                name
            )
        )
    `

    let query = supabase
        .from('products')
        .select(selectStr)

    if (clientId) {
        query = query.eq('client_products.client_id', clientId)
    }

    const { data, error } = await query
    if (error) {
        console.error('Error fetching products:', error)
        return []
    }
    return data as any[]
}
export async function updateProductAssignments(productId: string, clientIds: string[]) {
    try {
        // 1. Delete existing assignments for this product
        const { error: deleteError } = await supabase
            .from('client_products')
            .delete()
            .eq('product_id', productId)

        if (deleteError) throw deleteError

        // 2. Insert new assignments
        if (clientIds.length > 0) {
            const mappings = clientIds.map(clientId => ({
                client_id: clientId,
                product_id: productId,
            }))

            const { error: insertError } = await supabase
                .from('client_products')
                .insert(mappings)

            if (insertError) throw insertError
        }

        revalidatePath('/admin/products')
        return { success: true }
    } catch (error: any) {
        console.error('Error updating assignments:', error)
        return { success: false, error: error.message }
    }
}
