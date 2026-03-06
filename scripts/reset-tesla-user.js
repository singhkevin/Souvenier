const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetTesla() {
    console.log('🔄 Resetting Tesla user...');
    try {
        const email = 'tesla@brand.com';
        const password = 'teslapassword123';

        // 1. Delete existing user if exists (to be sure)
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            await supabase.auth.admin.deleteUser(existingUser.id);
            console.log('🗑️ Deleted old Tesla user.');
        }

        // 2. Create fresh user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'client' }
        });

        if (createError) throw createError;
        console.log(`✅ Created fresh Tesla user: ${email}`);

        // 3. Ensure Client exists
        const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('slug', 'tesla')
            .single();

        if (!client) {
            console.error('❌ Tesla client record missing!');
            return;
        }

        // 4. Create Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                client_id: client.id
            });

        if (profileError) throw profileError;
        console.log('✅ Profile linked to Tesla client.');

        console.log('\n--- FRESH CREDENTIALS ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('--------------------------');

    } catch (error) {
        console.error('❌ Error resetting Tesla:', error.message);
    }
}

resetTesla();
