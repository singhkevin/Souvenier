const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTesla() {
    console.log('🔄 Updating Tesla user...');
    try {
        const email = 'tesla@brand.com';
        const password = 'teslapassword123';

        // 1. Get user
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            console.log('❌ User not found. Creating...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'client' }
            });
            if (createError) throw createError;
            console.log('✅ Created user.');
        } else {
            // Update password and metadata
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                password,
                user_metadata: { role: 'client' }
            });
            if (updateError) throw updateError;
            console.log('✅ Updated password and metadata.');
        }

        // 2. Ensure Client exists
        const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('slug', 'tesla')
            .single();

        if (!client) {
            throw new Error('Tesla client missing from database.');
        }

        // 3. Sync Profile
        const finalUser = user || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email);
        await supabase.from('profiles').upsert({
            id: finalUser.id,
            client_id: client.id
        });
        console.log('✅ Profile synced.');

        console.log('\n--- VERIFIED CREDENTIALS ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('----------------------------');

    } catch (error) {
        console.error('❌ Error updating Tesla:', error.message);
    }
}

updateTesla();
