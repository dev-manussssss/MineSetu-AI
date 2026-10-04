import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS_DIR = path.resolve('backend/supabase/migrations');
const SEED_DIR = path.resolve('backend/supabase/seed');

test('Migration 001 exists and declares all required relational and vector tables', () => {
  const m1Path = path.join(MIGRATIONS_DIR, '20261005000001_core_schema.sql');
  assert.equal(fs.existsSync(m1Path), true, '001_core_schema.sql must exist');
  
  const content = fs.readFileSync(m1Path, 'utf8');
  const requiredTables = [
    'organizations',
    'mines',
    'profiles',
    'documents',
    'document_versions',
    'document_pages',
    'document_chunks',
    'extracted_records',
    'manual_records',
    'manual_record_fields',
    'production_records',
    'information_requests',
    'request_responses',
    'request_clarifications',
    'review_tasks',
    'discrepancies',
    'processing_jobs',
    'ai_queries',
    'retrieval_citations',
    'report_drafts',
    'report_exports',
    'topic_models',
    'topic_assignments',
    'data_sources',
    'audit_logs',
  ];

  for (const table of requiredTables) {
    assert.match(
      content,
      new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`, 'i'),
      `Table ${table} must be declared in core schema`
    );
  }

  // Check vector extension and column
  assert.match(content, /CREATE EXTENSION IF NOT EXISTS "vector"/i);
  assert.match(content, /embedding vector\(1536\)/i);
});

test('Migration 002 implements comprehensive RLS policies and tamper-evident audit logging', () => {
  const m2Path = path.join(MIGRATIONS_DIR, '20261005000002_rls_policies.sql');
  assert.equal(fs.existsSync(m2Path), true, '002_rls_policies.sql must exist');
  
  const content = fs.readFileSync(m2Path, 'utf8');

  // Verify RLS enabled on sensitive tables
  assert.match(content, /ALTER TABLE documents ENABLE ROW LEVEL SECURITY/i);
  assert.match(content, /ALTER TABLE production_records ENABLE ROW LEVEL SECURITY/i);
  assert.match(content, /ALTER TABLE manual_records ENABLE ROW LEVEL SECURITY/i);
  assert.match(content, /ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY/i);

  // Verify tamper-evident revokes
  assert.match(content, /REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon/i);

  // Verify separation of duty trigger
  assert.match(content, /CREATE OR REPLACE FUNCTION enforce_separation_of_duty/i);
  assert.match(content, /doc_uploader = NEW\.reviewer_id/i);
});

test('Migration 003 implements durable queue atomic claim with leases and hybrid search', () => {
  const m3Path = path.join(MIGRATIONS_DIR, '20261005000003_queue_and_functions.sql');
  assert.equal(fs.existsSync(m3Path), true, '003_queue_and_functions.sql must exist');

  const content = fs.readFileSync(m3Path, 'utf8');

  // Check atomic queue claim function
  assert.match(content, /CREATE OR REPLACE FUNCTION claim_processing_job/i);
  assert.match(content, /FOR UPDATE SKIP LOCKED/i);
  assert.match(content, /lease_timeout_seconds/i);
  assert.match(content, /locked_until/i);

  // Check queue lease renewal & failure functions
  assert.match(content, /CREATE OR REPLACE FUNCTION renew_processing_job_lease/i);
  assert.match(content, /CREATE OR REPLACE FUNCTION complete_processing_job/i);
  assert.match(content, /CREATE OR REPLACE FUNCTION fail_processing_job/i);

  // Check hybrid search function
  assert.match(content, /CREATE OR REPLACE FUNCTION search_document_chunks/i);
  assert.match(content, /dc\.embedding <=> p_query_embedding/i);
  assert.match(content, /0\.7 \+ COALESCE\(k\.rank, 0\.0\) \* 0\.3/i);
});

test('Seed file initializes the 4 approved prototype personas and coal sector hierarchy', () => {
  const seedPath = path.join(SEED_DIR, '01_seed_data.sql');
  assert.equal(fs.existsSync(seedPath), true, '01_seed_data.sql must exist');

  const content = fs.readFileSync(seedPath, 'utf8');

  // Verify approved personas
  assert.match(content, /ministry_coal/);
  assert.match(content, /cil_hq/);
  assert.match(content, /cmpdi/);
  assert.match(content, /subsidiary_officer/);

  // Verify demo emails
  assert.match(content, /ministry\.exec@demo\.coal\.gov\.in/);
  assert.match(content, /cil\.director@demo\.coalindia\.in/);
  assert.match(content, /cmpdi\.nodal@demo\.cmpdi\.co\.in/);
  assert.match(content, /ecl\.officer@demo\.easterncoal\.gov\.in/);

  // Verify operational organizations
  assert.match(content, /'MoC'/);
  assert.match(content, /'CIL'/);
  assert.match(content, /'ECL'/);
  assert.match(content, /'SECL'/);
  assert.match(content, /'BCCL'/);
  assert.match(content, /'CMPDI'/);
});
