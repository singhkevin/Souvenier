'use client'

import { useState, useEffect } from 'react'
import { uploadProductImage, createProduct, getClients, getProducts, updateProductAssignments } from '@/actions/products'

export default function ProductManager() {
    const [clients, setClients] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [filterClientId, setFilterClientId] = useState<string>('')
    const [editingProductId, setEditingProductId] = useState<string | null>(null)
    const [editSelectedClients, setEditSelectedClients] = useState<string[]>([])
    const [isUpdating, setIsUpdating] = useState(false)

    // Form State
    const [name, setName] = useState('')
    const [procurementPrice, setProcurementPrice] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [selectedClients, setSelectedClients] = useState<string[]>([])

    useEffect(() => {
        loadData()
    }, [filterClientId])

    const loadData = async () => {
        setLoading(true)
        const [c, p] = await Promise.all([
            getClients(),
            getProducts(filterClientId || undefined)
        ])
        setClients(c)
        setProducts(p)
        setLoading(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', e.target.files[0])

        const result = await uploadProductImage(formData)
        if (result.success) {
            setImageUrl(result.publicUrl!)
        } else {
            alert('Upload failed: ' + result.error)
        }
        setUploading(false)
    }

    const handleUpdateAssignments = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingProductId) return

        setIsUpdating(true)
        const result = await updateProductAssignments(editingProductId, editSelectedClients)
        if (result.success) {
            setEditingProductId(null)
            loadData()
            alert('Assignments updated!')
        } else {
            alert('Error: ' + result.error)
        }
        setIsUpdating(false)
    }

    const openEditMode = (product: any) => {
        setEditingProductId(product.id)
        setEditSelectedClients(product.client_products?.map((cp: any) => cp.client_id) || [])
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await createProduct({
            name,
            procurement_price: parseFloat(procurementPrice),
            image_url: imageUrl,
            client_ids: selectedClients
        })

        if (result.success) {
            setName('')
            setProcurementPrice('')
            setImageUrl('')
            setSelectedClients([])
            loadData()
            alert('Product created and assigned!')
        } else {
            alert('Error: ' + result.error)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Product Manager
                    </h1>

                    <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 p-2 rounded-2xl">
                        <span className="text-sm font-bold text-gray-500 pl-4 uppercase tracking-widest">Filter:</span>
                        <select
                            value={filterClientId}
                            onChange={(e) => setFilterClientId(e.target.value)}
                            className="bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none min-w-[200px]"
                        >
                            <option value="">All Clients</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Create Product Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 sticky top-8">
                            <h2 className="text-xl font-bold mb-6">Add New Product</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Product Name</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="e.g. Premium Watch"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Procurement Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={procurementPrice}
                                        onChange={(e) => setProcurementPrice(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Product Image</label>
                                    <div className="flex flex-col gap-4">
                                        {imageUrl && (
                                            <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-700">
                                                <img src={imageUrl} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                        />
                                        {uploading && <p className="text-xs text-purple-400 animate-pulse">Uploading to Supabase Storage...</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Assign to Clients</label>
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {clients.map(client => (
                                            <label key={client.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClients.includes(client.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedClients([...selectedClients, client.id])
                                                        else setSelectedClients(selectedClients.filter(id => id !== client.id))
                                                    }}
                                                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-sm">{client.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || uploading || !imageUrl}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Product'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col">
                                    <div className="aspect-video bg-gray-800 overflow-hidden">
                                        <img src={product.image_url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold">{product.name}</h3>
                                            <button
                                                onClick={() => openEditMode(product)}
                                                className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest"
                                            >
                                                Edit Assignments
                                            </button>
                                        </div>
                                        <p className="text-purple-400 font-bold mb-4">${product.procurement_price}</p>

                                        {editingProductId === product.id ? (
                                            <div className="bg-gray-800/50 p-4 rounded-2xl border border-purple-500/30">
                                                <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-tighter">Select Clients:</p>
                                                <div className="space-y-2 max-h-32 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                                                    {clients.map(client => (
                                                        <label key={client.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={editSelectedClients.includes(client.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setEditSelectedClients([...editSelectedClients, client.id])
                                                                    else setEditSelectedClients(editSelectedClients.filter(id => id !== client.id))
                                                                }}
                                                                className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                                                            />
                                                            {client.name}
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdateAssignments}
                                                        disabled={isUpdating}
                                                        className="flex-1 bg-purple-600 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {isUpdating ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingProductId(null)}
                                                        className="px-3 bg-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Assigned to:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.client_products?.length > 0 ? (
                                                        product.client_products.map((cp: any, idx: number) => (
                                                            <span key={idx} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                                                                {cp.clients.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-600 italic">No clients assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
