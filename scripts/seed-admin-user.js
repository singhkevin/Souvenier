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

const adminEmail = 'admin@souvenier.com';
const adminPassword = 'adminpassword123';

async function seedAdmin() {
    console.log(`🚀 Seeding admin user: ${adminEmail}...`);

    try {
        // 1. Create the user in Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('ℹ️ Admin user already exists in Auth.');
            } else {
                throw authError;
            }
        } else {
            console.log('✅ Admin user created in Auth.');
        }

        // 2. We don't necessarily need a profile for the super admin, 
        // but if the system expects all users to have a profile, we should create one.
        // Let's check if there's a "System" client or similar.
        // For now, let's just create a profile without a client_id if possible, or link to a dummy client.

        const user = authData?.user || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === adminEmail);

        if (!user) {
            throw new Error('Could not find user after creation');
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                // client_id: null // Super admin doesn't belong to a client
            })
            .select()
            .single();

        if (profileError) {
            console.warn('⚠️ Profile creation warning:', profileError.message);
        } else {
            console.log('✅ Admin profile ensured.');
        }

        console.log('\n--- ADMIN CREDENTIALS ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`URL: http://localhost:3000/admin/login`);
        console.log('--------------------------');

    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
}

seedAdmin();
