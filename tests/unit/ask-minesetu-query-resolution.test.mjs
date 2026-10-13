/**
 * MineSetu AI — Ask-MineSetu Query Resolution & Metric Disambiguation Tests
 *
 * Verifies all 8 target query variations:
 * 1. "how much coal is there in india" -> Multi-dimensional statutory breakdown
 * 2. "how much coal is present" -> Multi-dimensional operational breakdown & clarification
 * 3. "what is India's coal production?" -> National annual production (1,027.60 MT FY25, 1,080 MT FY26 target)
 * 4. "what is India's coal reserve?" -> National geological reserves (378.21 BT total, 210.13 BT proved)
 * 5. "how much coal did India produce in FY 2025-26?" -> FY 2025-26 targets and preceding benchmarks
 * 6. "show verified coal production records" -> Comprehensive verified colliery inventory
 * 7. Known colliery queries ("What was the coal production of Rajmahal in August 2026?")
 * 8. Known uningested period queries ("What about May 2026?", "What was the production in May 2025?")
 *
 * Enforces:
 * - Metric separation: Geological reserves, national production, stocks, and colliery extraction are distinct.
 * - Absence of generic 4-bullet capabilities dump across all queries.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_APP_DEMO_MODE = 'true';
process.env.VITE_APP_ENV = 'test';

async function getQueryHandler() {
  const mod = await import('../../backend/functions/api/v1/query.ts');
  return mod.default || mod;
}

function createMockReqRes({ query, context = { subsidiaries: [], reportingYear: 2026 } }) {
  const req = {
    method: 'POST',
    query: {},
    body: { query, context },
    headers: { authorization: 'Bearer demo-token-cil_hq' },
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    statusCode,
    status(code) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    setHeader() {
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

const FORBIDDEN_GENERIC_DUMP = /Ask-MineSetu is strictly grounded on verified Coal India records to prevent hallucination\. You can:/;

test('Query 1: "how much coal is there in india" resolves multi-dimensional statutory breakdown', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'how much coal is there in india' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');
  assert.ok(data.confidence >= 0.95);
  assert.equal(data.retrievalMethod, 'multi_dimensional_national_synthesis');

  // Verify all 4 statutory dimensions are present
  assert.match(data.answer, /378\.21 Billion Tonnes/i); // 1. Geological Reserves
  assert.match(data.answer, /1,027\.60 Million Tonnes/i); // 2. FY 2024-25 Production
  assert.match(data.answer, /1,080(\.00)? MT/i); // 2b. FY 2025-26 Target
  assert.match(data.answer, /47\.2 MT/i); // 3. Pithead Stock
  assert.match(data.answer, /569,510 Tonnes/i); // 4. MineSetu Ingested Colliery Returns

  // Verify sources
  assert.ok(data.sources.length >= 3);
  assert.ok(data.sources.some(s => s.documentId === 'doc-cco-reserves-2024'));
  assert.ok(data.sources.some(s => s.documentId === 'doc-moc-prod-2025'));

  // Ensure generic capabilities dump is ABSENT
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 2: "how much coal is present" returns dimensional clarification with real data', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'how much coal is present' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');

  // Must present distinct operational and geological dimensions
  assert.match(data.answer, /524,300 Tonnes/i); // SECL Gevra
  assert.match(data.answer, /45,210 Tonnes/i); // ECL Rajmahal
  assert.match(data.answer, /569,510 Tonnes/i); // Monitored total
  assert.match(data.answer, /838(\.0)? MT/i); // CIL Target
  assert.match(data.answer, /378\.21 Billion Tonnes/i); // Geological Reserves

  // Ensure generic capabilities dump is ABSENT
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 3: "what is India\'s coal production?" retrieves national production figures and citations', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: "what is India's coal production?" });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');
  assert.equal(data.retrievalMethod, 'national_production_retrieval');

  // Verify All-India production numbers
  assert.match(data.answer, /1,027\.60 Million Tonnes/i);
  assert.match(data.answer, /773\.60 MT/i); // CIL share
  assert.match(data.answer, /1,080(\.00)? MT/i); // FY 2025-26 target
  assert.match(data.answer, /distinct from cumulative geological resources \(378\.21 BT\)/i);

  // Sources cited
  assert.ok(data.sources.some(s => s.documentId === 'doc-moc-prod-2025'));
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 4: "what is India\'s coal reserve?" retrieves GSI/CCO national geological inventory', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: "what is India's coal reserve?" });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');
  assert.equal(data.retrievalMethod, 'geological_reserves_inventory');

  // Verify statutory reserve figures
  assert.match(data.answer, /378\.21 Billion Tonnes/i);
  assert.match(data.answer, /210\.13 BT/i); // Proved
  assert.match(data.answer, /141\.52 BT/i); // Indicated
  assert.match(data.answer, /26\.56 BT/i); // Inferred
  assert.match(data.answer, /Odisha.*88\.4 BT/i);
  assert.match(data.answer, /Jharkhand.*86\.2 BT/i);
  assert.match(data.answer, /must not be confused with annual extraction output/i);

  // Sources cited
  assert.ok(data.sources.some(s => s.documentId === 'doc-cco-reserves-2024'));
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 5: "how much coal did India produce in FY 2025-26?" handles current fiscal year target & actuals', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'how much coal did India produce in FY 2025-26?' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');
  assert.equal(data.retrievalMethod, 'fy_target_and_pacing_retrieval');

  // Explains FY 2025-26 targets
  assert.match(data.answer, /1,080(\.00)? Million Tonnes/i); // All-India Target
  assert.match(data.answer, /838(\.00)? MT/i); // CIL Target
  assert.match(data.answer, /197\.0 MT/i); // SECL Target
  assert.match(data.answer, /1,027\.60 MT/i); // Preceding FY 24-25 actual

  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 6: "show verified coal production records" returns comprehensive colliery inventory', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'show verified coal production records' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');
  assert.equal(data.retrievalMethod, 'verified_inventory_lookup');

  // Verify all verified operational collieries in table
  assert.match(data.answer, /Gevra Mega Project/i);
  assert.match(data.answer, /524,300 Tonnes/i);
  assert.match(data.answer, /Rajmahal OCP/i);
  assert.match(data.answer, /45,210 Tonnes/i);
  assert.match(data.answer, /Piparwar OCP/i);
  assert.match(data.answer, /Moonidih UG/i);
  assert.match(data.answer, /Jayant OCP/i);
  assert.match(data.answer, /569,510 Tonnes/i);

  assert.ok(data.sources.length >= 4);
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 7: Known mine query for Rajmahal OCP retrieves verified document data', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'What was the coal production of Rajmahal in August 2026?' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'sufficient');
  assert.match(data.answer, /45,210 tonnes/i);
  assert.match(data.answer, /142,500 m³/i);
  assert.ok(data.sources.some(s => s.subsidiary === 'ECL' && s.documentId === 'doc-ecl-001'));
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 8: Known uningested period "What about May 2026?" returns honest insufficient without capabilities dump', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'What about production in May 2026?' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'insufficient');
  assert.equal(data.sources.length, 0);

  // Honest explanation of absent period and what IS available
  assert.match(data.answer, /No verified operational returns for \*\*May 2026\*\*/i);
  assert.match(data.answer, /Rajmahal OCP – Aug 2026/i);
  assert.match(data.answer, /Gevra Mega Project – Sep 2026/i);

  // Absolute verification that generic 4-bullet capabilities dump is absent
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Query 8b: Known uningested period "What was the production in May 2025?" returns honest insufficient', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'What was the production in May 2025?' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'insufficient');
  assert.match(data.answer, /No verified operational returns for \*\*May 2025\*\*/i);
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});

test('Ordinary unmatched query returns honest explanation without generic 4-bullet capabilities dump', async () => {
  const queryHandler = await getQueryHandler();
  const { req, res } = createMockReqRes({ query: 'What is the excavation volume of the Martian Crater Mine?' });

  await queryHandler(req, res);
  assert.equal(res.getStatus(), 200);

  const data = res.getData().data;
  assert.equal(data.status, 'insufficient');
  assert.match(data.answer, /I could not locate verified coal records matching "What is the excavation volume of the Martian Crater Mine\?" in the current archive\./i);
  assert.match(data.answer, /Searched entity and metric filters/i);

  // Absolute verification: generic capabilities dump is eliminated
  assert.doesNotMatch(data.answer, FORBIDDEN_GENERIC_DUMP);
});
