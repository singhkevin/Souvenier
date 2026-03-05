'use client'

import { useState } from 'react'
import { requestQuote } from '@/actions/quotes'

interface Props {
    userId: string
    clientId: string
    productId: string
    primaryColor: string
}

export default function QuoteRequestButton({ userId, clientId, productId, primaryColor }: Props) {
    const [loading, setLoading] = useState(false)
    const [requested, setRequested] = useState(false)

    const handleRequest = async () => {
        if (!userId) {
            alert('Please log in to request a quote.')
            return
        }

        setLoading(true)
        try {
            const result = await requestQuote({ userId, clientId, productId })
            if (result.success) {
                setRequested(true)
            } else {
                alert('Failed to request quote: ' + result.error)
            }
        } catch (error) {
            alert('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (requested) {
        return (
            <button
                disabled
                className="bg-green-600/20 border border-green-600/50 text-green-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Quote Requested
            </button>
        )
    }

    return (
        <button
            onClick={handleRequest}
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
            className="text-white px-4 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 shadow-lg shadow-branding/20 hover:opacity-90 disabled:opacity-50"
        >
            {loading ? 'Requesting...' : 'Request Quote'}
        </button>
    )
}
