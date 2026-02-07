const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgbtucpgofqjqioosoqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnYnR1Y3Bnb2ZxanFpb29zb3FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU5MTM2NiwiZXhwIjoyMDc1MTY3MzY2fQ.OKGJ8WPrZgiXHryHlyc14ju_wOaxhXXXGpa3QyBgL-A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Merchant Applications ---');
    const { data: apps, error: appsError } = await supabase
        .from('merchant_applications')
        .select('*')
        .limit(5);

    if (appsError) console.error('Error fetching apps:', appsError);
    else console.log(apps);

    console.log('\n--- Buckets ---');
    const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

    if (bucketsError) console.error('Error fetching buckets:', bucketsError);
    else console.log(buckets.map(b => b.name));

    if (apps && apps.length > 0) {
        const docUrl = apps[0].document_url;
        console.log('\nSample document_url:', docUrl);
        if (docUrl && !docUrl.startsWith('http')) {
            console.log('Testing generate signed URL for path:', docUrl);
            // Assume bucket is documents
            const { data: signed, error: signError } = await supabase
                .storage
                .from('documents')
                .createSignedUrl(docUrl, 60);
            if (signError) console.error('Error signing:', signError);
            else console.log('Signed URL:', signed);
        }
    }
}

inspect();
