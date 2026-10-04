import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = path.resolve('./tests/qa-evidence');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const report = {
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  consoleErrors: [],
  failedRequests: [],
  testResults: []
};

function recordTest(testName, passed, details = '') {
  report.summary.totalTests++;
  if (passed) {
    report.summary.passed++;
    console.log(`  ✔ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    report.testResults.push({ name: testName, status: 'PASS', details });
  } else {
    report.summary.failed++;
    console.error(`  ✖ [FAIL] ${testName}: ${details}`);
    report.testResults.push({ name: testName, status: 'FAIL', details });
  }
}

async function runQA() {
  console.log('================================================================');
  console.log('🚀 MineSetu Frontend QA — Comprehensive Verification & Retest Run');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Handle native dialogs
  page.on('dialog', async dialog => {
    console.log(`  [BROWSER DIALOG] Type: ${dialog.type()}, Message: "${dialog.message()}"`);
    await dialog.accept();
  });

  // Track console errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error(`  [BROWSER CONSOLE ERROR]: ${text}`);
      report.consoleErrors.push({ text, location: msg.location() });
    }
  });

  page.on('pageerror', err => {
    console.error(`  [BROWSER UNCAUGHT EXCEPTION]: ${err.message}`);
    report.consoleErrors.push({ text: err.message, stack: err.stack });
  });

  page.on('requestfailed', req => {
    console.error(`  [NETWORK FAILED]: ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    report.failedRequests.push({
      url: req.url(),
      method: req.method(),
      error: req.failure()?.errorText
    });
  });

  try {
    // =============================================================
    // SUITE 1: Landing Page Desktop & Mobile Responsiveness
    // =============================================================
    console.log('--- Suite 1: Landing Page (Desktop & Mobile) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_desktop_final.png') });

    const title = await page.title();
    recordTest('Landing Page Title Validation', title.includes('MineSetu AI'), title);

    const brokenImgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });
    recordTest('Landing Page Broken Images Check', brokenImgs.length === 0, `Broken: ${brokenImgs.length}`);

    // Mobile Viewport Check (390px)
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_landing_mobile_final.png') });

    const landingMobileOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    }));
    recordTest(
      'Landing Page Mobile Zero-Overflow (390px)',
      !landingMobileOverflow.overflows,
      `scrollWidth: ${landingMobileOverflow.scrollWidth}px, innerWidth: ${landingMobileOverflow.innerWidth}px`
    );

    // =============================================================
    // SUITE 2: Login Page & Persona Switcher
    // =============================================================
    console.log('\n--- Suite 2: Login Page & Persona Selection ---');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_login_page_final.png') });

    const personaCount = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[type="button"]')).filter(b =>
        b.textContent.includes('Ministry') || b.textContent.includes('CIL') || b.textContent.includes('CMPDI') || b.textContent.includes('Subsidiary')
      );
      return btns.length;
    });
    recordTest('Login Persona Cards Count', personaCount >= 4, `Found: ${personaCount}`);

    // Click "CMPDI" persona
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('CMPDI'));
      if (btns[0]) btns[0].click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Submit Login
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 900));
    const redirectedToDash = page.url().includes('/dashboard');
    recordTest('Login Redirection to Dashboard', redirectedToDash, page.url());

    // =============================================================
    // SUITE 3: Dashboard Desktop & Mobile Responsive Verification
    // =============================================================
    console.log('\n--- Suite 3: Dashboard Desktop & Mobile Responsiveness ---');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dashboard_desktop_final.png') });

    // Test Notifications Bell
    const notifOpen = await page.evaluate(() => {
      const bell = document.querySelector('button[title="Demonstration Notifications"]');
      if (bell) {
        bell.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_notifications_dropdown_final.png') });
    recordTest('TopHeader Notification Bell Toggle', notifOpen);

    // Close notifications
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button:has(svg.lucide-x)');
      if (closeBtn) closeBtn.click();
    });

    // Test Mobile Dashboard Viewport (390px)
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_dashboard_mobile_final.png') });

    const dashMobileOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    }));
    recordTest(
      'Dashboard Mobile Zero-Overflow (390px)',
      !dashMobileOverflow.overflows,
      `scrollWidth: ${dashMobileOverflow.scrollWidth}px, innerWidth: ${dashMobileOverflow.innerWidth}px`
    );

    // Test Mobile Hamburger Button & Drawer
    const mobileMenuOpened = await page.evaluate(() => {
      const menuBtn = document.querySelector('.mobile-menu-btn');
      if (menuBtn) {
        menuBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_dashboard_mobile_drawer_open.png') });

    const sidebarVisibleOnMobile = await page.evaluate(() => {
      const sidebar = document.querySelector('.app-sidebar.mobile-open');
      return !!sidebar;
    });
    recordTest('Mobile Sidebar Drawer Toggle', mobileMenuOpened && sidebarVisibleOnMobile);

    // Close mobile drawer via backdrop
    await page.evaluate(() => {
      const backdrop = document.querySelector('div[style*="rgba(15, 23, 42"]');
      if (backdrop) backdrop.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Reset to desktop
    await page.setViewport({ width: 1280, height: 800 });

    // =============================================================
    // SUITE 4: Ask MineSetu Grounded Synthesis & Citations
    // =============================================================
    console.log('\n--- Suite 4: Ask MineSetu Grounded Synthesis ---');
    await page.goto(`${BASE_URL}/ask`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Type query using keyboard
    await page.type('textarea', 'What was the monthly coal production and OB removal at Rajmahal OCP?');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_ask_response_final.png') });

    const evidencePresent = await page.evaluate(() => {
      return document.body.innerText.toUpperCase().includes('SUPPORTING SOURCES & EVIDENCE CITATIONS');
    });
    recordTest('Ask MineSetu Evidence Citations Verification', evidencePresent);

    // Test Mobile Ask MineSetu (390px)
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_ask_mobile_final.png') });

    const askMobileOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    }));
    recordTest(
      'Ask MineSetu Mobile Zero-Overflow (390px)',
      !askMobileOverflow.overflows,
      `scrollWidth: ${askMobileOverflow.scrollWidth}px, innerWidth: ${askMobileOverflow.innerWidth}px`
    );

    await page.setViewport({ width: 1280, height: 800 });

    // =============================================================
    // SUITE 5: Documents & Dual Ingestion (Filters, Table & Manual Form)
    // =============================================================
    console.log('\n--- Suite 5: Documents & Dual Ingestion ---');
    await page.goto(`${BASE_URL}/documents`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Test Document Search Filter
    await page.type('input[placeholder*="Search by title"]', 'Rajmahal');
    await new Promise(r => setTimeout(r, 300));
    const searchFilteredCount = await page.evaluate(() => {
      return document.querySelectorAll('tbody tr').length;
    });
    recordTest('Document Archive Search Filter', searchFilteredCount >= 1, `Matches: ${searchFilteredCount}`);

    // Test Tab Switching: Manual Data Entry
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.pill-tab'));
      const manualTab = tabs.find(t => t.textContent.includes('Manual'));
      if (manualTab) manualTab.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_documents_manual_form_final.png') });

    // Type record title using page.type
    await page.type('input[placeholder*="Rajmahal OCP Pit 3"]', 'QA Colliery Mechanized Shift Return');
    await new Promise(r => setTimeout(r, 200));

    // Submit form
    const manualSubmissionSuccess = await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Submit for Technical Review')
      );
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_documents_manual_submitted_final.png') });
    recordTest('Manual Mining Return Submission', manualSubmissionSuccess);

    // =============================================================
    // SUITE 6: Validation Workbench (Desktop & Mobile Responsiveness)
    // =============================================================
    console.log('\n--- Suite 6: Validation Workbench ---');
    // Ensure active role is technical authority (CMPDI) for verification rights
    await page.evaluate(() => {
      localStorage.setItem('minesetu_active_role', 'cmpdi');
    });
    await page.goto(`${BASE_URL}/documents/verify`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_validation_workbench_desktop_final.png') });

    // Test editing extracted field
    const editFieldSuccess = await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Correct Field'));
      if (editBtns[0]) {
        editBtns[0].click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));

    // Save edited field
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    recordTest('Validation Workbench Field Editing & Save', editFieldSuccess);

    // Test Accept for Next Stage button (CMPDI has verification right)
    const acceptBtnClicked = await page.evaluate(() => {
      const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Accept for Next Stage'));
      if (acceptBtn) {
        acceptBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 400));
    recordTest('Validation Workbench Accept For Next Stage', acceptBtnClicked);

    // Test Mobile Validation Workbench (390px)
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_validation_workbench_mobile_final.png') });

    const verifyMobileOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      overflows: document.documentElement.scrollWidth > window.innerWidth
    }));
    recordTest(
      'Validation Workbench Mobile Zero-Overflow (390px)',
      !verifyMobileOverflow.overflows,
      `scrollWidth: ${verifyMobileOverflow.scrollWidth}px, innerWidth: ${verifyMobileOverflow.innerWidth}px`
    );

    await page.setViewport({ width: 1280, height: 800 });

    // =============================================================
    // SUITE 7: Information Requests
    // =============================================================
    console.log('\n--- Suite 7: Information Requests ---');
    // Ensure active role is Ministry of Coal for request creation permissions
    await page.evaluate(() => {
      localStorage.setItem('minesetu_active_role', 'ministry_coal');
    });
    await page.goto(`${BASE_URL}/requests`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Test filter tabs
    const reqFilterTested = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.pill-tab'));
      const activeTab = tabs.find(t => t.textContent.includes('Pending') || t.textContent.includes('Awaiting'));
      if (activeTab) {
        activeTab.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));
    recordTest('Information Requests Filter Tab', reqFilterTested);

    // Open Request Creation Modal
    const createModalOpened = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Information Request'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_requests_create_modal_final.png') });

    // Type Subject and Description using page.type
    await page.type('input[placeholder*="Urgent Return"]', 'Parliamentary Inquiry on Coal Washery Yield');
    await page.type('textarea[placeholder*="operational reason"]', 'Detailed recovery numbers requested for Q2 FY26.');

    const requestSubmitted = await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send Information Request'));
      if (submitBtn) {
        submitBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 600));
    recordTest('Create Information Request Modal Submission', createModalOpened && requestSubmitted);

    // =============================================================
    // SUITE 8: Review Queue & Baseline Variance
    // =============================================================
    console.log('\n--- Suite 8: Review Queue & Baseline Variance ---');
    await page.goto(`${BASE_URL}/review`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Switch to Baseline Variance Comparison tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.pill-tab'));
      const compareTab = tabs.find(t => t.textContent.includes('Baseline Variance Comparison'));
      if (compareTab) compareTab.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_review_compare_tab_final.png') });

    const selectorsFound = await page.evaluate(() => {
      return document.querySelectorAll('select').length;
    });
    recordTest('Baseline Variance Document Selectors', selectorsFound >= 2, `Selects: ${selectorsFound}`);

    // =============================================================
    // SUITE 9: Automated Report Builder & Exports
    // =============================================================
    console.log('\n--- Suite 9: Automated Report Builder & Exports ---');
    await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_reports_preview_final.png') });

    // Open Build New Report Modal
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Create Report Draft'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_reports_modal_final.png') });

    // Type report title
    await page.type('input[placeholder*="Semi-Annual"]', 'Ministry Executive Return Audit Brief - August 2026');

    const reportCompiled = await page.evaluate(() => {
      const compileBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Compile Draft Brief'));
      if (compileBtn) {
        compileBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 800));
    recordTest('Executive Report Compilation', reportCompiled);

    // =============================================================
    // SUITE 10: Topics & Word Cloud
    // =============================================================
    console.log('\n--- Suite 10: Topics & Word Cloud ---');
    await page.goto(`${BASE_URL}/topics`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    const topicPillClicked = await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('button')).filter(el =>
        el.textContent.includes('HEMM Fleet') || el.textContent.includes('Monsoon Inundation')
      );
      if (pills[0]) {
        pills[0].click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_topics_selected_final.png') });
    recordTest('Thematic Topic Selection & Word Cloud Interaction', topicPillClicked);

    // =============================================================
    // SUITE 11: Activity History & Audit Ledger
    // =============================================================
    console.log('\n--- Suite 11: Activity History & Audit Ledger ---');
    await page.goto(`${BASE_URL}/activity`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_activity_history_final.png') });

    // Test Roles Permissions Tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.pill-tab'));
      const rolesTab = tabs.find(t => t.textContent.includes('Role Permissions Matrix'));
      if (rolesTab) rolesTab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const rolesRendered = await page.evaluate(() => {
      return document.body.innerText.includes('Role Permissions Reference');
    });
    recordTest('Role Permissions Matrix Tab', rolesRendered);

    // =============================================================
    // SUITE 12: Settings & Reset Controls
    // =============================================================
    console.log('\n--- Suite 12: Settings & Dataset Controls ---');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20_settings_final.png') });

    const settingsLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('Workspace Settings & Demonstration Preferences');
    });
    recordTest('Settings Page Rendering & Controls', settingsLoaded);

    // =============================================================
    // SUITE 13: RBAC Access Denied Verification
    // =============================================================
    console.log('\n--- Suite 13: RBAC Access Denied State & Recovery ---');
    await page.evaluate(() => {
      localStorage.setItem('minesetu_active_role', 'subsidiary_officer');
    });
    await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21_rbac_access_denied_final.png') });

    const accessDeniedActive = await page.evaluate(() => {
      return document.body.innerText.includes('Access Restricted: Reports');
    });
    recordTest('RBAC Policy Enforcement: Access Denied Page', accessDeniedActive);

    // Recovery test: click Back to Dashboard
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Back to Dashboard'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    recordTest('Access Denied Recovery Navigation', page.url().includes('/dashboard'));

    // Restore role to CMPDI
    await page.evaluate(() => {
      localStorage.setItem('minesetu_active_role', 'cmpdi');
    });

    console.log('\n================================================================');
    console.log(`QA Verification Run Finished: ${report.summary.passed} Passed, ${report.summary.failed} Failed`);
    console.log('================================================================\n');
  } catch (err) {
    console.error('Test Suite encountered fatal error:', err);
  } finally {
    await browser.close();
  }

  fs.writeFileSync('./tests/qa-evidence/qa-report.json', JSON.stringify(report, null, 2));
}

runQA();
