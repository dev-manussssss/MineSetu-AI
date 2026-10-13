import assert from 'node:assert';
import queryHandler from '../backend/functions/api/v1/query.ts';

function mockReq(body) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  };
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

async function runTest(query, context = {}) {
  const req = mockReq({ query, context });
  const res = mockRes();
  const fn = typeof queryHandler === 'function' ? queryHandler : queryHandler.default;
  await fn(req, res);
  return { status: res.statusCode, data: res.body?.data };
}

async function main() {
  console.log('=== VERIFYING LIVE SUPABASE RETRIEVAL IN QUERY ENDPOINT ===\n');

  // Test 1: Querying CIL statutory target
  console.log('Test 1: "What is the annual target of CIL?"');
  const t1 = await runTest('What is the annual target of CIL?');
  assert.strictEqual(t1.status, 200);
  assert.ok(t1.data.answer.includes('838'));
  assert.strictEqual(t1.data.retrievalMethod, 'live_supabase_sql_query');
  assert.strictEqual(t1.data.sources[0].tableReference, 'public.organizations table (Live Supabase PostgreSQL)');
  assert.strictEqual(t1.data.sources[0].documentId, '11111111-1111-1111-1111-111111111102');
  console.log('✔ Answer grounded in live Supabase public.organizations row:', t1.data.sources[0]);

  // Test 2: Querying SECL mines
  console.log('\nTest 2: "What mines does SECL operate?"');
  const t2 = await runTest('What mines does SECL operate?');
  assert.strictEqual(t2.status, 200);
  assert.ok(t2.data.answer.includes('Gevra Mega Open Cast Project'));
  assert.strictEqual(t2.data.retrievalMethod, 'live_supabase_sql_query');
  assert.strictEqual(t2.data.sources[0].tableReference, 'public.mines table (Live Supabase PostgreSQL)');
  assert.strictEqual(t2.data.sources[0].documentId, '22222222-2222-2222-2222-222222222202');
  console.log('✔ Answer grounded in live Supabase public.mines row:', t2.data.sources[0]);

  console.log('\nAll Live Database Query Endpoint Tests Passed Successfully!');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
