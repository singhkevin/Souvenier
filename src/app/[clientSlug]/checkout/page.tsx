'use client'

import { useCart } from '@/context/CartContext'
import { processCheckout } from '@/actions/orders'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/supabase/client'

export default function CheckoutPage() {
    const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart()
    const { clientSlug } = useParams() as { clientSlug: string }
    const router = useRouter()

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [userId, setUserId] = useState<string | null>(null)
    const [clientId, setClientId] = useState<string | null>(null)
    const [primaryColor, setPrimaryColor] = useState('#8b5cf6')

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Fetch client data for branding and ID
            const { data: client } = await supabase
                .from('clients')
                .select('id, primary_color')
                .eq('slug', clientSlug)
                .single()

            if (client) {
                setClientId(client.id)
                setPrimaryColor(client.primary_color)
            }
        }
        loadData()
    }, [clientSlug, router])

    const handleCheckout = async () => {
        if (!userId || !clientId || cart.length === 0) return

        setStatus('processing')

        const items = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.sale_price
        }))

        const result = await processCheckout({
            userId,
            clientId,
            items,
            totalAmount: total
        })

        if (result.success) {
            setStatus('success')
            clearCart()
        } else {
            setStatus('error')
            alert('Checkout failed: ' + result.error)
        }
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 p-12 bg-gray-900/50 border border-white/10 rounded-[3rem] backdrop-blur-2xl">
                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                        <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Order Placed!</h1>
                    <p className="text-white/40 font-medium">Your premium selection has been confirmed. Our team will contact you shortly.</p>
                    <Link
                        href={`/${clientSlug}`}
                        className="inline-block px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Back to Storefront
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12" style={{ '--primary-branding': primaryColor } as any}>
            <div className="max-w-4xl mx-auto pt-20">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <Link href={`/${clientSlug}`} className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2 mb-4">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            Back to Store
                        </Link>
                        <h1 className="text-5xl font-black tracking-tighter">Your Selection</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Total Amount</p>
                        <span className="text-4xl font-black tracking-tighter leading-none">
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>

                {cart.length > 0 ? (
                    <div className="space-y-6">
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                            <div className="divide-y divide-white/[0.05]">
                                {cart.map((item) => (
                                    <div key={item.id} className="p-8 flex items-center gap-8 group">
                                        <div className="relative w-24 h-24 bg-gray-900 rounded-3xl overflow-hidden border border-white/5 flex-shrink-0">
                                            {item.image_url ? (
                                                <Image src={item.image_url} alt={item.name} fill className="object-cover p-2" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/20 uppercase tracking-widest">No Pic</div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                                            <p className="text-sm font-black text-white/20 uppercase tracking-widest">Unit: ${item.sale_price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-4 bg-black/50 border border-white/10 p-1 rounded-2xl">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                                                >
                                                    -
                                                </button>
                                                <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-3 text-white/20 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900/40 p-10 rounded-[2.5rem] border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h4 className="text-xl font-bold mb-1">Finalize Order</h4>
                                <p className="text-white/40 text-sm">Review your selection and place the order for processing.</p>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={status === 'processing'}
                                className="px-12 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 shadow-2xl"
                                style={{
                                    backgroundColor: primaryColor,
                                    boxShadow: `0 20px 40px -10px ${primaryColor}40`
                                }}
                            >
                                {status === 'processing' ? 'Processing...' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] backdrop-blur-md">
                        <h3 className="text-2xl font-black mb-4">Your cart is empty</h3>
                        <Link
                            href={`/${clientSlug}`}
                            className="text-xs font-black uppercase tracking-widest px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all inline-block"
                        >
                            Return to Selection
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
