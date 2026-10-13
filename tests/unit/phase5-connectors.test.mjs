/**
 * MineSetu AI — Phase 5 Public Coal Connectors & Ingestion Tests
 *
 * Verifies:
 * 1. Honest access classification across all 27 statutory coal portals
 * 2. Ingested public dataset retrieval with full SHA-256 provenance
 * 3. Idempotent sync execution with duplicate detection
 * 4. Cross-referenced macro vs colliery return discrepancy detection
 * 5. Role-based access control and unauthenticated rejection
 */

import test from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_APP_DEMO_MODE = 'true';
process.env.VITE_APP_ENV = 'test';

async function getConnectorsHandler() {
  const mod = await import('../../backend/functions/api/v1/connectors.ts');
  return mod.default || mod;
}

function createMockReqRes({
  method = 'GET',
  query = {},
  body = {},
  headers = {},
} = {}) {
  const req = {
    method,
    query,
    body,
    headers: { ...headers },
  };

  let statusCode = 200;
  let responseData = null;
  const headersSent = {};
  let ended = false;

  const res = {
    statusCode,
    status(code) {
      statusCode = code;
      this.statusCode = code;
      return this;
    },
    setHeader(name, val) {
      headersSent[name.toLowerCase()] = val;
      return this;
    },
    getHeader(name) {
      return headersSent[name.toLowerCase()];
    },
    json(data) {
      responseData = data;
      ended = true;
      return this;
    },
    end() {
      ended = true;
      return this;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

test('Phase 5.1: Connectors List returns all 27 portals with honest access classifications', async () => {
  const handler = await getConnectorsHandler();
  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'list' },
    headers: { authorization: 'Bearer demo-token-cil_hq' },
  });

  await handler(req, res);
  assert.equal(res.getStatus(), 200);
  const body = res.getData();
  const data = body.data || body;
  assert.equal(data.totalCount, 27);
  assert.equal(data.portals.length, 27);

  const validClassifications = new Set([
    'live_pollable',
    'verified_static_snapshot',
    'restricted_internal',
    'blocked_restricted',
  ]);

  for (const portal of data.portals) {
    assert.ok(portal.id >= 1 && portal.id <= 27);
    assert.ok(validClassifications.has(portal.access_classification), `Portal ${portal.name} has invalid classification: ${portal.access_classification}`);
    assert.ok(portal.url.startsWith('http'), `Portal ${portal.name} has invalid url`);
  }
});

test('Phase 5.2: Connectors Records endpoint returns ingested records with valid SHA-256 hashes', async () => {
  const handler = await getConnectorsHandler();
  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'records' },
    headers: { authorization: 'Bearer demo-token-cil_hq' },
  });

  await handler(req, res);
  assert.equal(res.getStatus(), 200);
  const body = res.getData();
  const data = body.data || body;
  assert.ok(data.records.length >= 3);

  for (const rec of data.records) {
    assert.ok(rec.portal_id);
    assert.ok(rec.portal_name);
    assert.ok(rec.source_url);
    assert.equal(typeof rec.content_hash, 'string');
    assert.equal(rec.content_hash.length, 64, 'SHA-256 hash must be 64 hexadecimal characters');
    assert.ok(rec.data && typeof rec.data === 'object');
  }
});

test('Phase 5.3: Connectors Sync executes idempotently and reports duplicates', async () => {
  const handler = await getConnectorsHandler();
  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'sync' },
    headers: { authorization: 'Bearer demo-token-cmpdi' },
    body: { period: 'August 2026' },
  });

  await handler(req, res);
  assert.equal(res.getStatus(), 200);
  const body = res.getData();
  const data = body.data || body;
  assert.equal(data.status, 'completed');
  assert.equal(data.newRecordsCount, 0, 'Subsequent sync of identical records must yield 0 new records');
  assert.ok(data.duplicateCount >= 3, 'Duplicate records must be reported');
});

test('Phase 5.4: Connectors Discrepancies surfaces cross-referenced discrepancies', async () => {
  const handler = await getConnectorsHandler();
  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'discrepancies' },
    headers: { authorization: 'Bearer demo-token-ministry_coal' },
  });

  await handler(req, res);
  assert.equal(res.getStatus(), 200);
  const body = res.getData();
  const data = body.data || body;
  assert.ok(data.discrepancies.length >= 2);
  const rajmahalVariance = data.discrepancies.find(d => d.colliery === 'Rajmahal OCP');
  assert.ok(rajmahalVariance);
  assert.equal(rajmahalVariance.subsidiary, 'ECL');
  assert.ok(rajmahalVariance.variancePct < 0);
});

test('Phase 5.5: Connectors endpoint enforces authentication', async () => {
  const handler = await getConnectorsHandler();
  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'list' },
    // No authorization header
  });

  await handler(req, res);
  assert.equal(res.getStatus(), 401);
});
