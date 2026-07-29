const { createClient } = require('@supabase/supabase-js');

const client = createClient(
    'https://xrctzuwumcypfvxlcnmk.supabase.co',
    'sb_secret_grHcbMy9X2p0Z6YTPMdx3g_2YXsGgE8'
);

async function test() {
    const { data, error } = await client
        .from('compliance_reports')
        .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            title: 'test',
            industry: 'Textile',
            country: 'Pakistan',
            status: 'generated',
            report_data: {}
        })
        .select()
        .single();

    console.log('Data:', JSON.stringify(data));
    console.log('Error:', JSON.stringify(error));
}

test();