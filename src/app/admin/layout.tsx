'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session && pathname !== '/admin/login') {
                setUser(null)
                router.push('/admin/login')
                return
            }

            if (session) {
                setUser(session.user)
            }

            setLoading(false)
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session) {
                setUser(null)
                if (pathname !== '/admin/login') {
                    router.push('/admin/login')
                }
            } else {
                setUser(session.user)
                if (pathname === '/admin/login' && session.user.user_metadata?.role === 'admin') {
                    router.push('/admin')
                }
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [pathname, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        router.push('/admin/login')
    }

    if (loading && pathname !== '/admin/login') {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Securing Connection...</p>
                </div>
            </div>
        )
    }

    if (pathname === '/admin/login') {
        return children
    }

    // Guard: If not on login page and no admin user
    if (!user || user.user_metadata?.role !== 'admin') {
        // If not logged in at all, keep showing loading while redirect happens
        if (!user && pathname !== '/admin/login') {
            return (
                <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Redirecting...</p>
                    </div>
                </div>
            )
        }

        const isClientUser = user && user.user_metadata?.role !== 'admin';

        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 p-12 bg-gray-900/50 border border-white/10 rounded-[3rem] backdrop-blur-2xl">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M5.07 4.07a9 9 0 0113.86 0M2.13 7.03a13 13 0 0119.74 0" />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-black tracking-tight text-white">Access Denied</h1>
                        <p className="text-white/40 font-medium text-sm leading-relaxed">
                            {isClientUser
                                ? "You are currently logged in as a Client. The Admin Dashboard is restricted to system administrators."
                                : "Please log in with an administrator account to access this area."
                            }
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-4">
                        {isClientUser && (
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Go to Client Portal
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <a href="/admin" className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Souvenier Admin
                        </a>
                        <div className="hidden md:flex items-center gap-6">
                            <a href="/admin" className={`text-sm font-bold transition-colors ${pathname === '/admin' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Dashboard</a>
                            <a href="/admin/clients" className={`text-sm font-bold transition-colors ${pathname === '/admin/clients' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Clients</a>
                            <a href="/admin/products" className={`text-sm font-bold transition-colors ${pathname === '/admin/products' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Products</a>
                        </div>
                    </div>

                    {user && (
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-xs font-bold text-white">{user.email}</span>
                                <span className="text-[10px] text-purple-500 font-black uppercase tracking-tighter">System Administrator</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-800 hover:bg-red-500/10 hover:text-red-500 border border-gray-700 hover:border-red-500/50 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <main>
                {children}
            </main>
        </div>
    )
}
