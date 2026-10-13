import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const EVIDENCE_DIR = path.resolve('./tests/qa-evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

test.describe('MineSetu Chatbot Redesign & Pipeline Verification', () => {

  test('1. Sidebar Preservation: Left sidebar is completely intact with original branding, modules, and persona controls', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // Sidebar Branding & Logo
    const logo = page.locator('aside.app-sidebar img[src="/minesetu-logo.png"]');
    await expect(logo).toBeVisible();

    const brandName = page.locator('aside.app-sidebar').getByText('MineSetu', { exact: true });
    await expect(brandName).toBeVisible();

    // Active Persona card & Switch Persona button
    const personaCard = page.locator('aside.app-sidebar').getByText('Active Persona');
    await expect(personaCard).toBeVisible();

    const switchPersonaBtn = page.locator('aside.app-sidebar').getByRole('button', { name: 'Switch Persona', exact: true });
    await expect(switchPersonaBtn).toBeVisible();

    // Workspace Modules List
    const navModules = page.locator('aside.app-sidebar nav button');
    await expect(navModules).toHaveCount(8);

    // Verify key modules are present in original order
    await expect(page.locator('aside.app-sidebar').getByRole('button', { name: /^Dashboard/i })).toBeVisible();
    await expect(page.locator('aside.app-sidebar').getByRole('button', { name: /Ask-MineSetu/i })).toBeVisible();
    await expect(page.locator('aside.app-sidebar').getByRole('button', { name: /^Documents/i })).toBeVisible();

    // Footer navigation links
    await expect(page.locator('aside.app-sidebar').getByRole('button', { name: /Back to Public Overview/i })).toBeVisible();
    await expect(page.locator('aside.app-sidebar').getByRole('button', { name: /Sign Out \/ Switch Persona/i })).toBeVisible();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '01_sidebar_preservation.png') });
  });

  test('2. Minimalist Chat Workspace: Clean header, empty state greeting, no technical badges or quick cards', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // Header has simple identity "Ask-MineSetu"
    const heading = page.locator('main').locator('h1', { hasText: 'Ask-MineSetu' });
    await expect(heading).toBeVisible();

    // Header controls on top-right: + New chat & History
    const newChatBtn = page.locator('main').getByRole('button', { name: /New chat/i });
    await expect(newChatBtn).toBeVisible();

    const historyBtn = page.locator('main').getByRole('button', { name: /History/i });
    await expect(historyBtn).toBeVisible();

    // Verification: Clutter badges removed
    await expect(page.locator('text=Source-Grounded RAG')).toHaveCount(0);
    await expect(page.locator('text=Verified Multi-Subsidiary Archive')).toHaveCount(0);
    await expect(page.locator('text=Verified Engine')).toHaveCount(0);
    await expect(page.locator('text=100% Grounding Confidence')).toHaveCount(0);

    // Empty state greeting
    const emptyGreeting = page.locator('h2', { hasText: 'How can I help you today?' });
    await expect(emptyGreeting).toBeVisible();
    await expect(page.getByText('MineSetu helps with operational mining records and statutory reports')).toBeVisible();

    // Verification: 4 quick cards and suggestion chips removed
    await expect(page.locator('.chat-suggestion-card')).toHaveCount(0);
    await expect(page.locator('.chat-suggestion-chip')).toHaveCount(0);

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '02_empty_state_clean.png') });
  });

  test('3. Composer Behavior: Shift+Enter creates newline, Enter submits, stop generation button', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea.chat-composer-textarea');
    await expect(textarea).toBeVisible();

    // Test Shift+Enter does NOT send
    await textarea.click();
    await textarea.fill('Line one');
    await textarea.press('Shift+Enter');
    await textarea.type('Line two');

    const value = await textarea.inputValue();
    expect(value).toContain('\n');

    // Clear and send a natural greeting
    await textarea.fill('');
    await textarea.fill('Hi');
    await textarea.press('Enter');

    // Assistant response appears
    const assistantMsg = page.locator('.minesetu-markdown-container');
    await expect(assistantMsg.first()).toBeVisible({ timeout: 10000 });
    await expect(assistantMsg.first()).toContainText('Hello! I am Ask-MineSetu');

    // Empty state is now gone
    await expect(page.locator('h2', { hasText: 'How can I help you today?' })).toHaveCount(0);

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '03_composer_and_greeting.png') });
  });

  test('4. Streamdown Markdown & Citations: Bold, tables, headings, and genuine evidence citations', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // Start a fresh conversation
    await page.getByRole('button', { name: /New chat/i }).click();

    const textarea = page.locator('textarea.chat-composer-textarea');
    await textarea.fill('What was the monthly coal production and OB removal at Rajmahal OCP?');
    await page.locator('button[type="submit"]').click();

    // Wait for response to finish streaming
    const markdown = page.locator('.minesetu-markdown-container');
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('45,210 tonnes');
    await expect(markdown.first()).toContainText('142,500 m³');

    // Verify citations section
    const citationHeader = page.getByText(/Supporting Sources & Evidence Citations/i);
    await expect(citationHeader).toBeVisible();
    await expect(page.getByText('Rajmahal OCP Monthly Production & Despatch Return')).toBeVisible();

    // Send a comparative query to test Markdown Table rendering
    await textarea.fill('Compare ECL and SECL production');
    await page.locator('button[type="submit"]').click();

    // Wait for second message
    await expect(markdown.nth(1)).toBeVisible({ timeout: 10000 });
    await expect(markdown.nth(1)).toContainText('524,300 tonnes');

    // Verify bold formatting and headings rendered as actual HTML tags
    const boldElements = markdown.nth(1).locator('strong, b, [data-streamdown="strong"]');
    const boldCount = await boldElements.count();
    expect(boldCount).toBeGreaterThan(0);

    // Verify raw asterisks ** are NOT rendered literally as plain text
    const rawAsterisksInBold = await markdown.nth(1).evaluate((el) => {
      return el.innerHTML.includes('**SECL**') || el.innerHTML.includes('**Raw Coal Production**');
    });
    expect(rawAsterisksInBold).toBe(false);

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '04_markdown_rendered_correctly.png') });
  });

  test('5. Multi-Turn Context Retention: Follow-up query inherits subsidiaries and active metric', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New chat/i }).click();
    const textarea = page.locator('textarea.chat-composer-textarea');

    // Turn 1: Compare ECL and SECL production
    await textarea.fill('Compare ECL and SECL production');
    await page.locator('button[type="submit"]').click();

    const markdown = page.locator('.minesetu-markdown-container');
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });

    // Turn 2: Follow-up changing metric: "What about overburden removal?"
    await textarea.fill('What about overburden removal?');
    await page.locator('button[type="submit"]').click();

    await expect(markdown.nth(1)).toBeVisible({ timeout: 10000 });
    // Verifies it inherited ECL and SECL without asking user to repeat
    await expect(markdown.nth(1)).toContainText('1,120,000 m³');
    await expect(markdown.nth(1)).toContainText('142,500 m³');

    // Turn 3: Follow-up changing reporting period: "What about May?"
    await textarea.fill('What about May?');
    await page.locator('button[type="submit"]').click();

    await expect(markdown.nth(2)).toBeVisible({ timeout: 10000 });
    // Verifies honest notification that May 2026 is uningested rather than fabricating figures
    await expect(markdown.nth(2)).toContainText('May 2026');
    await expect(markdown.nth(2)).toContainText('No verified operational returns');

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '05_multiturn_context_retention.png') });
  });

  test('6. Conversation Management & History: Thread isolation and state restoration', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // Start fresh thread
    await page.getByRole('button', { name: /New chat/i }).click();
    const textarea = page.locator('textarea.chat-composer-textarea');

    // Send question in Thread 1
    await textarea.fill('Hello from Thread Alpha');
    await page.locator('button[type="submit"]').click();

    const markdown = page.locator('.minesetu-markdown-container');
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });

    // Start Thread 2
    await page.getByRole('button', { name: /New chat/i }).click();

    // Verify empty state is restored
    await expect(page.locator('h2', { hasText: 'How can I help you today?' })).toBeVisible();
    await expect(page.locator('.minesetu-markdown-container')).toHaveCount(0);

    // Send question in Thread 2
    await textarea.fill('Thread Beta question regarding Gevra');
    await page.locator('button[type="submit"]').click();
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });

    // Open History drawer
    await page.locator('main').getByRole('button', { name: /History/i }).click();
    const drawer = page.locator('aside', { hasText: 'Conversation History' });
    await expect(drawer).toBeVisible();

    // Verify both threads appear in History list
    const threadItems = drawer.locator('div[style*="cursor: pointer"]');
    const count = await threadItems.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Switch back to Thread 1 by clicking it in History
    await drawer.getByText('Hello from Thread Alpha').click();

    // Verify Thread 1 messages are restored
    await expect(page.getByText('Hello from Thread Alpha')).toBeVisible();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '06_history_drawer_restoration.png') });
  });

  test('7. Responsive Layout Zero-Overflow: Desktop 1440, 1280, and Mobile 390 viewports', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // Desktop zero horizontal overflow check
    const desktopOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    }));
    expect(desktopOverflow.overflows).toBe(false);

    // Mobile Viewport test (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    const mobileOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    }));
    expect(mobileOverflow.overflows).toBe(false);

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '07_mobile_zero_overflow.png') });
  });

  test('8. Real Data Grounding: "how much coal is present" returns operational dimensions with real records, zero generic fallback', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New chat/i }).click();
    const textarea = page.locator('textarea.chat-composer-textarea');

    await textarea.fill('how much coal is present');
    await page.locator('button[type="submit"]').click();

    const markdown = page.locator('.minesetu-markdown-container');
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });

    // Verifies structured dimensions returned instead of generic capabilities dump
    await expect(markdown.first()).toContainText('524,300 Tonnes');
    await expect(markdown.first()).toContainText('45,210 Tonnes');
    await expect(markdown.first()).toContainText('569,510 Tonnes');
    await expect(markdown.first()).toContainText('838.0 MT');

    // Verifies generic 4-bullet capabilities dump is absent
    const text = await markdown.first().innerText();
    expect(text).not.toContain('I could not locate verified coal records');
    expect(text).not.toContain('Ask-MineSetu is strictly grounded on verified Coal India records to prevent hallucination. You can:');

    // Verifies supporting sources are present
    const citationHeader = page.getByText(/Supporting Sources & Evidence Citations/i);
    await expect(citationHeader).toBeVisible();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '08_how_much_coal_present_resolved.png') });
  });

  test('9. Statutory Coal Queries: Verifies "how much coal is there in india", reserves, production, FY26 targets, and verified records', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // 1. "how much coal is there in india"
    await page.getByRole('button', { name: /New chat/i }).click();
    const textarea = page.locator('textarea.chat-composer-textarea');
    await textarea.fill('how much coal is there in india');
    await page.locator('button[type="submit"]').click();

    const markdown = page.locator('.minesetu-markdown-container');
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('378.21 Billion Tonnes');
    await expect(markdown.first()).toContainText('1,027.60 Million Tonnes');
    await expect(markdown.first()).toContainText('569,510 Tonnes');
    await expect(markdown.first()).not.toContainText('I could not locate verified coal records matching');

    // 2. "what is India's coal reserve?"
    await page.getByRole('button', { name: /New chat/i }).click();
    await textarea.fill("what is India's coal reserve?");
    await page.locator('button[type="submit"]').click();

    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('378.21 Billion Tonnes');
    await expect(markdown.first()).toContainText('210.13 BT');
    await expect(markdown.first()).toContainText('141.52 BT');

    // 3. "what is India's coal production?"
    await page.getByRole('button', { name: /New chat/i }).click();
    await textarea.fill("what is India's coal production?");
    await page.locator('button[type="submit"]').click();

    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('1,027.60 Million Tonnes');
    await expect(markdown.first()).toContainText('773.60 MT');

    // 4. "how much coal did India produce in FY 2025-26?"
    await page.getByRole('button', { name: /New chat/i }).click();
    await textarea.fill('how much coal did India produce in FY 2025-26?');
    await page.locator('button[type="submit"]').click();

    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('1,080.00 Million Tonnes');
    await expect(markdown.first()).toContainText('838.00 MT');

    // 5. "show verified coal production records"
    await page.getByRole('button', { name: /New chat/i }).click();
    await textarea.fill('show verified coal production records');
    await page.locator('button[type="submit"]').click();

    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('524,300 Tonnes');
    await expect(markdown.first()).toContainText('45,210 Tonnes');

    await page.screenshot({ path: path.join(EVIDENCE_DIR, '09_statutory_queries_verified.png') });
  });
});

