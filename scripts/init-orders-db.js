const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createOrdersTable() {
    console.log('Creating orders table...');

    const sql = `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER DEFAULT 1,
      status TEXT DEFAULT 'placed',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

    -- Policy: Clients can view their own orders
    CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

    -- Policy: Admin can view all orders (optional if using service role, but good practice)
    CREATE POLICY "Admins can view all orders" ON orders
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  `;

    // Note: supabase-js doesn't support raw SQL easily unless you have a function or use 'pg'
    // Since I have 'pg' installed (from earlier logs), I'll use it.
}

// Switching to use 'pg' for raw SQL execution as it's already in the project
const { Client } = require('pg');

async function runSQL() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to Database...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
                product_id UUID REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                status TEXT DEFAULT 'placed',
                created_at TIMESTAMPTZ DEFAULT now()
            );

            -- Enable RLS
            ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

            -- Cleanup existing policies if re-running
            DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
            DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

            -- Policy: Clients can view their own orders
            CREATE POLICY "Users can view their own orders" ON orders
            FOR SELECT TO authenticated
            USING (auth.uid() = user_id);

            -- Policy: Users can insert their own orders
            CREATE POLICY "Users can insert their own orders" ON orders
            FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = user_id);
        `);

        console.log('✅ Orders table created and RLS configured!');
    } catch (err) {
        console.error('❌ Error creating orders table:', err);
    } finally {
        await client.end();
    }
}

runSQL();
