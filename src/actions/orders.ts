'use server'

import { supabase } from '@/supabase/client'
import { supabaseAdmin } from '@/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function processCheckout({
    userId,
    clientId,
    items,
    totalAmount
}: {
    userId: string
    clientId: string
    items: { productId: string, quantity: number, price: number }[]
    totalAmount: number
}) {
    try {
        // 1. Create the Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert([
                {
                    user_id: userId,
                    client_id: clientId,
                    total_amount: totalAmount,
                    status: 'placed'
                }
            ])
            .select()
            .single()

        if (orderError) throw orderError

        // 2. Create the Order Items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price
        }))

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            // Rollback order if items fail
            await supabaseAdmin.from('orders').delete().eq('id', order.id)
            throw itemsError
        }

        revalidatePath('/admin')
        return { success: true, orderId: order.id }
    } catch (error: any) {
        console.error('Error in processCheckout:', error)
        return { success: false, error: error.message }
    }
}

export async function getOrders() {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                clients (name),
                order_items (
                    product_id,
                    quantity,
                    unit_price,
                    products (name, image_url)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as any[]
    } catch (error) {
        console.error('Error fetching orders:', error)
        return []
    }
}
