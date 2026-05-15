const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('research_history')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log('Columns available in research_history:', Object.keys(data[0] || {}));
}

checkSchema();
