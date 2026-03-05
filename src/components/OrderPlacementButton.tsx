'use client'

import { useState } from 'react'
import { createOrder } from '@/actions/orders'

interface OrderPlacementButtonProps {
    userId: string
    clientId: string
    productId: string
    primaryColor: string
}

export default function OrderPlacementButton({
    userId,
    clientId,
    productId,
    primaryColor
}: OrderPlacementButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleOrder = async () => {
        if (!userId) {
            alert('Please login to place an order.')
            return
        }

        setStatus('loading')
        const result = await createOrder({ userId, clientId, productId })

        if (result.success) {
            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
        } else {
            setStatus('error')
            alert('Order failed: ' + result.error)
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    return (
        <button
            onClick={handleOrder}
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 text-white shadow-lg"
            style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 20px -10px ${primaryColor}40`
            }}
        >
            {status === 'loading' && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {status === 'idle' && 'Order Now'}
            {status === 'success' && '✓ Order Placed'}
            {status === 'error' && 'Failed'}
        </button>
    )
}
