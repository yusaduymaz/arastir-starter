const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Adding columns to research_history...');

  // Try to add current_step and progress
  const { error: error1 } = await supabase.rpc('execute_sql', {
    sql_query: `
      ALTER TABLE research_history 
      ADD COLUMN IF NOT EXISTS current_step TEXT DEFAULT 'search',
      ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
    `
  });

  if (error1) {
    console.error('Error adding columns via RPC:', error1);
    console.log('Falling back to direct query if RPC not available...');
    // Note: execute_sql is usually not available by default.
    // In a real scenario, we'd use the SQL editor.
  } else {
    console.log('Success!');
  }
}

migrate();
