'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'

interface CartNavCountProps {
    clientSlug: string
    primaryColor: string
}

export default function CartNavCount({ clientSlug, primaryColor }: CartNavCountProps) {
    const { itemCount } = useCart()

    return (
        <Link
            href={`/${clientSlug}/checkout`}
            className="relative group flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all active:scale-95"
        >
            <svg className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
                <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-black"
                    style={{ backgroundColor: primaryColor }}
                >
                    {itemCount}
                </span>
            )}
        </Link>
    )
}
