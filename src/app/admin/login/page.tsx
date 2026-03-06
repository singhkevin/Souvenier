'use client'

import { useState } from 'react'
import { supabase } from '@/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            if (authData.user) {
                // Check if user is an admin (in this case, any authenticated user for now, 
                // but we could add a check for a specific email or role if needed)
                router.push('/admin')
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-600/20 blur-3xl rounded-full" />

                <div className="relative z-10">
                    <div className="mb-10 text-center">
                        <div className="inline-block p-4 rounded-2xl bg-gray-800 mb-6 border border-gray-700 shadow-inner">
                            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Admin Central
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Dashboard Authentication</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Security Code</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs p-4 rounded-xl flex items-center gap-3">
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : 'Access Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
