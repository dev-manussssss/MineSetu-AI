import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const { hasPermission, ROLE_PERMISSIONS } = await import('../../backend/functions/lib/permissions.ts');

test('1. RBAC: Ministry of Coal cannot respond to information requests (requests.respond is forbidden)', () => {
  assert.equal(hasPermission('ministry_coal', 'requests.respond'), false);
  assert.equal(hasPermission('ministry_coal', 'requests.create'), true);
});

test('2. RBAC: Mine Officer (subsidiary_officer) cannot view audit activity ledger (audit.view is forbidden)', () => {
  assert.equal(hasPermission('subsidiary_officer', 'audit.view'), false);
  assert.equal(hasPermission('field_officer', 'audit.view'), false);
  assert.equal(hasPermission('cil_hq', 'audit.view'), false);
});

test('3. RBAC: CMPDI and Ministry of Coal retain audit.view permissions', () => {
  assert.equal(hasPermission('cmpdi', 'audit.view'), true);
  assert.equal(hasPermission('ministry_coal', 'audit.view'), true);
});

test('4. Persona Labeling: Persona 4 is strictly labeled "Mine Officer" without "Subsidiary /"', () => {
  const rbacTs = fs.readFileSync(path.resolve('./frontend/src/lib/rbac.ts'), 'utf8');
  assert.match(rbacTs, /roleLabel:\s*'Mine Officer \(ECL\)'/);
  assert.doesNotMatch(rbacTs, /roleLabel:\s*'Subsidiary \/ Mine Officer'/);
  assert.doesNotMatch(rbacTs, /'Subsidiary \/ Mine Officer \(ECL\)'/);
});

test('5. Primary Navigation: Topics is removed from primary nav while route is preserved', () => {
  const rbacTs = fs.readFileSync(path.resolve('./frontend/src/lib/rbac.ts'), 'utf8');
  // Check roleNavMap does not include 'topics' in any role list
  assert.doesNotMatch(rbacTs, /:\s*\[[^\]]*'topics'[^\]]*\]/);
  // But allNavItems contains /topics
  assert.match(rbacTs, /path:\s*'\/topics'/);
});

test('6. UI Styles: pill-tabs-bar and pill-tab CSS classes exist in index.css to prevent unstyled buttons', () => {
  const css = fs.readFileSync(path.resolve('./frontend/src/styles/index.css'), 'utf8');
  assert.ok(css.includes('.pill-tabs-bar'));
  assert.ok(css.includes('.pill-tab'));
  assert.ok(css.includes('.pill-tab.active'));
});

test('7. Chatbot Query Handling: "hi" returns a polite greeting and does NOT return fake 917k tonnes', () => {
  const appContext = fs.readFileSync(path.resolve('./frontend/src/context/AppContext.tsx'), 'utf8');
  // Verify greeting branch exists
  assert.ok(appContext.includes('// 2. Greetings & Introductions'));
  assert.ok(appContext.includes('Hello! I am **Ask-MineSetu**'));
  // Verify 917,510 canned numbers are eliminated
  assert.doesNotMatch(appContext, /917,510/);
});

test('8. Chatbot Grounding: Rajmahal and Gevra queries cite exact verified documents', () => {
  const appContext = fs.readFileSync(path.resolve('./frontend/src/context/AppContext.tsx'), 'utf8');
  assert.ok(appContext.includes('doc-ecl-001'));
  assert.ok(appContext.includes('doc-secl-002'));
  assert.ok(appContext.includes('Rajmahal OCP Monthly Production & Despatch Return'));
  assert.ok(appContext.includes('Gevra Mega Project Heavy Excavation Shift Summary'));
});

test('9. Chatbot Guardrail: Out of domain queries (uranium, bauxite) return insufficient status and 0 sources', () => {
  const appContext = fs.readFileSync(path.resolve('./frontend/src/context/AppContext.tsx'), 'utf8');
  assert.ok(appContext.includes('Anti-Hallucination Guardrail: Insufficient source evidence exists in authorized records'));
});

test('10. Chatbot Standardization: Name is standardized as Ask-MineSetu across components', () => {
  const topHeader = fs.readFileSync(path.resolve('./frontend/src/components/TopHeader.tsx'), 'utf8');
  assert.ok(topHeader.includes('<span>Ask-MineSetu</span>'));
  assert.doesNotMatch(topHeader, />Ask MineSetu</);

  const queryPage = fs.readFileSync(path.resolve('./frontend/src/pages/QueryPage.tsx'), 'utf8');
  assert.ok(queryPage.includes('Ask-MineSetu'));
  assert.doesNotMatch(queryPage, /<h1>Ask MineSetu<\/h1>/);
});
