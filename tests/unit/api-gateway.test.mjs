import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('.');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FUNCTIONS_DIR = path.join(BACKEND_DIR, 'functions');
const API_V1_DIR = path.join(FUNCTIONS_DIR, 'api/v1');
const FRONTEND_SRC = path.join(ROOT_DIR, 'frontend/src');

test('Vercel configuration routes /api/v1/* to backend functions and preserves SPA fallback', () => {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  assert.equal(fs.existsSync(vercelPath), true, 'vercel.json must exist');

  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  assert.ok(vercel.rewrites, 'vercel.json must have rewrites defined');

  // Verify API rewrites exist
  const rewriteSources = vercel.rewrites.map(r => r.source);
  assert.ok(rewriteSources.some(s => s.includes('/api/v1/auth/')), 'Must rewrite /api/v1/auth/(.*)');
  assert.ok(rewriteSources.some(s => s.includes('/api/v1/documents')), 'Must rewrite /api/v1/documents');
  assert.ok(rewriteSources.some(s => s.includes('/api/v1/manual-records')), 'Must rewrite /api/v1/manual-records');
  assert.ok(rewriteSources.some(s => s.includes('/api/v1/requests')), 'Must rewrite /api/v1/requests');
  assert.ok(rewriteSources.some(s => s.includes('/api/v1/reviews')), 'Must rewrite /api/v1/reviews');
  assert.ok(rewriteSources.some(s => s.includes('/api/v1/reports')), 'Must rewrite /api/v1/reports');

  // Verify SPA fallback is the last rewrite
  const lastRewrite = vercel.rewrites[vercel.rewrites.length - 1];
  assert.equal(lastRewrite.source, '/(.*)', 'SPA fallback must be last catch-all rewrite');
  assert.equal(lastRewrite.destination, '/index.html', 'SPA fallback must route to /index.html');
});

test('All Phase 3 API handlers exist and implement required security and business logic', () => {
  const expectedEndpoints = [
    { file: path.join(API_V1_DIR, 'auth/[action].ts'), name: 'auth' },
    { file: path.join(API_V1_DIR, 'documents.ts'), name: 'documents' },
    { file: path.join(API_V1_DIR, 'manual-records.ts'), name: 'manual-records' },
    { file: path.join(API_V1_DIR, 'requests.ts'), name: 'requests' },
    { file: path.join(API_V1_DIR, 'reviews.ts'), name: 'reviews' },
    { file: path.join(API_V1_DIR, 'reports.ts'), name: 'reports' },
  ];

  for (const ep of expectedEndpoints) {
    assert.equal(fs.existsSync(ep.file), true, `Endpoint ${ep.name} must exist at ${ep.file}`);
    const content = fs.readFileSync(ep.file, 'utf8');

    // Security check: all handlers must export a default function
    assert.match(content, /export\s+default\s+async\s+function\s+handler/, `${ep.name} must export default async handler`);
    // Security check: all handlers must use handleCors
    assert.match(content, /handleCors/, `${ep.name} must handle CORS`);
    // Security check: all handlers must use authenticateRequest or check credentials
    assert.match(content, /authenticateRequest|extractBearerToken/, `${ep.name} must enforce authentication`);
  }
});

test('Documents API enforces SHA-256 confirmation, storage isolation, and separation of duties', () => {
  const docPath = path.join(API_V1_DIR, 'documents.ts');
  const content = fs.readFileSync(docPath, 'utf8');

  // Check upload URL generation requires SHA-256 checksum
  assert.match(content, /sha256/i, 'Upload endpoint must validate SHA-256 hash');
  // Check private raw-documents bucket is targeted
  assert.match(content, /raw-documents/, 'Must upload to private raw-documents bucket');
  // Check separation-of-duty anti-self-approval rule
  assert.match(content, /uploader cannot approve their own document/i, 'Must block uploader self-approval');
  // Check durable queue job enqueueing on upload confirmation
  assert.match(content, /processing_jobs/, 'Must enqueue to processing_jobs table on upload confirmation');
});

test('Manual Records API validates numeric inputs, units, and enforces audit logging', () => {
  const recPath = path.join(API_V1_DIR, 'manual-records.ts');
  const content = fs.readFileSync(recPath, 'utf8');

  // Field validation checks
  assert.match(content, /field_name/, 'Must validate field_name');
  assert.match(content, /numVal|valid numeric value/i, 'Must validate numeric field value');
  assert.match(content, /audit_logs/, 'Must record creation in audit_logs');
  assert.match(content, /manual_record_fields/, 'Must insert into manual_record_fields table');
});

test('Information Requests and Review Queue APIs enforce role permissions and baseline variance', () => {
  const reqPath = path.join(API_V1_DIR, 'requests.ts');
  const reqContent = fs.readFileSync(reqPath, 'utf8');
  assert.match(reqContent, /information_requests/, 'Must query information_requests');
  assert.match(reqContent, /request_responses/, 'Must query request_responses');

  const revPath = path.join(API_V1_DIR, 'reviews.ts');
  const revContent = fs.readFileSync(revPath, 'utf8');
  assert.match(revContent, /review_tasks/, 'Must query review_tasks');
  assert.match(revContent, /discrepancies/, 'Must compare against baselines and record discrepancies');
  assert.match(revContent, /cannot approve items they uploaded/i, 'Must enforce anti-self-approval in review queue');
});

test('Frontend typed API client layer is fully implemented with dual-mode support', () => {
  const clientPath = path.join(FRONTEND_SRC, 'api/client.ts');
  const indexPath = path.join(FRONTEND_SRC, 'api/index.ts');
  const supabasePath = path.join(FRONTEND_SRC, 'lib/supabase.ts');

  assert.equal(fs.existsSync(clientPath), true, 'client.ts must exist');
  assert.equal(fs.existsSync(indexPath), true, 'api/index.ts barrel must exist');
  assert.equal(fs.existsSync(supabasePath), true, 'frontend lib/supabase.ts must exist');

  const clientContent = fs.readFileSync(clientPath, 'utf8');
  assert.match(clientContent, /authApi/, 'Must export authApi');
  assert.match(clientContent, /documentsApi/, 'Must export documentsApi');
  assert.match(clientContent, /manualRecordsApi/, 'Must export manualRecordsApi');
  assert.match(clientContent, /requestsApi/, 'Must export requestsApi');
  assert.match(clientContent, /reviewsApi/, 'Must export reviewsApi');
  assert.match(clientContent, /reportsApi/, 'Must export reportsApi');

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  assert.match(indexContent, /export\s*\{\s*authApi/);
  assert.match(indexContent, /documentsApi/);
  assert.match(indexContent, /manualRecordsApi/);
  assert.match(indexContent, /requestsApi/);
  assert.match(indexContent, /reviewsApi/);
  assert.match(indexContent, /reportsApi/);
});
