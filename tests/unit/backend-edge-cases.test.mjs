/**
 * MineSetu AI — Deep Negative & Edge-Case Backend Route Tests
 *
 * Rigorous negative verification across all Vercel serverless API handlers:
 * - Malformed payloads, missing fields, out-of-range numerics
 * - File size boundary enforcement (negative, >10MB)
 * - MIME allowlisting and SHA-256 hash pattern verification
 * - Role-Based Access Control (RBAC) and Separation of Duty
 * - Entity type allowlisting and format bounds
 */

import test from 'node:test';
import assert from 'node:assert/strict';

process.env.VITE_APP_DEMO_MODE = 'true';
process.env.VITE_APP_ENV = 'test';

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

// ---------------------------------------------------------------------------
// 1. Documents API Negative & Edge Cases
// ---------------------------------------------------------------------------
test('Documents: Upload-intent rejects negative file size', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'upload-intent' },
    headers: { authorization: 'Bearer test-token-subsidiary_officer' },
    body: {
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: -500,
    },
  });

  await documents.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /invalid file size/i);
});

test('Documents: Upload-intent rejects file size exceeding 10MB limit', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'upload-intent' },
    headers: { authorization: 'Bearer test-token-subsidiary_officer' },
    body: {
      fileName: 'massive_file.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 15 * 1024 * 1024, // 15MB
    },
  });

  await documents.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /invalid file size/i);
});

test('Documents: Upload-intent rejects unauthorized executable MIME types', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const forbiddenMimes = ['application/x-msdownload', 'text/html', 'application/javascript', 'application/x-sh'];

  for (const mime of forbiddenMimes) {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'upload-intent' },
      headers: { authorization: 'Bearer test-token-subsidiary_officer' },
      body: {
        fileName: 'malicious.bin',
        mimeType: mime,
        fileSizeBytes: 1024,
      },
    });

    await documents.default(req, res);
    assert.equal(res.getStatus(), 400, `Must reject forbidden MIME: ${mime}`);
    assert.match(res.getData().error, /unsupported file type/i);
  }
});

test('Documents: Confirm rejects malformed SHA-256 hashes', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const malformedHashes = [
    'not-a-hash',
    '12345', // too short
    'g'.repeat(64), // invalid hex chars
    '1234567890abcdef'.repeat(5), // 80 chars, too long
  ];

  for (const hash of malformedHashes) {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'confirm' },
      headers: { authorization: 'Bearer test-token-subsidiary_officer' },
      body: {
        documentId: 'doc_test_123',
        sha256Hash: hash,
      },
    });

    await documents.default(req, res);
    assert.equal(res.getStatus(), 400, `Must reject invalid SHA-256: ${hash}`);
    assert.match(res.getData().error, /invalid sha-256 hash/i);
  }
});

test('Documents: Field update requires documentId, fieldId, and verifiedValue', async () => {
  const documents = await import('../../backend/functions/api/v1/documents.ts');
  const { req, res } = createMockReqRes({
    method: 'PATCH',
    query: { action: 'field' },
    headers: { authorization: 'Bearer test-token-cmpdi' },
    body: { documentId: 'doc_123' }, // missing fieldId and verifiedValue
  });

  await documents.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing documentid, fieldid, or verifiedvalue/i);
});

// ---------------------------------------------------------------------------
// 2. Manual Records API Negative & Edge Cases
// ---------------------------------------------------------------------------
test('Manual Records: Rejects non-finite numbers (NaN, Infinity)', async () => {
  const manualRecords = await import('../../backend/functions/api/v1/manual-records.ts');

  const invalidValues = ['not-a-number', Infinity, -Infinity, NaN];
  for (const val of invalidValues) {
    const { req, res } = createMockReqRes({
      method: 'POST',
      query: { action: 'create' },
      headers: { authorization: 'Bearer test-token-subsidiary_officer' },
      body: {
        title: 'Edge Case Production Log',
        category: 'production',
        reportingPeriod: '2026-04',
        fields: [{ fieldName: 'coal_tonnes', value: val, unit: 'tonnes' }],
      },
    });

    await manualRecords.default(req, res);
    assert.equal(res.getStatus(), 400, `Must reject invalid value: ${val}`);
    assert.match(res.getData().error, /numeric value/i);
  }
});

