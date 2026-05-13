
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl);
  // Try to fetch something from the auth API
  const { data, error } = await supabase.from('_non_existent_table_').select('*').limit(1);

  if (error && error.message.includes('Invalid API key')) {
    console.error('FAILED: Invalid API key');
  } else if (error) {
    console.log('API responded (Key is likely valid, error is just about table):', error.message);
  } else {
    console.log('Connection successful!');
  }
}

testConnection();
