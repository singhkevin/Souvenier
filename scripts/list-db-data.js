const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllData() {
    try {
        console.log('--- ALL CLIENTS ---');
        const { data: clients } = await supabase.from('clients').select('*');
        console.log(JSON.stringify(clients, null, 2));

        console.log('\n--- ALL PROFILES ---');
        const { data: profiles } = await supabase.from('profiles').select('*');
        console.log(JSON.stringify(profiles, null, 2));

        console.log('\n--- ALL AUTH USERS ---');
        const { data: users } = await supabase.auth.admin.listUsers();
        console.log(JSON.stringify(users.users.map(u => ({ id: u.id, email: u.email, metadata: u.user_metadata })), null, 2));

    } catch (error) {
        console.error('❌ Error listing data:', error.message);
    }
}

listAllData();
