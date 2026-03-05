const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

const dummyProducts = [
    { name: 'Ergonomic Standing Desk', price: 450, img: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800' },
    { name: 'Ultra-Wide Curved Monitor', price: 320, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800' },
    { name: 'Noise-Cancelling Headphones', price: 180, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
    { name: 'Mechanical RGB Keyboard', price: 120, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800' },
    { name: 'Vertical Ergonomic Mouse', price: 65, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800' },
    { name: '4K Ultra-HD Webcam', price: 95, img: 'https://images.unsplash.com/photo-1563198804-b144dfc1661c?w=800' },
    { name: 'Studio Quality Microphone', price: 150, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800' },
    { name: 'Smart Home Speaker', price: 80, img: 'https://images.unsplash.com/photo-1589410313835-90082723381e?w=800' },
    { name: 'Solar Powered Watch', price: 210, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' },
    { name: 'Leather Portfolio Case', price: 45, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800' }
];

async function seed() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Supabase for seeding...');

        // 1. Create Products First (independent of clients)
        const productIds = [];
        for (const p of dummyProducts) {
            const productResult = await client.query(`
        INSERT INTO products (name, procurement_price, image_url)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [p.name, p.price, p.img]);

            const productId = productResult.rows[0].id;
            productIds.push(productId);
            console.log(`✅ Created Product: ${p.name}`);
        }

        // 2. Check for existing clients to link
        const clientsResult = await client.query('SELECT id, name FROM clients');
        const clients = clientsResult.rows;

        if (clients.length === 0) {
            console.log('\n⚠️ No clients found yet. Products were created but not linked to any brand.');
            console.log('You can link these products later from the Admin Dashboard or by re-running this script after creating a client.');
        } else {
            console.log(`\n🔗 Linking ${productIds.length} products to ${clients.length} clients: ${clients.map(c => c.name).join(', ')}`);

            for (const productId of productIds) {
                for (const c of clients) {
                    await client.query(`
            INSERT INTO client_products (client_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
          `, [c.id, productId]);
                }
            }
            console.log('✅ Links established!');
        }

        console.log('\n✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await client.end();
    }
}

seed();
