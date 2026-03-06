const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLogin() {
    const email = 'tesla@brand.com';

    console.log(`🔍 Checking user with email: ${email}...`);

    try {
        // 1. Check Auth User
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        const user = users.find(u => u.email === email);
        if (!user) {
            console.log('❌ User NOT found in Auth.');
            return;
        }
        console.log(`✅ User found in Auth. ID: ${user.id}`);

        // 2. Check Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.log('❌ Profile NOT found or error:', profileError.message);
        } else {
            console.log('✅ Profile found:', JSON.stringify(profile, null, 2));
        }

        // 3. Check Client
        if (profile && profile.client_id) {
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', profile.client_id)
                .single();

            if (clientError) {
                console.log('❌ Client NOT found or error:', clientError.message);
            } else {
                console.log('✅ Client found:', JSON.stringify(client, null, 2));
            }
        } else {
            console.log('⚠️ No client_id in profile.');
        }

    } catch (error) {
        console.error('❌ Error during debug:', error.message);
    }
}

debugLogin();
