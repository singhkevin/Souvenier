'use client'

import { useState, useEffect } from 'react'
import { createClientAndUser, getAllClients, uploadBrandLogo } from '@/actions/clients'

export default function ClientManager() {
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [lastCredentials, setLastCredentials] = useState<any>(null)

    // Form State
    const [clientName, setClientName] = useState('')
    const [clientSlug, setClientSlug] = useState('')
    const [email, setEmail] = useState('')
    const [primaryColor, setPrimaryColor] = useState('#8b5cf6')
    const [marginPercent, setMarginPercent] = useState('20')
    const [logoUrl, setLogoUrl] = useState('')
    const [logoUploading, setLogoUploading] = useState(false)

    useEffect(() => {
        loadClients()
    }, [])

    const loadClients = async () => {
        const data = await getAllClients()
        setClients(data)
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setLogoUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])

        const result = await uploadBrandLogo(formData)
        if (result.success) {
            setLogoUrl(result.publicUrl!)
        } else {
            alert('Logo upload failed: ' + result.error)
        }
        setLogoUploading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setLastCredentials(null)

        const result = await createClientAndUser({
            clientName,
            clientSlug,
            email,
            primaryColor,
            marginPercent: parseFloat(marginPercent),
            logoUrl
        })

        if (result.success) {
            setLastCredentials(result.credentials)
            setClientName('')
            setClientSlug('')
            setEmail('')
            setLogoUrl('')
            loadClients()
            alert('Client and User created successfully!')
        } else {
            alert('Error: ' + result.error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        Client Manager
                    </h1>
                    <a href="/admin" className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
                        &larr; Back to Dashboard
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Create Client Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sticky top-8">
                            <h2 className="text-xl font-bold mb-6">Onboard New Brand</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Brand Name</label>
                                    <input
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="e.g. Tesla"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">URL Slug</label>
                                    <input
                                        value={clientSlug}
                                        onChange={(e) => setClientSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="tesla"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Admin Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="admin@brand.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Brand Logo</label>
                                    <div className="flex flex-col gap-4">
                                        {logoUrl && (
                                            <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 group">
                                                <img src={logoUrl} className="w-full h-full object-contain" />
                                                <button
                                                    onClick={() => setLogoUrl('')}
                                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 transition-all"
                                        />
                                        {logoUploading && <p className="text-xs text-cyan-400 animate-pulse">Uploading logo...</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Brand Color</label>
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-full h-12 bg-gray-800 border border-gray-700 rounded-xl p-1 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Margin (%)</label>
                                        <input
                                            type="number"
                                            value={marginPercent}
                                            onChange={(e) => setMarginPercent(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || logoUploading}
                                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-4 rounded-xl font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Create Brand & User'}
                                </button>
                            </form>

                            {lastCredentials && (
                                <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                                    <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 116 0v2H7V7z"></path></svg>
                                        Credentials Generated
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-1">Email: <span className="text-white font-mono">{lastCredentials.email}</span></p>
                                    <p className="text-sm text-gray-400">Temp Pass: <span className="text-white font-mono">{lastCredentials.password}</span></p>
                                    <p className="text-[10px] text-cyan-400/60 mt-4 leading-relaxed font-medium grayscale italic">
                                        * Please share these securely. The user can now login to their dashboard.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Client List */}
                    <div className="lg:col-span-2">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-gray-800/50">
                                    <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                                        <th className="px-8 py-4">Brand</th>
                                        <th className="px-8 py-4">Slug / URL</th>
                                        <th className="px-8 py-4">Margin</th>
                                        <th className="px-8 py-4">Branding</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                                                        {client.logo_url ? (
                                                            <img src={client.logo_url} className="w-full h-full object-contain" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-gray-600">{client.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">{client.name}</div>
                                                        <div className="text-xs text-gray-500">{client.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-mono text-cyan-500 text-sm">
                                                /{client.slug}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                                                    {client.margin_percent}%
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div
                                                    className="w-8 h-8 rounded-full shadow-lg border-2 border-gray-800"
                                                    style={{ backgroundColor: client.primary_color }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {clients.length === 0 && (
                            <div className="p-20 text-center text-gray-600">
                                No brands onboarded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
