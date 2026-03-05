'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'

interface AddToCartButtonProps {
    product: {
        id: string
        name: string
        sale_price: number
        image_url: string
    }
    primaryColor: string
}

export default function AddToCartButton({
    product,
    primaryColor
}: AddToCartButtonProps) {
    const { addToCart } = useCart()
    const [added, setAdded] = useState(false)

    const handleAdd = () => {
        addToCart(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-[0.98] text-white shadow-lg"
            style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 20px -10px ${primaryColor}40`
            }}
        >
            {added ? (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Added
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Add to Cart
                </>
            )}
        </button>
    )
}
