'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/client'
import { getQuotes } from '@/actions/quotes'
import { getOrders } from '@/actions/orders'

export default function AdminDashboard() {
    const [quotes, setQuotes] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [notifications, setNotifications] = useState<string[]>([])

    useEffect(() => {
        loadData()

        // 1. Subscribe to Real-time changes
        const quotesChannel = supabase
            .channel('admin-quotes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quotes' },
                payload => handleRealtimeUpdate('New Quote Request!', payload))
            .subscribe()

        const ordersChannel = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
                payload => handleRealtimeUpdate('New Order Placed!', payload))
            .subscribe()

        return () => {
            supabase.removeChannel(quotesChannel)
            supabase.removeChannel(ordersChannel)
        }
    }, [])

    const handleRealtimeUpdate = (message: string, payload: any) => {
        setNotifications(prev => [`${message} ID: ${payload.new.id}`, ...prev])
        loadData()
        setTimeout(() => {
            setNotifications(prev => prev.slice(0, -1))
        }, 5000)
    }

    const loadData = async () => {
        const [q, o] = await Promise.all([getQuotes(), getOrders()])
        setQuotes(q)
        setOrders(o)
    }

    const Table = ({ title, items, columns, type }: { title: string, items: any[], columns: string[], type: 'quote' | 'order' }) => (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">{title}</h2>
                <span className="text-sm bg-gray-800 text-gray-400 px-3 py-1 rounded-full">{items.length} total</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold">
                            {columns.map(col => <th key={col} className="px-8 py-4">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6 font-bold">{item.clients?.name}</td>
                                <td className="px-8 py-6">
                                    {type === 'order' ? (
                                        <div className="space-y-2">
                                            {item.order_items?.map((oi: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <img src={oi.products?.image_url} className="w-8 h-8 rounded shadow object-cover" />
                                                    <span className="text-sm">{oi.products?.name} <span className="text-gray-500 text-xs">x{oi.quantity}</span></span>
                                                </div>
                                            ))}
                                            {!item.order_items && <span className="text-gray-500">No items</span>}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <img src={item.products?.image_url} className="w-10 h-10 rounded shadow-lg object-cover" />
                                            <span>{item.products?.name}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-sm">
                                    {type === 'order' ? (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white">${item.total_amount?.toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-500 uppercase font-black">Total</span>
                                        </div>
                                    ) : (
                                        <span className={`${type === 'order' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'} border px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-tighter`}>
                                            {item.status}
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-sm">
                                    {type === 'order' ? (
                                        <span className={`${type === 'order' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'} border px-3 py-1 rounded-full uppercase text-[10px] font-black tracking-tighter`}>
                                            {item.status}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                                    )}
                                </td>
                                {type === 'order' && (
                                    <td className="px-8 py-6 text-gray-500 text-sm">
                                        {new Date(item.created_at).toLocaleString()}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <div className="flex gap-4">
                        <a href="/admin/clients" className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-bold text-sm">Manage Clients</a>
                        <a href="/admin/products" className="bg-purple-600 px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-bold text-sm shadow-lg shadow-purple-500/20">Manage Products</a>
                    </div>
                </div>

                {/* Real-time Toasts */}
                <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
                    {notifications.map((note, idx) => (
                        <div key={idx} className="bg-white text-black px-6 py-4 rounded-2xl shadow-2xl animate-bounce-in flex items-center gap-3 border border-gray-200">
                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                            <span className="font-bold text-sm">{note}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-12">
                    <Table
                        title="Recent Order Placement"
                        items={orders}
                        columns={['Client', 'Items', 'Amount', 'Status', 'Ordered At']}
                        type="order"
                    />

                    <Table
                        title="Recent Quote Requests"
                        items={quotes}
                        columns={['Client', 'Product', 'Status', 'Requested At']}
                        type="quote"
                    />
                </div>
            </div>

        </div>
    )
}
