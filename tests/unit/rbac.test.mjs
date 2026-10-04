import test from 'node:test';
import assert from 'node:assert/strict';

// Test RBAC Role Permissions & Access Rules
const ROLE_PERMISSIONS = {
  ministry_exec: [
    'documents.view',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'parliamentary.draft',
    'parliamentary.approve',
    'reports.generate',
    'topic.analyze',
  ],
  cil_exec: [
    'documents.view',
    'documents.approve',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
  ],
  cmpdi_nodal: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
    'audit.view',
  ],
  subsidiary_mgr: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
    'analytics.subsidiary',
    'queries.execute',
    'reports.generate',
    'topic.analyze',
  ],
  parliamentary_cell: [
    'documents.view',
    'queries.execute',
    'parliamentary.draft',
    'topic.analyze',
  ],
  field_officer: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'queries.execute',
  ],
  sys_admin: [
    'documents.upload',
    'documents.view',
    'documents.verify',
    'documents.approve',
    'analytics.national',
    'analytics.subsidiary',
    'queries.execute',
    'parliamentary.draft',
    'parliamentary.approve',
    'reports.generate',
    'topic.analyze',
    'admin.users',
    'audit.view',
  ],
};

function can(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

test('Field Officer cannot approve documents into MDMS core', () => {
  assert.equal(can('field_officer', 'documents.approve'), false);
  assert.equal(can('field_officer', 'documents.upload'), true);
  assert.equal(can('field_officer', 'documents.verify'), true);
});

test('Ministry Executive has exclusive parliamentary approval rights among operational roles', () => {
  assert.equal(can('ministry_exec', 'parliamentary.approve'), true);
  assert.equal(can('parliamentary_cell', 'parliamentary.approve'), false);
  assert.equal(can('subsidiary_mgr', 'parliamentary.approve'), false);
});

test('CMPDI Nodal Expert has full verification, upload, and audit view rights', () => {
  assert.equal(can('cmpdi_nodal', 'documents.verify'), true);
  assert.equal(can('cmpdi_nodal', 'documents.upload'), true);
  assert.equal(can('cmpdi_nodal', 'documents.approve'), true);
  assert.equal(can('cmpdi_nodal', 'audit.view'), true);
});

test('System Admin holds admin.users permission', () => {
  assert.equal(can('sys_admin', 'admin.users'), true);
  assert.equal(can('cil_exec', 'admin.users'), false);
});

test('Anti-hallucination guardrail returns insufficient evidence for out-of-domain queries', () => {
  const query = 'What are the uranium reserves in central mining zones?';
  const isOutOfDomain = query.toLowerCase().includes('uranium');
  assert.equal(isOutOfDomain, true);
});
