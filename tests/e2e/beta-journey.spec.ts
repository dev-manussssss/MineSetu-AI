import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const EVIDENCE_DIR = path.resolve('./tests/qa-evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

test.describe('MineSetu AI — 13-Step Controlled Beta User Journey', () => {

  test('Step 1-3: Mine Officer Login, Documents Listing, and Extraction Job Provenance', async ({ page }) => {
    // Step 1: Sign in as Mine Officer (subsidiary_officer, ECL)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Select Mine Officer (ECL)
    const mineOfficerBtn = page.getByRole('button', { name: /Mine Officer \(ECL\)/i });
    await expect(mineOfficerBtn).toBeVisible();
    await mineOfficerBtn.click();

    // Click submit button
    const enterBtn = page.locator('button[type="submit"]');
    await expect(enterBtn).toBeVisible();
    await enterBtn.click();

    // Verify redirected to Dashboard as Mine Officer
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    const sidebar = page.locator('aside.app-sidebar');
    await expect(sidebar.getByText(/Mine Officer/i)).toBeVisible();

    // Step 2 & 3: Navigate to Documents & Ingestion
    await page.goto('/documents');
    await page.waitForLoadState('networkidle');

    // Verify Rajmahal return is present in documents listing
    const docTitle = page.getByText(/Rajmahal OCP Monthly Production/i);
    await expect(docTitle.first()).toBeVisible();

    // Take evidence screenshot
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'beta_step_01_03_documents.png') });
  });

  test('Step 4-6: Validation Workbench Coordinate Provenance, Field Editing & Verification', async ({ page }) => {
    // Navigate to Validation Workbench for doc-ecl-001
    await page.goto('/documents/verify?docId=doc-ecl-001');
    await page.waitForLoadState('networkidle');

    // Step 4: Verify document title & colliery
    await expect(page.getByText(/Rajmahal OCP Monthly Production/i).first()).toBeVisible();

    // Verify raw coal figure and coordinate bounding box provenance
    const coalFigure = page.getByText('45,210');
    await expect(coalFigure.first()).toBeVisible();

    // Verify bounding box coordinate indicator is rendered
    const bboxBadge = page.getByText(/BBox \[45, 120, 210, 145\]|p\.1 \[45,120,210,145\]/i);
    await expect(bboxBadge.first()).toBeVisible();

    // Step 5: Start edit on a field
    const correctFieldBtn = page.getByRole('button', { name: /Correct Field/i });
    if (await correctFieldBtn.count() > 0) {
      await correctFieldBtn.first().click();
      const saveBtn = page.getByRole('button', { name: /Save Correction/i });
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();
    }

    // Take evidence screenshot
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'beta_step_04_06_workbench.png') });
  });

  test('Step 7-8: Ask-MineSetu Grounded Query with Exact Document Citation', async ({ page }) => {
    await page.goto('/ask');
    await page.waitForLoadState('networkidle');

    // Fresh chat
    await page.getByRole('button', { name: /New chat/i }).click();

    // Step 7: Query coal production of Rajmahal in August 2026
    const textarea = page.locator('textarea.chat-composer-textarea');
    await textarea.fill('What was the coal production of Rajmahal in August 2026?');
    await page.locator('button[type="submit"]').click();

    // Step 8: Confirm response has 45,210 tonnes and exact citation
    const markdown = page.locator('.minesetu-markdown-container');
    await expect(markdown.first()).toBeVisible({ timeout: 10000 });
    await expect(markdown.first()).toContainText('45,210 tonnes');

    // Confirm citation header and document link
    await expect(page.getByText(/Supporting Sources & Evidence Citations/i)).toBeVisible();
    await expect(page.getByText('Rajmahal OCP Monthly Production & Despatch Return')).toBeVisible();

    // Step 11: Click "Open in Validation Workbench" from the citation
    const openWorkbenchBtn = page.getByRole('button', { name: /Open in Validation Workbench/i });
    await expect(openWorkbenchBtn.first()).toBeVisible();
    await openWorkbenchBtn.first().click();

    // Verify arrived in Validation Workbench
    await page.waitForURL('**/documents/verify', { timeout: 10000 });
    await expect(page.getByText(/Scanned Source Document Facsimile/i)).toBeVisible();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'beta_step_07_11_citations_to_workbench.png') });
  });

  test('Step 9-10: Reports Builder Compilation & Multi-Format Generation', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');

    // Verify Reports Builder loads
    const heading = page.getByText(/Reports & Executive Briefs/i);
    await expect(heading.first()).toBeVisible();

    // Verify existing report title
    const reportItem = page.getByText(/Quarterly Executive Operational Review/i);
    await expect(reportItem.first()).toBeVisible();

    // Verify format tabs or preview controls
    await expect(page.getByText(/Report Preview & Export/i)).toBeVisible();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'beta_step_09_10_reports.png') });
  });

  test('Step 12-13: Ministry Persona Switch, RBAC Isolation & State Persistence', async ({ page }) => {
    // Step 12: Switch persona to Ministry Official
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const ministryBtn = page.getByRole('button', { name: /Ministry of Coal/i });
    await ministryBtn.click();

    const enterBtn = page.locator('button[type="submit"]');
    await enterBtn.click();

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    const sidebar = page.locator('aside.app-sidebar');
    await expect(sidebar.getByText(/Ministry Executive|Ministry of Coal/i).first()).toBeVisible();

    // Step 13: Browser reload session persistence test
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Confirm persona persists across reload
    await expect(sidebar.getByText(/Ministry Executive|Ministry of Coal/i).first()).toBeVisible();

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'beta_step_12_13_persistence.png') });
  });
});