test('Manual Records: Rejects numbers exceeding NUMERIC(14,3) precision', async () => {
  const manualRecords = await import('../../backend/functions/api/v1/manual-records.ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'create' },
    headers: { authorization: 'Bearer test-token-subsidiary_officer' },
    body: {
      title: 'Overflow Coal Log',
      category: 'production',
      reportingPeriod: '2026-04',
      fields: [{ fieldName: 'coal_tonnes', value: 999999999999999, unit: 'tonnes' }], // 15 digits
    },
  });

  await manualRecords.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /exceeds maximum allowed precision/i);
});

test('Manual Records: Get endpoint requires id query parameter', async () => {
  const manualRecords = await import('../../backend/functions/api/v1/manual-records.ts');

  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'get' }, // missing id
    headers: { authorization: 'Bearer test-token-subsidiary_officer' },
  });

  await manualRecords.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing record id/i);
});

// ---------------------------------------------------------------------------
// 3. Review Queue API Negative & Edge Cases
// ---------------------------------------------------------------------------
test('Reviews: Rejects unsupported entityType', async () => {
  const reviews = await import('../../backend/functions/api/v1/reviews.ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'approve' },
    headers: { authorization: 'Bearer test-token-cmpdi' },
    body: {
      entityId: 'ent_123',
      entityType: 'sql_table_injection',
    },
  });

  await reviews.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /invalid entitytype/i);
});

test('Reviews: Approve requires entityId', async () => {
  const reviews = await import('../../backend/functions/api/v1/reviews.ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'approve' },
    headers: { authorization: 'Bearer test-token-cmpdi' },
    body: {}, // missing entityId
  });

  await reviews.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing entityid/i);
});

test('Reviews: Get endpoint requires id query parameter', async () => {
  const reviews = await import('../../backend/functions/api/v1/reviews.ts');

  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'get' },
    headers: { authorization: 'Bearer test-token-cmpdi' },
  });

  await reviews.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing id/i);
});

// ---------------------------------------------------------------------------
// 4. Reports API Negative & Edge Cases
// ---------------------------------------------------------------------------
test('Reports: Create rejects unsupported output formats', async () => {
  const reports = await import('../../backend/functions/api/v1/reports.ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'create' },
    headers: { authorization: 'Bearer test-token-cil_hq' },
    body: {
      title: 'Invalid Format Report',
      reportType: 'operational_summary',
      reportingPeriod: '2026-Q1',
      outputFormats: ['pdf', 'tar.gz', 'exe'],
    },
  });

  await reports.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /unsupported format/i);
});

test('Reports: Download rejects invalid format parameter', async () => {
  const reports = await import('../../backend/functions/api/v1/reports.ts');

  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'download', id: 'rep_123', format: 'malicious_sh' },
    headers: { authorization: 'Bearer test-token-cil_hq' },
  });

  await reports.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /unsupported format/i);
});

test('Reports: Download requires report id', async () => {
  const reports = await import('../../backend/functions/api/v1/reports.ts');

  const { req, res } = createMockReqRes({
    method: 'GET',
    query: { action: 'download' },
    headers: { authorization: 'Bearer test-token-cil_hq' },
  });

  await reports.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing report id/i);
});

// ---------------------------------------------------------------------------
// 5. Auth API Edge Cases
// ---------------------------------------------------------------------------
test('Auth: Demo switch rejects unknown persona role', async () => {
  const auth = await import('../../backend/functions/api/v1/auth/[action].ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'demo' },
    body: { role: 'super_admin_hacker' },
  });

  await auth.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /invalid demo role/i);
});

test('Auth: Login rejects missing email or password', async () => {
  const auth = await import('../../backend/functions/api/v1/auth/[action].ts');

  const { req, res } = createMockReqRes({
    method: 'POST',
    query: { action: 'login' },
    body: { email: 'test@example.com' }, // missing password
  });

  await auth.default(req, res);
  assert.equal(res.getStatus(), 400);
  assert.match(res.getData().error, /missing email or password/i);
});
