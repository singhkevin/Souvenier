import { supabase } from '@/supabase/client'
import { supabaseAdmin } from '@/supabase/admin'
import Image from 'next/image'
import CatalogDownloadButton from '@/components/CatalogDownloadButton'
import QuoteRequestButton from '@/components/QuoteRequestButton'
import AddToCartButton from '@/components/AddToCartButton'
import CartNavCount from '@/components/CartNavCount'

interface Product {
    id: string
    name: string
    image_url: string
    sale_price: number
}

interface ClientData {
    id: string
    name: string
    logo_url: string
    primary_color: string
    margin_percent: number
}

async function getClientData(slug: string) {
    const { data, error } = await supabaseAdmin
        .from('clients')
        .select('id, name, logo_url, primary_color, margin_percent')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching client data:', error)
        return null
    }
    return data as ClientData
}

async function getClientProducts(clientId: string, marginPercent: number) {
    const { data, error } = await supabaseAdmin
        .from('client_products')
        .select(`
      products (
        id,
        name,
        image_url,
        procurement_price
      )
    `)
        .eq('client_id', clientId)

    if (error) {
        console.error('Error fetching client products:', error)
        return []
    }

    const products = (data as any[]).map((item) => {
        const product = item.products
        if (!product) return null
        const procurementPrice = product.procurement_price || 0
        const salePrice = procurementPrice * (1 + marginPercent / 100)

        return {
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            sale_price: salePrice,
        }
    }).filter(Boolean)

    return products as Product[]
}

export default async function ClientPage({ params }: { params: Promise<{ clientSlug: string }> }) {
    const { clientSlug } = await params
    const client = await getClientData(clientSlug)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || ''

    if (!client) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
                <div className="text-center p-12 bg-gray-900/50 border border-gray-800 rounded-3xl backdrop-blur-xl">
                    <h1 className="text-4xl font-black mb-4">404</h1>
                    <h2 className="text-xl font-bold text-gray-400">Storefront Not Found</h2>
                    <p className="text-gray-500 mt-4 max-w-xs">The curated collection you are looking for doesn't exist or has been moved.</p>
                </div>
            </div>
        )
    }

    const products = await getClientProducts(client.id, client.margin_percent)
    const primaryColor = client.primary_color || '#8b5cf6'

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30" style={{ '--primary-branding': primaryColor } as any}>
            {/* Dynamic Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-[0.07]"
                    style={{ backgroundColor: primaryColor }}
                />
                <div
                    className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-[0.05]"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr opacity-20 group-hover:opacity-40 transition-opacity blur-sm rounded-xl" style={{ backgroundColor: primaryColor }} />
                            {client.logo_url ? (
                                <Image
                                    src={client.logo_url}
                                    alt={client.name}
                                    width={44}
                                    height={44}
                                    className="relative rounded-xl object-contain bg-black/50 p-1 border border-white/10 shadow-2xl"
                                />
                            ) : (
                                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl bg-gray-900 border border-white/10 shadow-2xl" style={{ color: primaryColor }}>
                                    {client.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight leading-tight">{client.name}</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Premium Storefront</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {['Collections', 'Favorites', 'Orders'].map((item) => (
                            <a key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all hover:scale-105">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <CatalogDownloadButton
                            clientSlug={clientSlug}
                            userId={userId}
                            primaryColor={primaryColor}
                        />
                        <CartNavCount clientSlug={clientSlug} primaryColor={primaryColor} />
                    </div>
                </div>
            </nav>

            <main className="relative pt-32 pb-20 px-6 max-w-[1700px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Column: Logo Banner (25%) */}
                    <aside className="w-full lg:w-1/4 lg:sticky lg:top-32 h-fit">
                        <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl flex items-center justify-center p-12 group">
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/5 to-transparent" />
                            {/* Animated glow background */}
                            <div
                                className="absolute w-40 h-40 rounded-full blur-[80px] opacity-20 animate-pulse"
                                style={{ backgroundColor: primaryColor }}
                            />

                            {client.logo_url ? (
                                <div className="relative z-10 w-full h-full transition-transform duration-700 group-hover:scale-105">
                                    <Image
                                        src={client.logo_url}
                                        alt={`${client.name} logo`}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            ) : (
                                <h2 className="text-6xl font-black tracking-tighter opacity-10 text-center uppercase" style={{ color: primaryColor }}>
                                    {client.name}
                                </h2>
                            )}
                        </div>

                        {/* Brand Context Area */}
                        <div className="mt-12 px-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Exclusive Portal</span>
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">{client.name} Signature</h2>
                            <p className="text-sm text-white/40 leading-relaxed font-medium">
                                Explore a hand-picked collection of premium gifts, expertly selected to reinforce your brand's presence and values.
                            </p>

                            <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:border-white/40 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Quality Assured</span>
                                </div>
                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:border-white/40 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Fast Fulfillment</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column: Assigned Products (75%) */}
                    <section className="flex-grow w-full lg:w-3/4">
                        <div className="flex items-center justify-between mb-10 px-4">
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/20">Curated Collection</h3>
                            <div className="h-px flex-grow mx-8 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative bg-[#0a0a0a] border border-white/[0.05] rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col"
                                    >
                                        <div className="relative aspect-[4/5] w-full bg-[#111] overflow-hidden">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out p-4 rounded-[3rem]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                    <span className="text-gray-700 font-bold uppercase tracking-widest text-xs">No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8 flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-purple-300 transition-colors">{product.name}</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Signature Series</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black tracking-tighter block mb-0 leading-none">
                                                        ${product.sale_price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-auto space-y-3">
                                                <AddToCartButton
                                                    product={product}
                                                    primaryColor={primaryColor}
                                                />

                                                <QuoteRequestButton
                                                    userId={userId}
                                                    clientId={client.id}
                                                    productId={product.id}
                                                    primaryColor={primaryColor}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] backdrop-blur-md">
                                <div className="w-20 h-20 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                <h3 className="text-2xl font-black mb-2 leading-none">Catalog Coming Soon</h3>
                                <p className="text-white/30 font-medium">We are currently curating the perfect items for {client.name}.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Global Branding Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-branding { background-color: var(--primary-branding); }
                .text-branding { color: var(--primary-branding); }
                .border-branding { border-color: var(--primary-branding); }
                .hover\\:bg-branding:hover { background-color: var(--primary-branding); }
            `}} />
        </div>
    )
}
