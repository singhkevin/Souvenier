const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

async function seed() {
    const client = new Client({ connectionString });
    try {
        await client.connect();

        // 1. Create a Test Client
        const clientResult = await client.query(`
      INSERT INTO clients (slug, name, primary_color, margin_percent)
      VALUES ('acme', 'Acme Corporation', '#10b981', 25)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
        const clientId = clientResult.rows[0].id;
        console.log('✅ Created Client: Acme Corporation (slug: acme)');

        // 2. Create a Test Product
        const productResult = await client.query(`
      INSERT INTO products (name, procurement_price, image_url)
      VALUES ('Space Grey Laptop', 1200, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800')
      RETURNING id;
    `);
        const productId = productResult.rows[0].id;
        console.log('✅ Created Product: Space Grey Laptop');

        // 3. Link Product to Client
        await client.query(`
      INSERT INTO client_products (client_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING;
    `, [clientId, productId]);
        console.log('✅ Linked Product to Acme Corporation');

        console.log('\n--- NEXT STEPS ---');
        console.log('1. Go to Supabase Auth and create a user.');
        console.log('2. In the "profiles" table, link that user ID to this Client ID: ' + clientId);
        console.log('3. Log in at http://localhost:3000/login');

    } catch (err) {
        console.error('❌ Error seeding data:', err);
    } finally {
        await client.end();
    }
}

seed();
