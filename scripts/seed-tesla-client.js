const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const clientData = {
    name: 'Tesla',
    slug: 'tesla',
    email: 'tesla@brand.com',
    password: 'teslapassword123',
    primaryColor: '#e31937',
    marginPercent: 15,
    logoUrl: 'https://logo.clearbit.com/tesla.com'
};

const products = [
    { name: 'Model S Diecast', price: 250, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800' },
    { name: 'Tesla Desktop Supercharger', price: 45, image: 'https://images.unsplash.com/photo-1541888941294-631c8bb17d06?w=800' },
    { name: 'Cyberwhistle', price: 50, image: 'https://images.unsplash.com/photo-1662584196122-38379f85c319?w=800' }
];

async function seedTesla() {
    console.log(`🚀 Seeding client: ${clientData.name}...`);

    try {
        // 1. Create the Client
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .upsert({
                name: clientData.name,
                slug: clientData.slug,
                primary_color: clientData.primaryColor,
                margin_percent: clientData.marginPercent,
                logo_url: clientData.logoUrl
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (clientError) throw clientError;
        console.log(`✅ Client created/updated: ${client.name} (ID: ${client.id})`);

        // 2. Create the User in Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: clientData.email,
            password: clientData.password,
            email_confirm: true
        });

        let userId;
        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('ℹ️ User already exists in Auth. Fetching ID...');
                const { data: users } = await supabase.auth.admin.listUsers();
                userId = users.users.find(u => u.email === clientData.email).id;
            } else {
                throw authError;
            }
        } else {
            userId = authData.user.id;
            console.log(`✅ User created in Auth: ${clientData.email}`);
        }

        // 3. Create the Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                client_id: client.id
            });

        if (profileError) throw profileError;
        console.log('✅ Profile linked to client.');

        // 4. Create Products and assign them
        for (const p of products) {
            const { data: product, error: pError } = await supabase
                .from('products')
                .upsert({
                    name: p.name,
                    procurement_price: p.price,
                    image_url: p.image
                }, { onConflict: 'name' })
                .select()
                .single();

            if (pError) {
                console.warn(`⚠️ Warning creating product ${p.name}:`, pError.message);
                continue;
            }

            // Link to client
            await supabase
                .from('client_products')
                .upsert({
                    client_id: client.id,
                    product_id: product.id
                }, { onConflict: 'client_id,product_id' });
        }
        console.log(`✅ Seeded ${products.length} products and linked them to ${client.name}.`);

        console.log('\n--- CLIENT CREDENTIALS ---');
        console.log(`URL: http://localhost:3000/${clientData.slug}`);
        console.log(`Email: ${clientData.email}`);
        console.log(`Password: ${clientData.password}`);
        console.log('--------------------------');

    } catch (error) {
        console.error('❌ Error seeding Tesla:', error.message);
    }
}

seedTesla();
