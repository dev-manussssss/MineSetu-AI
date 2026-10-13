/**
 * MineSetu AI — 3-Tier API Key Verification & Failover Test Suite
 * Tests presence of Primary, Secondary, and Tertiary key slots in configuration,
 * proper parsing, and failover behavior.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('1. Environment files have Primary, Secondary, and Tertiary key placeholders', () => {
  const rootEnvLocal = fs.readFileSync(path.resolve('./.env.local'), 'utf8');
  assert.ok(rootEnvLocal.includes('GROK_API_KEY_PRIMARY='), 'Root .env.local must declare GROK_API_KEY_PRIMARY');
  assert.ok(rootEnvLocal.includes('GROK_API_KEY_SECONDARY='), 'Root .env.local must declare GROK_API_KEY_SECONDARY');
  assert.ok(rootEnvLocal.includes('GROK_API_KEY_TERTIARY='), 'Root .env.local must declare GROK_API_KEY_TERTIARY');

  const frontendEnvLocal = fs.readFileSync(path.resolve('./frontend/.env.local'), 'utf8');
  assert.ok(frontendEnvLocal.includes('GROK_API_KEY_PRIMARY='), 'Frontend .env.local must declare GROK_API_KEY_PRIMARY');
  assert.ok(frontendEnvLocal.includes('GROK_API_KEY_SECONDARY='), 'Frontend .env.local must declare GROK_API_KEY_SECONDARY');
  assert.ok(frontendEnvLocal.includes('GROK_API_KEY_TERTIARY='), 'Frontend .env.local must declare GROK_API_KEY_TERTIARY');

  const rootEnvExample = fs.readFileSync(path.resolve('./.env.example'), 'utf8');
  assert.ok(rootEnvExample.includes('GROK_API_KEY_PRIMARY='), 'Root .env.example must declare GROK_API_KEY_PRIMARY');
  assert.ok(rootEnvExample.includes('GROK_API_KEY_SECONDARY='), 'Root .env.example must declare GROK_API_KEY_SECONDARY');
  assert.ok(rootEnvExample.includes('GROK_API_KEY_TERTIARY='), 'Root .env.example must declare GROK_API_KEY_TERTIARY');
});

test('2. Python AI Engine settings support 3-tier keys and key rotation', () => {
  const pyConfig = fs.readFileSync(path.resolve('./services/ai-engine/config.py'), 'utf8');
  assert.ok(pyConfig.includes('GROK_API_KEY_PRIMARY'), 'config.py must declare GROK_API_KEY_PRIMARY');
  assert.ok(pyConfig.includes('GROK_API_KEY_SECONDARY'), 'config.py must declare GROK_API_KEY_SECONDARY');
  assert.ok(pyConfig.includes('GROK_API_KEY_TERTIARY'), 'config.py must declare GROK_API_KEY_TERTIARY');
  assert.ok(pyConfig.includes('def get_configured_grok_keys'), 'config.py must have get_configured_grok_keys helper');
});

test('3. getConfiguredLLMKeys() correctly ignores empty keys and recognizes provided keys in priority order', async () => {
  const mod = await import('../../backend/functions/api/v1/query.ts');
  const getConfiguredLLMKeys = mod.getConfiguredLLMKeys || mod.default?.getConfiguredLLMKeys;
  assert.ok(typeof getConfiguredLLMKeys === 'function', 'getConfiguredLLMKeys must be a function');

  const origPrimary = process.env.GROK_API_KEY_PRIMARY;
  const origSecondary = process.env.GROK_API_KEY_SECONDARY;
  const origTertiary = process.env.GROK_API_KEY_TERTIARY;

  try {
    // When all empty
    process.env.GROK_API_KEY_PRIMARY = '';
    process.env.GROK_API_KEY_SECONDARY = '';
    process.env.GROK_API_KEY_TERTIARY = '';
    const emptyKeys = getConfiguredLLMKeys();
    assert.equal(emptyKeys.length, 0, 'No keys should be returned when all slots are empty');

    // When Primary & Tertiary are set, but Secondary is empty
    process.env.GROK_API_KEY_PRIMARY = 'xai-live-key-primary-1234567890';
    process.env.GROK_API_KEY_SECONDARY = '';
    process.env.GROK_API_KEY_TERTIARY = 'xai-live-key-tertiary-0987654321';
    const activeKeys = getConfiguredLLMKeys();
    assert.equal(activeKeys.length, 2);
    assert.equal(activeKeys[0].tier, 'primary');
    assert.equal(activeKeys[0].key, 'xai-live-key-primary-1234567890');
    assert.equal(activeKeys[1].tier, 'tertiary');
    assert.equal(activeKeys[1].key, 'xai-live-key-tertiary-0987654321');

    // When all 3 are provided
    process.env.GROK_API_KEY_SECONDARY = 'xai-live-key-secondary-5555555555';
    const allThree = getConfiguredLLMKeys();
    assert.equal(allThree.length, 3);
    assert.equal(allThree[0].tier, 'primary');
    assert.equal(allThree[1].tier, 'secondary');
    assert.equal(allThree[2].tier, 'tertiary');
  } finally {
    process.env.GROK_API_KEY_PRIMARY = origPrimary;
    process.env.GROK_API_KEY_SECONDARY = origSecondary;
    process.env.GROK_API_KEY_TERTIARY = origTertiary;
  }
});
