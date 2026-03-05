'use client'

export default function PdfPreviewPage() {
    const client = {
        name: 'Sample Corp',
        primary_color: '#8b5cf6',
        logo_url: '/next.svg', // Placeholder
    }

    const products = [
        { id: '1', name: 'Premium Leather Watch', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', sale_price: 299.99 },
        { id: '2', name: 'Wireless Noise Cancelling Headphones', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', sale_price: 199.50 },
        { id: '3', name: 'Smart Coffee Mug', image_url: 'https://images.unsplash.com/photo-1517254456976-ee8682099819?w=400', sale_price: 45.00 },
        { id: '4', name: 'Minimalist Desk Lamp', image_url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=400', sale_price: 89.00 },
    ]

    return (
        <div className="bg-white text-gray-900 min-h-screen">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', borderBottom: `2px solid ${client.primary_color}`, paddingBottom: '20px', marginBottom: '40px' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: client.primary_color }}>{client.name}</div>
                    <div style={{ textAlign: 'right', flex: 1 }}>
                        <div style={{ fontWeight: '700' }}>LOOKBOOK 2024</div>
                        <div style={{ color: '#666' }}>Prepared exclusively for {client.name}</div>
                    </div>
                </div>

                <h1 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', margin: '40px 0', letterSpacing: '-1px' }}>Curated Collection</h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                    {products.map(p => (
                        <div key={p.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src={p.image_url} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', backgroundColor: '#f9f9f9' }} />
                            <div style={{ padding: '20px' }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px 0' }}>{p.name}</div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: client.primary_color }}>${p.sale_price.toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    &copy; 2024 {client.name} Gifting Platform. All rights reserved. Professional B2B Catalog.
                </div>
            </div>
        </div>
    )
}
