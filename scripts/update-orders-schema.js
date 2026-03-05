const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runSQL() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to Database...');

        await client.query(`
            -- Drop single product link in orders if it exists
            ALTER TABLE orders DROP COLUMN IF EXISTS product_id;
            
            -- Add total_amount to orders
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;

            -- Create order_items junction table
            CREATE TABLE IF NOT EXISTS order_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
                product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                unit_price NUMERIC,
                created_at TIMESTAMPTZ DEFAULT now()
            );

            -- Enable RLS on order_items
            ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

            -- Cleanup existing policies
            DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
            DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;

            -- Policy: Clients can view their own order items
            CREATE POLICY "Users can view their own order items" ON order_items
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM orders
                    WHERE orders.id = order_items.order_id
                    AND orders.user_id = auth.uid()
                )
            );

            -- Policy: Users can insert their own order items
            CREATE POLICY "Users can insert their own order items" ON order_items
            FOR INSERT TO authenticated
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM orders
                    WHERE orders.id = order_items.order_id
                    AND orders.user_id = auth.uid()
                )
            );
        `);

        console.log('✅ Orders and Order Items schema updated!');
    } catch (err) {
        console.error('❌ Error updating DB schema:', err);
    } finally {
        await client.end();
    }
}

runSQL();
