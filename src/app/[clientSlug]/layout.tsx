'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/client'
import { useRouter, useParams, usePathname } from 'next/navigation'

export default function ClientStorefrontLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()
    const { clientSlug } = useParams()
    const pathname = usePathname()

    useEffect(() => {
        const verifyAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push(`/login?returnTo=${encodeURIComponent(pathname)}`)
                return
            }

            // Check authorization
            try {
                const { data: client, error: clientError } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('slug', clientSlug)
                    .single()

                if (clientError || !client) {
                    setLoading(false)
                    setAuthorized(true)
                    return
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('client_id')
                    .eq('id', session.user.id)
                    .single()

                if (profile && profile.client_id === client.id) {
                    setAuthorized(true)
                } else {
                    router.push('/login')
                }
            } catch (err) {
                console.error('[Layout] Verification error:', err)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        verifyAccess()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [clientSlug, router, pathname])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setAuthorized(false)
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Verifying Identity</p>
                </div>
            </div>
        )
    }

    if (!authorized) {
        return null
    }

    return (
        <div className="relative">
            {/* Universal Logout for Client Pages */}
            <div className="fixed top-6 right-32 z-[100] hidden md:block">
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all backdrop-blur-xl group flex items-center gap-2"
                >
                    <svg className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
            {children}
        </div>
    )
}
