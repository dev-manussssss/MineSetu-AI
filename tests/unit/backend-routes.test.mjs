/**
 * MineSetu AI — Deep Functional Backend Route Tests
 *
 * Verifies live functional behavior across all 6 backend serverless API endpoints:
 * 1. Auth (/api/v1/auth/[action])
 * 2. Documents (/api/v1/documents)
 * 3. Manual Records (/api/v1/manual-records)
 * 4. Information Requests (/api/v1/requests)
 * 5. Reviews (/api/v1/reviews)
 * 6. Reports (/api/v1/reports)
 *
 * Test cases cover:
 * - CORS preflight options & headers
 * - Missing/invalid authentication (401)
 * - Method not allowed enforcement (405)
 * - Route action dispatch and unknown actions (404)
 * - Demo mode persona switching and auth endpoints
 * - Validation of payload bounds, required fields, and schema constraints (400)
 * - Role permission enforcement and separation of duty (403)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_APP_DEMO_MODE = 'true';
process.env.VITE_APP_ENV = 'test';

// Helper to construct mock VercelRequest and VercelResponse
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
    getHeaders: () => headersSent,
    isEnded: () => ended,
  };

  return { req, res };
}

test('1. CORS: All handlers support OPTIONS preflight and allow standard headers', async () => {
  const handlers = [
    { name: 'documents', mod: await import('../../backend/functions/api/v1/documents.ts') },
    { name: 'manual-records', mod: await import('../../backend/functions/api/v1/manual-records.ts') },
    { name: 'requests', mod: await import('../../backend/functions/api/v1/requests.ts') },
    { name: 'reviews', mod: await import('../../backend/functions/api/v1/reviews.ts') },
    { name: 'reports', mod: await import('../../backend/functions/api/v1/reports.ts') },
  ];

  for (const { name, mod } of handlers) {
    const { req, res } = createMockReqRes({
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173' },
    });

    await mod.default(req, res);
    assert.equal(res.getStatus(), 204, `${name} must return 204 for OPTIONS`);
    assert.ok(res.getHeaders()['access-control-allow-origin'], `${name} must send Access-Control-Allow-Origin`);
    assert.match(res.getHeaders()['access-control-allow-headers'], /authorization/i, `${name} must allow Authorization header`);
  }
});

test('2. Authentication: Protected routes return 401 when Authorization header is missing', async () => {
  const routes = [
    { name: 'documents (list)', mod: await import('../../backend/functions/api/v1/documents.ts'), query: { action: 'list' } },
    { name: 'manual-records (list)', mod: await import('../../backend/functions/api/v1/manual-records.ts'), query: { action: 'list' } },
    { name: 'requests (list)', mod: await import('../../backend/functions/api/v1/requests.ts'), query: { action: 'list' } },
    { name: 'reviews (queue)', mod: await import('../../backend/functions/api/v1/reviews.ts'), query: { action: 'queue' } },
    { name: 'reports (list)', mod: await import('../../backend/functions/api/v1/reports.ts'), query: { action: 'list' } },
  ];

  for (const route of routes) {
    const { req, res } = createMockReqRes({
      method: 'GET',
      query: route.query,
      headers: {}, // No Authorization header
    });

    await route.mod.default(req, res);
    assert.equal(res.getStatus(), 401, `${route.name} must return 401 when unauthenticated`);
    const data = res.getData();
    assert.equal(data.ok, false, `${route.name} must indicate failure`);
    assert.match(data.error, /unauthorized/i, `${route.name} error message must indicate unauthorized`);
  }
});

test('3. Method Enforcement: Handlers return 405 on unsupported HTTP methods', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const manualRecords = await import('../../backend/functions/api/v1/manual-records.ts');
  const requests = await import('../../backend/functions/api/v1/requests.ts');

  // Documents 'list' expects GET, send POST
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'list' },
    });
    await documents.default(req, res);
    assert.equal(res.getStatus(), 405, 'Documents list must reject POST with 405');
  }

  // Manual-records 'create' expects POST, send GET
  {
    const { req, res } = createMockReqRes({
      method: 'GET',
      query: { action: 'create' },
    });
    await manualRecords.default(req, res);
    assert.equal(res.getStatus(), 405, 'Manual-records create must reject GET with 405');
  }

  // Requests 'create' expects POST, send DELETE
  {
    const { req, res } = createMockReqRes({
      method: 'DELETE',
      query: { action: 'create' },
    });
    await requests.default(req, res);
    assert.equal(res.getStatus(), 405, 'Requests create must reject DELETE with 405');
  }
});

test('4. Route Dispatch: Unknown actions return 404', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const manualRecords = await import('../../backend/functions/api/v1/manual-records.ts');
  const reports = await import('../../backend/functions/api/v1/reports.ts');

  {
    const { req, res } = createMockReqRes({
      method: 'GET',
      query: { action: 'non_existent_action' },
    });
    await documents.default(req, res);
    assert.equal(res.getStatus(), 404, 'Documents must return 404 for unknown action');
  }

  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'invalid_action' },
    });
    await manualRecords.default(req, res);
    assert.equal(res.getStatus(), 404, 'Manual records must return 404 for unknown action');
  }

  {
    const { req, res } = createMockReqRes({
      method: 'GET',
      query: { action: 'unknown_report_op' },
    });
    await reports.default(req, res);
    assert.equal(res.getStatus(), 404, 'Reports must return 404 for unknown action');
  }
});

test('5. Auth Endpoints: Logout and Login enforce credentials and token requirements', async () => {
  const authHandler = await import('../../backend/functions/api/v1/auth/[action].ts');

  // POST logout without token should return 401
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'logout' },
    });
    await authHandler.default(req, res);
    assert.equal(res.getStatus(), 401, 'Auth logout must return 401 without bearer token');
  }

  // POST login without body credentials should return 400
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'login' },
      body: {},
    });
    await authHandler.default(req, res);
    assert.equal(res.getStatus(), 400, 'Auth login must return 400 when email/password missing');
    assert.match(res.getData().error, /missing email or password/i);
  }

  // POST demo persona switch
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'demo' },
      body: { role: 'ministry_coal' },
    });
    await authHandler.default(req, res);
    assert.equal(res.getStatus(), 200, 'Demo switch must succeed in demo mode');
    const data = res.getData();
    assert.equal(data.ok, true);
    assert.equal(data.data.user.role, 'ministry_coal');
    assert.ok(data.data.permissions.includes('parliamentary.approve'));
  }
});

test('6. Input Validation: Manual records enforces category enum, required fields, and non-empty arrays', async () => {
  const manualRecords = await import('../../backend/functions/api/v1/manual-records.ts');

  // Missing title / category
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'create' },
      headers: { authorization: 'Bearer test-token-subsidiary_officer' },
      body: { reportingPeriod: '2026-03' },
    });
    await manualRecords.default(req, res);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getData().error, /missing required fields/i);
  }

  // Invalid category
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'create' },
      headers: { authorization: 'Bearer test-token-subsidiary_officer' },
      body: {
        title: 'Daily Coal Log',
        category: 'unsupported_category_xyz',
        reportingPeriod: '2026-03',
        fields: [{ fieldName: 'raw_coal_tonnes', value: 1200, unit: 'tonnes' }],
      },
    });
    await manualRecords.default(req, res);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getData().error, /invalid category/i);
  }

  // Empty fields array
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'create' },
      headers: { authorization: 'Bearer test-token-subsidiary_officer' },
      body: {
        title: 'Daily Coal Log',
        category: 'production',
        reportingPeriod: '2026-03',
        fields: [],
      },
    });
    await manualRecords.default(req, res);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getData().error, /at least one field is required/i);
  }
});

test('7. Input Validation: Information requests enforce subject, description, and target organization', async () => {
  const requests = await import('../../backend/functions/api/v1/requests.ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'create' },
    headers: { authorization: 'Bearer test-token-ministry_coal' },
    body: { subject: 'Overburden query' }, // missing description and recipientOrganizationId
  });

  await requests.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing required fields/i);
});

test('8. Role Enforcement: Subsidiary Officer cannot approve submissions (403 Forbidden)', async () => {
  const reviews = await import('../../backend/functions/api/v1/reviews.ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'approve' },
    headers: { authorization: 'Bearer test-token-subsidiary_officer' },
    body: { entityId: 'doc_123', entityType: 'document' },
  });

  await reviews.default(req, res);
  assert.equal(res.getStatus(), 403, 'Subsidiary officer must be forbidden from approving documents');
  assert.match(res.getData().error, /insufficient permission|forbidden/i);
});

test('9. Input Validation: Reports compilation requires valid reportId and schema inputs', async () => {
  const reports = await import('../../backend/functions/api/v1/reports.ts');

  // Missing fields on create
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'create' },
      headers: { authorization: 'Bearer test-token-cil_hq' },
      body: { title: 'Q4 National Coal Summary' },
    });
    await reports.default(req, res);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getData().error, /missing required fields/i);
  }

  // Missing reportId on compile
  {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'compile' },
      headers: { authorization: 'Bearer test-token-cil_hq' },
      body: {},
    });
    await reports.default(req, res);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getData().error, /missing reportid/i);
  }
});
