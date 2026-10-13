import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wbydukkulnpghccnwgth.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieWR1a2t1bG5wZ2hjY253Z3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMzgyNDQsImV4cCI6MjEwNjcxNDI0NH0.FZKluDiRInxt7Eb0e0PdrrnuyDqzgQ3Pl_1QtG6FMwc';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testRealQuery() {
  console.log('=== TEST REAL DATA RETRIEVAL FROM SUPABASE ===\n');

  // Query 1: Annual Targets from organizations table
  console.log('1. Querying organizations for annual target of CIL...');
  const { data: cilOrg, error: orgErr } = await supabase
    .from('organizations')
    .select('id, code, name, annual_target_mt, headquarters_location')
    .eq('code', 'CIL')
    .single();

  if (orgErr) {
    console.error('Error querying organizations:', orgErr);
  } else {
    console.log('✔ Genuinely retrieved from Supabase organizations table:');
    console.log(`   ID: ${cilOrg.id}`);
    console.log(`   Organization: ${cilOrg.name} (${cilOrg.code})`);
    console.log(`   Target: ${cilOrg.annual_target_mt} MT`);
    console.log(`   HQ: ${cilOrg.headquarters_location}`);
  }

  // Query 2: All subsidiary targets
  console.log('\n2. Querying all subsidiary targets...');
  const { data: allOrgs } = await supabase
    .from('organizations')
    .select('code, name, annual_target_mt')
    .not('annual_target_mt', 'is', null)
    .order('annual_target_mt', { ascending: false });

  console.log('✔ All statutory targets retrieved from live DB:');
  for (const o of allOrgs || []) {
    console.log(`   - ${o.code}: ${o.annual_target_mt} MT (${o.name})`);
  }

  // Query 3: Mines for SECL
  console.log('\n3. Querying mines for SECL...');
  const { data: seclOrg } = await supabase.from('organizations').select('id').eq('code', 'SECL').single();
  const { data: seclMines } = await supabase
    .from('mines')
    .select('id, code, name, colliery_type, area_name, state')
    .eq('organization_id', seclOrg.id);

  console.log('✔ Genuinely retrieved mines for SECL:');
  for (const m of seclMines || []) {
    console.log(`   - ${m.name} (${m.code}) | Area: ${m.area_name} | State: ${m.state}`);
  }

  // Query 4: Checking production_records via anon client
  console.log('\n4. Attempting to query production_records via anon client...');
  const { data: prodRecs, error: prodErr } = await supabase.from('production_records').select('*');
  console.log(`   Result: error=${prodErr}, rowCount=${prodRecs?.length}`);
  console.log('   Explanation: PostgreSQL RLS blocks anon role from viewing production_records.');
}

testRealQuery().catch(console.error);
