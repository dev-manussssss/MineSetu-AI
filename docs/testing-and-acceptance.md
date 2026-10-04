# MineSetu AI — Testing Strategy & Acceptance Criteria

> **STATUS**: APPROVED MASTER TEST SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **CURRENT TEST SUITE**: `tests/unit/rbac.test.mjs` (Node.js Test Runner)  
> **CANONICAL LOCATION**: `docs/testing-and-acceptance.md`

---

## 1. Current Test Inventory (Audit Baseline)

An audit of the repository's automated test harness reveals:
- **Test Runner**: Native Node.js test runner (`node:test`, `node:assert/strict`).
- **Executed Command**: `npm test` (or `node --test tests/unit/rbac.test.mjs`).
- **Active Tests (5 Passing)**:
  1. `Field Officer cannot approve documents into MDMS core` (Asserts role permission boundary).
  2. `Ministry Executive has exclusive parliamentary approval rights among operational roles`.
  3. `CMPDI Nodal Expert has full verification, upload, and audit view rights`.
  4. `System Admin holds admin.users permission`.
  5. `Anti-hallucination guardrail returns insufficient evidence for out-of-domain queries` (Validates uranium query rejection).
- **Existing Coverage**: Focuses on core RBAC and guardrail assertions.
- **Future Test Target**: Expand into comprehensive integration and end-to-end tests for dual ingestion, validation workbenches, and multi-format exports.

---

## 2. Comprehensive Acceptance Criteria Matrix

To ensure that upcoming implementation phases satisfy all approved product decisions, every feature must meet the following formal acceptance criteria:

### 2.1 Landing Page & Disclaimer
- [ ] **AC-1.1**: The institutional disclaimer banner appears prominently on `/` before the hero section with exact required text.
- [ ] **AC-1.2**: Header navigation renders the official MineSetu AI circular emblem (`assets/design references /file_00000000e9e88208ae070777ee045cb1.png`).
- [ ] **AC-1.3**: The hero displays exact headline: *"Making coal-sector reporting simpler and more connected."*
- [ ] **AC-1.4**: Primary CTA *"Explore the prototype"* routes smoothly to `/login`.
- [ ] **AC-1.5**: "How it works" 4-step sequence (Add information, Review extracted data, Find information, Prepare reports) renders with responsive layout.

### 2.2 Split-Screen Login & Persona Selection
- [ ] **AC-2.1**: Desktop layout renders a ~45% dark left panel and ~55% white right panel, stacking cleanly on viewports $<768\text{px}$.
- [ ] **AC-2.2**: Right panel displays the 4 approved personas: Ministry of Coal, CIL Headquarters, CMPDI, Subsidiary / Mine Officer.
- [ ] **AC-2.3**: Selecting a persona card automatically populates the configured demo email.
- [ ] **AC-2.4**: Password field includes a toggleable show/hide password control.
- [ ] **AC-2.5**: Submitting login navigates to `/dashboard` with session state matching the chosen persona.
- [ ] **AC-2.6**: Clear footer disclaimer: *"Demo access only · No public registration"* is visible.

### 2.3 Role-Based Navigation & Access Control
- [ ] **AC-3.1**: Left sidebar dynamically displays only navigation items authorized for the active persona.
- [ ] **AC-3.2**: Direct URL entry to an unauthorized route (e.g. Subsidiary Officer attempting to access `/admin` or Ministry executive approvals) renders the `AccessDenied` card with an explanation and redirect button.
- [ ] **AC-3.3**: Switching persona in Settings immediately updates data scoping across all modules.

### 2.4 Document Upload & Dual Ingestion
- [ ] **AC-4.1**: Upload dropzone accepts `.pdf`, `.docx`, `.xlsx`, `.csv`, and image scans; rejects files $>10\text{ MB}$ with an inline error.
- [ ] **AC-4.2**: Dropping a file transitions document status to `Processing`, displaying an upload progress bar.
- [ ] **AC-4.3**: First-class "Enter Data Manually" form renders alongside file upload.
- [ ] **AC-4.4**: Manual entry form enforces Category, Reporting Period, Mine, and dynamic rows with positive numbers and valid units.
- [ ] **AC-4.5**: Saving a manual record as `Draft` stores it locally without submitting; clicking `Submit for Review` transitions status to `Submitted`.
- [ ] **AC-4.6**: If a manual row omits a source note, it defaults to *"Source not provided"* — never an invented citation.

### 2.5 Validation Workbench (Human-in-the-Loop)
- [ ] **AC-5.1**: Split-screen workbench displays original document facsimile on left and extracted fields on right.
- [ ] **AC-5.2**: Low-confidence extractions ($<85\%$) display warning icons and highlight the relevant page area.
- [ ] **AC-5.3**: Authorized officers (`cmpdi`, `subsidiary_officer`) can edit extracted field values and units.
- [ ] **AC-5.4**: Saving corrections updates field state to `verified` and appends an audit event.
- [ ] **AC-5.5**: Returning a document for correction requires the reviewer to input a mandatory reason.

### 2.6 Ask MineSetu (Grounded AI Workspace)
- [ ] **AC-6.1**: Composer input appears prominently near the top of every dashboard.
- [ ] **AC-6.2**: All factual assertions in AI answers link to interactive citation badges containing Document Name, Subsidiary, Page Number, and excerpt text.
- [ ] **AC-6.3**: Out-of-domain queries (e.g. uranium reserves) or queries with zero matching authorized documents trigger exact fallback:
  *"Insufficient source evidence exists in authorized records to answer this inquiry."*
- [ ] **AC-6.4**: Conflicting numbers across two returns trigger explicit conflict warnings without silently picking one.
- [ ] **AC-6.5**: "Thinking Mode" toggle displays explicit disclaimer and performs multi-step synthesis when activated.

### 2.7 Multi-Format Report Builder
- [ ] **AC-7.1**: Form allows selection of Report Type, Period, Subsidiary Scope, Comparison Basis, and Output Formats.
- [ ] **AC-7.2**: Form allows simultaneous selection of PDF, Word (.docx), and Excel (.xlsx).
- [ ] **AC-7.3**: Preview displays title, executive narrative, tabular figures, source citations, and draft status watermark.
- [ ] **AC-7.4**: All export formats derive from the identical validated dataset.
- [ ] **AC-7.5**: Exporting a report does not silently approve a draft.

### 2.8 Topics & Word Cloud
- [ ] **AC-8.1**: Interactive SVG word cloud sizes terms by frequency ($12\text{px}-36\text{px}$) and colors by category.
- [ ] **AC-8.2**: Clicking any term filters the document list below to excerpts containing that term.
- [ ] **AC-8.3**: If fewer than 3 returns are available in selected scope, renders a clean empty state.

### 2.9 Mobile Responsiveness & Accessibility
- [ ] **AC-9.1**: Interface adapts cleanly across mobile ($375\text{px}$), tablet ($768\text{px}$), and desktop ($1440\text{px}$).
- [ ] **AC-9.2**: All text achieves minimum 4.5:1 contrast against its background.
- [ ] **AC-9.3**: All interactive buttons, inputs, and links have visible focus outlines for keyboard navigation.
- [ ] **AC-9.4**: Tabular numbers use `tabular-nums` for alignment.

### 2.10 Build & Deployment Health
- [ ] **AC-10.1**: `npm --prefix frontend run build` completes with 0 TypeScript and 0 Vite bundling errors.
- [ ] **AC-10.2**: `npm test` executes and passes all test suites.
- [ ] **AC-10.3**: Direct refresh on deep routes (`/dashboard`, `/documents`) on Vercel resolves `/index.html` without HTTP 404 errors.
