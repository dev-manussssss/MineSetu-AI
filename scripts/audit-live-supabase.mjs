import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wbydukkulnpghccnwgth.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieWR1a2t1bG5wZ2hjY253Z3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzgyNDQsImV4cCI6MjEwNjcxNDI0NH0.FZKluDiRInxt7Eb0e0PdrrnuyDqzgQ3Pl_1QtG6FMwc';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function checkTable(table) {
  const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' });
  return { table, error: error ? error.message : null, count, sample: data?.slice(0, 2) };
}

async function main() {
  console.log('=== AUDITING LIVE SUPABASE CONNECTION (ANON CLIENT) ===\n');
  const tables = ['organizations', 'mines', 'profiles', 'documents', 'production_records', 'extracted_records', 'data_sources'];
  for (const t of tables) {
    const res = await checkTable(t);
    console.log(`Table: ${res.table}`);
    if (res.error) {
      console.log(`  ERROR: ${res.error}`);
    } else {
      console.log(`  SUCCESS: ${res.count} rows returned`);
      if (res.sample && res.sample.length > 0) {
        console.log(`  SAMPLE:`, JSON.stringify(res.sample, null, 2));
      }
    }
    console.log('--------------------------------------------------');
  }
}

main().catch(console.error);
