const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// You will need to add DATABASE_URL to your .env.local
// Format: postgres://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL is not set in .env.local');
    console.log('You can find this in Supabase Dashboard -> Settings -> Database -> Connection String (URI)');
    process.exit(1);
}

const sql = `
-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#8b5cf6',
  margin_percent numeric DEFAULT 20
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  procurement_price numeric NOT NULL,
  image_url text
);

-- 4. Client-Product Junction Table
CREATE TABLE IF NOT EXISTS client_products (
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, product_id)
);

-- 5. Quote Requests Table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  product_id uuid REFERENCES products(id),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create Selection Policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can only view products assigned to their client'
    ) THEN
        CREATE POLICY "Users can only view products assigned to their client"
        ON products
        FOR SELECT
        TO authenticated
        USING (
          id IN (
            SELECT product_id
            FROM client_products cp
            JOIN profiles p ON p.client_id = cp.client_id
            WHERE p.id = auth.uid()
          )
        );
    END IF;
END $$;
`;

async function setup() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Successfully connected to Supabase PostgreSQL...');
        await client.query(sql);
        console.log('✅ Database schema initialized successfully!');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    } finally {
        await client.end();
    }
}

setup();
