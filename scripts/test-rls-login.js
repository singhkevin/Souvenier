const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testClientLogin() {
    const email = 'tesla@brand.com';
    const password = 'teslapassword123';

    console.log(`🔐 Attempting login with ANON key for ${email}...`);

    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('❌ Auth Error:', authError.message);
            return;
        }

        console.log('✅ Auth successful! User ID:', authData.user.id);

        // Try to fetch profile with the session
        console.log('👤 Attempting to fetch profile with JWT...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('client_id')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.error('❌ Profile Error (This is likely RLS):', profileError.message);
        } else {
            console.log('✅ Profile fetched successfully:', profile);
        }

        // Try to fetch client with the session
        if (profile?.client_id) {
            console.log('🏢 Attempting to fetch client with JWT...');
            const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('slug')
                .eq('id', profile.client_id)
                .single();

            if (clientError) {
                console.error('❌ Client Error (Likely RLS):', clientError.message);
            } else {
                console.log('✅ Client fetched successfully:', client);
            }
        }

    } catch (error) {
        console.error('❌ Unexpected Error:', error.message);
    }
}

testClientLogin();
