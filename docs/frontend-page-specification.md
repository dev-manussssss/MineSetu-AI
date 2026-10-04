# MineSetu AI — Frontend Page Specifications & UI Blueprint

> **STATUS**: APPROVED MASTER UI SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **CANONICAL LOCATION**: `docs/frontend-page-specification.md`

---

## 1. Page-by-Page Specifications

### 1.1 Institutional Landing Page (`/`)

#### 1. Header Navigation
- **Left**: Official MineSetu AI Logo Emblem (`assets/design references /file_00000000e9e88208ae070777ee045cb1.png`, 38x38px) + Brand Wordmark ("MineSetu" in Slate `#0F172A`, "AI" in Cobalt `#1D4ED8`).
- **Center**: Clean, minimal navigation links: `Platform`, `How it Works`, `Capabilities`, `Architecture`.
- **Right**: Primary Action CTA: `"Explore the Prototype"` (routes to `/login`).

#### 2. Mandatory Prototype Notice Banner
- **Placement**: Immediately below navigation header, spanning full width above hero.
- **Visual Style**: Soft Amber background (`#FFFBEB`), 1px Amber border (`#FDE68A`), dark amber text (`#92400E`), AlertCircle icon (`16px`).
- **Exact Copy**:
  > *"MineSetu AI demonstrates a proposed AI-powered extension to the MDMS reporting workflow. This is a standalone prototype, not the official MDMS portal, and live integration is not currently claimed."*

#### 3. Centered Hero Section
- **Headline (Display, 32px/40px, Bold)**:
  *"Making coal-sector reporting simpler and more connected."*
- **Supporting Copy (Body Regular, 16px/24px, Text Secondary)**:
  *"Explore how MineSetu AI could help teams process mining documents, enter information manually, verify records, search available information and prepare reports through a structured workflow."*
- **Primary CTA**: `"Explore the prototype"` (Button Primary, Cobalt Blue) -> Navigates to `/login`.
- **Secondary CTA**: `"View Architecture Blueprint"` (Button Outline) -> Scrolls to architecture overview.

#### 4. "How It Works" 4-Stage Operational Sequence
A 4-column card grid explaining the end-to-end data lifecycle:
1. **1. Add Information**: Upload PDF returns and scanned slips, or input daily production and overburden figures directly through manual data entry.
2. **2. Review Extracted Data**: Validate OCR-extracted figures side-by-side against original source facsimiles with human-in-the-loop verification.
3. **3. Find Information**: Query authorized operational records with source-grounded natural language search and explicit citation tracing.
4. **4. Prepare Reports**: Generate consolidated briefs exported simultaneously into PDF, Microsoft Word (.docx), and Microsoft Excel (.xlsx).

#### 5. Core Capability Cards
- **Card 1: Document Intelligence**: Optical character recognition, tabular parsing, and anomaly detection across statutory returns.
- **Card 2: Human Verification Workbench**: Non-destructive correction workbench ensuring AI extractions never enter trusted stores without review.
- **Card 3: Intelligent Search (Ask MineSetu)**: Strict source-grounded inquiry engine with anti-hallucination guardrails and conflict detection.
- **Card 4: Automated Report Preparation**: Multi-format reporting engine compiling validated figures into formal executive briefs.

#### 6. Institutional Footer
- Official prototype status statement, disclaimer, and real internal links only. No dead links or invented third-party partner logos.

---

### 1.2 Split-Screen Login & Persona Access Portal (`/login`)

The login experience follows an institutional split-screen layout (approximately 45% dark left panel, 55% white right panel on desktop; stacks vertically on mobile):

```text
┌──────────────────────────────────────┬──────────────────────────────────────────┐
│ LEFT PANEL (45% - Slate #0F172A)     │ RIGHT PANEL (55% - White #FFFFFF)        │
│                                      │                                          │
│ [Official MineSetu Logo Emblem]      │ "Access the prototype"                   │
│                                      │ "Select a role to explore its workspace" │
│ "Making coal-sector reporting        │                                          │
│  simpler and more connected."        │ [4 Role Selector Cards]                  │
│                                      │  - Ministry of Coal                      │
│ Three Key Capabilities:              │  - CIL Headquarters                      │
│  ✓ Document & Manual Ingestion       │  - CMPDI                                 │
│  ✓ Grounded Information Search       │  - Subsidiary / Mine Officer             │
│  ✓ Multi-Format Report Builder       │                                          │
│                                      │ Configured Demo Account: [Email Input]   │
│ "Prototype Environment · Sample Data"│ Password: [••••••••••••] (Show/Hide)     │
│                                      │ [Button: "Enter Workspace"]              │
│                                      │                                          │
│                                      │ "Demo access only · No public signup"    │
│                                      │ "← Back to home"                         │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

#### Left Panel Details (Dark Brand Atmosphere)
- Background: Deep slate `--bg-dark-anchor` (`#0F172A`).
- Top: MineSetu circular logo emblem (48x48px) + "MineSetu AI".
- Product statement and 3 bulleted capability highlights with checkmarks.
- Bottom watermark: *"Prototype environment · Sample synthetic data"*.

#### Right Panel Details (Form Surface)
- Header: *"Access the prototype"* with subtitle *"Select a role to explore its workspace"*.
- **Role Selector**: 4 interactive selectable cards corresponding to the 4 approved personas:
  1. **Ministry of Coal** (`ministry.exec@demo.coal.gov.in`)
  2. **CIL Headquarters** (`cil.director@demo.coalindia.in`)
  3. **CMPDI** (`cmpdi.nodal@demo.cmpdi.co.in`)
  4. **Subsidiary / Mine Officer** (`rajmahal.officer@demo.ecl.gov.in`)
- Selecting a role automatically populates the configured demo email and session credentials.
- Password input with masked text and toggleable show/hide eye icon.
- Primary CTA: `"Enter workspace"` -> Authenticates persona session and routes to `/dashboard`.
- Footer: *"Demo access only · No public registration"* and link *"← Back to home"*.

---

### 1.3 Shared Dashboard Shell (`DashboardLayout`)

All authenticated routes are wrapped inside the shared institutional shell:

```text
┌────┬────────────────────────────────────────────────────────────────────────┐
│ [L]│ Top Search Bar (Pill)                   [Notifications] [User Profile] │
├────┼────────────────────────────────────────────────────────────────────────┤
│    │ Page Title & Context Description                  [Primary Page Action]│
│ [S]│                                                                        │
│ [I]│ ┌────────────────────────────────────────────────────────────────────┐ │
│ [D]│ │ "Ask MineSetu" Quick Inquiry Bar (Prominent on every dashboard)   │ │
│ [E]│ └────────────────────────────────────────────────────────────────────┘ │
│ [B]│                                                                        │
│ [A]│ [4 KPI Metric Cards (from ref1.png)]                                   │
│ [R]│                                                                        │
│    │ [Main Dashboard Content Area / Tables / Activity Feed]                 │
└────┴────────────────────────────────────────────────────────────────────────┘
```

- **Slim Left Sidebar (`Sidebar.tsx`)**:
  - Width: `68px` collapsed (icon-only mode) / `240px` expanded.
  - Top: Official MineSetu circular emblem (34x34px).
  - Navigation items dynamically generated based on active persona's permitted routes.
  - Active item: Cobalt background (`#EFF6FF`), cobalt icon and text (`#1D4ED8`), right border indicator (`3px solid #1D4ED8`).
  - Bottom: Switch Persona trigger, Return to Home, and Sign Out action.
- **Top Header Bar (`TopHeader.tsx`)**:
  - Global Search Input: Pill input (`40px` height) with search icon and placeholder *"Search documents, returns, topics..."*.
  - Active Persona Badge: Displays active role name and organization tier.
  - Notification icon (displays simulated event badges).

---

### 1.4 The Four Role-Specific Dashboards

#### 1. Ministry of Coal Dashboard (`/dashboard`)
- **Top Summary**: National coal production pacing across all CIL subsidiaries vs Ministry prorated targets.
- **Ask MineSetu**: Pre-configured inquiries (*"National production pacing Q2"*, *"Despatch bottleneck analysis"*).
- **KPI Metrics**: Total Coal Production (MT), National Dispatch (MT), Average Ash %, Pending Statutory Inquiries.
- **Modules**:
  - *Statutory Information Requests Queue*: Status of formal information requests sent to CIL subsidiaries.
  - *Pending Ministerial Responses*: Review draft responses compiled from subsidiary evidence before parliamentary transmission.
  - *National Production Comparison Table*: Subsidiary-by-subsidiary pacing.

#### 2. CIL Headquarters Dashboard (`/dashboard`)
- **Top Summary**: Apex operational monitoring across all 8 operating subsidiaries (ECL, BCCL, CCL, NCL, WCL, SECL, MCL, CMPDI).
- **Ask MineSetu**: Comparative inquiries (*"Compare ECL vs SECL overburden stripping efficiency"*).
- **KPI Metrics**: Consolidated Coal Output (MT), Overburden Stripping ($Mm^3$), Rail Rake Availability, Submission Compliance Rate.
- **Modules**:
  - *Subsidiary Submission Tracker*: Real-time grid of returns submitted, under review, and pending.
  - *Variance Reconciliation Panel*: Alerts on production discrepancies exceeding $\pm 5\%$ against historical trends.
  - *Consolidated Report Drafts*: Quick access to multi-subsidiary monthly and quarterly executive briefs.

#### 3. CMPDI Dashboard (`/dashboard`)
- **Top Summary**: Scientific, geological, and extraction accuracy oversight across multi-subsidiary returns.
- **Ask MineSetu**: Geological queries (*"Review washery yield variance across BCCL prime coking mines"*).
- **KPI Metrics**: Ingestion Queue Count, OCR Confidence Median (%), Validation Backlog, Flagged Field Errors.
- **Modules**:
  - *Extraction & Validation Backlog*: List of documents awaiting human verification.
  - *OCR Confidence Distribution Chart*: Breakdown of high-confidence vs blurry/low-confidence records.
  - *Topic Intelligence Widget*: Top operational clusters extracted from colliery diaries and inspection remarks.

#### 4. Subsidiary / Mine Officer Dashboard (`/dashboard`)
- **Top Summary**: Colliery-level operational return workspace (e.g. Rajmahal OCP, ECL).
- **Ask MineSetu**: Scoped strictly to mine returns (*"Summarize shovel-dumper shift hours for August 2026"*).
- **KPI Metrics**: Monthly Output (Tonnes), Daily Heavy Machinery Hours, My Submissions, Returned for Correction.
- **Modules**:
  - *Dual Ingestion Hub*: Side-by-side action cards for **"Upload Document"** and **"Enter Data Manually"**.
  - *My Recent Submissions Table*: Status tracking (`Draft`, `Needs review`, `Submitted`, `Approved`).
  - *Assigned Information Requests*: Pending requests requiring field data submission.

---

### 1.5 Dedicated "Upload & Manage Documents" Page (`/documents`)

The documents page provides a unified dual-ingestion hub:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Document Ingestion & Archive                     [+ Upload Document]  │
│ Manage physical scans, digital returns, and manual structured records  │
├────────────────────────────────────────────────────────────────────────┤
│ [All Documents (24)] [Needs Review (4)] [Ready to Search (18)] [Failed]│
├────────────────────────────────────────────────────────────────────────┤
│ DUAL INGESTION ZONE                                                    │
│ ┌───────────────────────────────────┬────────────────────────────────┐ │
│ │ OPTION A: UPLOAD DIGITAL RETURN   │ OPTION B: ENTER DATA MANUALLY  │ │
│ │ [Drag & drop PDF, DOCX, Scans]    │ [Structured Form Table]        │ │
│ │ "Drop files here or browse"       │ Category, Period, Mine, Rows   │ │
│ │ (Max 10MB · Scans queued for OCR) │ "Add Row", "Save Draft", Submit│ │
│ └───────────────────────────────────┴────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ ARCHIVE TABLE                                                          │
│ Title | Subsidiary | Mine | Reporting Period | Status | OCR Conf | Act. │
└────────────────────────────────────────────────────────────────────────┘
```

#### First-Class "Enter Data Manually" Interface
Beside file upload, the page provides a dedicated manual entry interface:
- **Category Selector**: Production & Excavation, Overburden Stripping, Geological Sample, Safety Inspection, Despatch.
- **Metadata Fields**: Reporting Period (e.g. `August 2026`), Subsidiary (`ECL`), Colliery/Mine (`Rajmahal OCP`), Source Date.
- **Dynamic Data Grid**:
  - Column 1: Field Name (e.g. `Raw Coal Production`, `OB Stripping`, `Rail Despatch Rakes`).
  - Column 2: Value (Numeric input with format validation).
  - Column 3: Unit (Dropdown: `Tonnes`, `MT`, `$m^3$`, `Rakes`, `Hours`, `%`).
  - Column 4: Source / Explanation (Text input; if omitted, defaults to *"Source not provided"*).
  - Column 5: Action (Delete row icon).
- **Form Actions**:
  - `Add Row` (Appends blank key-value entry).
  - `Save as Draft` (Saves record in `Draft` status).
  - `Submit for Review` (Validates all required fields and transitions to `Submitted`).
  - `Cancel` (Resets form).

---

### 1.6 Human-in-the-Loop Validation Workbench (`/documents/:id/verify`)

A side-by-side verification interface ensuring OCR extractions undergo human confirmation before becoming trusted records:
- **Left Panel (50% Width) — Document Facsimile**:
  - High-fidelity PDF/image viewer with pan, zoom, and page navigation controls.
  - Active bounding boxes highlighting the region corresponding to the selected field.
- **Right Panel (50% Width) — Extracted Data Fields**:
  - Header: Document Title, Ingested Timestamp, Median OCR Confidence Badge.
  - List of Extracted Key-Value Fields:
    - Field Label & Internal Identifier.
    - Extracted Value (from OCR) + Confidence Score (e.g. `94%`).
    - Verified / Corrected Input (Editable input for authorized officers).
    - Unit badge (e.g. `Tonnes`).
    - Status Chip: `auto_extracted`, `verified`, `flagged_error`.
    - Reviewer Notes field (e.g. *"Corrected digit 8 misread as 0 due to fold"*).
- **Workbench Actions**:
  - `Save Corrections`: Persists edited values and flags as `verified`.
  - `Mark for Clarification`: Sends request for clarification back to uploader.
  - `Return for Correction`: Rejects extraction and alerts colliery officer.
  - `Submit for Review`: Advances verified dataset into formal review queue.
  - `Back to Documents`: Returns to archive list.

---

### 1.7 Ask MineSetu — Grounded AI Reporting Workspace (`/ask`)

The unified conversational and analytical inquiry interface:
- **Heading**: *"Ask MineSetu"* with helper *"Search records, understand information and prepare reports."*
- **Composer Panel**:
  - Multiline prompt textarea: *"Ask a question or describe the report you need..."*
  - **Plus Menu (+)**: Attach Document from Available Archive, or Upload New Reference.
  - **Thinking Mode Toggle**: Optional deep synthesis mode with explicit disclaimer: *"Thinking mode performs multi-step cross-subsidiary reconciliation."*
  - Action Controls: Clear prompt, Submit inquiry.
- **Response Display**:
  - Narrative Response: Clear, professional markdown prose answering the inquiry.
  - **Interactive Source Badges**: Every factual statement links to a citation card showing `[Document Name, Page #, Table #, Excerpt]`.
  - **Evidence Gap & Conflict Box**: If numbers conflict between two returns, explicitly displays:
    > *"Conflict Detected: ECL August Monthly Return reports 45,210 Tonnes (Page 1), while Area Despatch Slip reports 43,800 Tonnes (Page 2)."*
  - **No-Evidence Handling**: When no data exists, clearly outputs *"Insufficient source evidence exists in authorized records."* and presents buttons to `Upload Document`, `Enter Data Manually`, or `Create Information Request`.
  - Action Footer: `Stop Generating`, `View Sources`, `Open Document`, `Copy Answer`, `Create Report Draft`, `Ask Follow-up`.

---

### 1.8 Information Requests & Multi-Stage Review Queue (`/requests`, `/review`)

#### Information Requests (`/requests`)
- **Requests Table**: Request ID, Subject, Requesting Organization (MoC / CIL HQ), Assigned Recipient, Reporting Period, Due Date, Status (`Draft`, `Awaiting response`, `Partially answered`, `Submitted`, `Clarification required`, `Completed`), Last Updated.
- **Actions**: `Create Request`, `Open Request`, `Respond with Data / Attachment`, `Request Clarification`, `Close Request`.

#### Review & Approvals Queue (`/review`)
- **Queue Table**: Submitted Records, Source Organization, Submission Date, Variance against Historical Baseline, Extraction Confidence.
- **Detail View**: Side-by-side comparison of submitted values vs historical baseline figures.
- **Actions**: `Save Review Notes`, `Accept for Next Stage`, `Return for Correction`, `Request Clarification`, `View Audit History`.

---

### 1.9 Multi-Format Reports Page (`/reports`)

- **Report Builder Setup**:
  - Report Type: Quarterly Operational Review, Monthly Production Brief, HEMM Availability Audit, Safety Compliance Brief.
  - Reporting Period: Q1, Q2, Q3, Q4, Custom Date Range.
  - Scope: All Subsidiaries, Subsidiary-Wise, Mine-Wise.
  - Comparison Basis: Previous Year Same Period (YoY), Annual Target Budget, Previous Quarter.
  - Source Documents: Multi-select of verified returns in scope.
  - **Simultaneous Multi-Select Formats**:
    - [x] **PDF Document (.pdf)** (Executive print-ready layout)
    - [x] **Microsoft Word (.docx)** (Editable narrative brief)
    - [x] **Microsoft Excel (.xlsx)** (Raw tabular reconciliation workbook)
- **Report Preview Canvas**:
  - Title, Reporting Scope, Executive Summary narrative, Tabular metrics, Citations list, Draft Watermark.
- **Actions**: `Edit Draft`, `View Sources`, `Regenerate Selected Section`, `Export PDF`, `Export Word (.docx)`, `Export Excel (.xlsx)`, `Back to Reports`.

---

### 1.10 Topics & Word Cloud (`/topics`)

- **Filter Bar**: Scope by Subsidiary (`ECL`, `SECL`, `All`), Document Type, Reporting Period, Operational Category.
- **Interactive SVG Word Cloud**:
  - Term size corresponds to frequency; term color corresponds to category/urgency (e.g. *Haul Road Maintenance*, *Monsoon Inundation*, *HEMM Availability*).
  - Hovering displays term count and source document occurrences.
  - Clicking a word filters the document list below to excerpts containing that term.
- **Cluster List**: Ranked table of topic clusters, document counts, and representative excerpts.
- **Empty State**: Meaningful fallback when fewer than 3 returns are available for clustering.

---

### 1.11 Activity History & Settings (`/activity`, `/settings`)

- **Activity History (`/activity`)**:
  - Searchable, filterable audit ledger.
  - Columns: Timestamp (ISO), Actor Name, Role, Action Performed, Target Entity (Document ID, Request ID), Status (`Success`, `Denied`, `Failure`).
  - Disclaimer: *"Demonstration audit ledger for prototype event tracking."*
- **Settings (`/settings`)**:
  - Profile information and active demo persona indicator.
  - Persona Switcher dropdown for quick multi-role exploration.
  - Default Report Export Format preferences (PDF / Word / Excel).
  - Reset Demonstration Dataset button (clears local edits and restores synthetic seed).

---

## 2. Comprehensive Button & Control Specification

To ensure zero inert buttons or broken click targets, every control in the application is cataloged below:

| Page / Component | Control Label | Authorized Role | Action Triggered | Target Route | Loading State | Confirmation Needed? | Status |
|---|---|---|---|---|---|---|---|
| **Landing** | "Explore the prototype" | Public | Navigates to Login / Role Selector | `/login` | None | No | **Implemented** |
| **Landing** | "Sign in" | Public | Navigates to Login | `/login` | None | No | **Implemented** |
| **Login** | Role Card (1-4) | Public | Selects persona & pre-fills demo email | In-place | None | No | **Implemented** |
| **Login** | "Enter workspace" | Public | Sets session & initializes role scope | `/dashboard` | Spinner (300ms) | No | **Implemented** |
| **Login** | "Back to home" | Public | Returns to Landing | `/` | None | No | **Implemented** |
| **Sidebar** | Switch Persona | All | Opens persona switcher menu | In-place modal | None | No | **Implemented** |
| **Sidebar** | Sign Out | All | Clears demo session & returns to landing | `/` | None | Yes | **Implemented** |
| **Dashboard** | "Upload Document" | `subsidiary_officer`, `cmpdi` | Opens upload dropzone | `/documents` | None | No | **Implemented** |
| **Dashboard** | "Enter Data Manually" | `subsidiary_officer`, `cmpdi` | Opens manual entry table | `/documents` | None | No | **Implemented** |
| **Documents** | "Upload Return" | `subsidiary_officer`, `cmpdi` | Triggers file picker & upload job | In-place | Progress bar | No | **Implemented** |
| **Documents** | "Save Manual Draft" | `subsidiary_officer`, `cmpdi` | Saves entered rows as Draft | In-place | Saving toast | No | **Implemented** |
| **Documents** | "Submit for Review" | `subsidiary_officer`, `cmpdi` | Submits manual rows to review queue | In-place | Saving toast | Yes | **Implemented** |
| **Validation** | "Save Corrections" | `cmpdi`, `subsidiary_officer` | Updates verified values & notes | In-place | Saving indicator | No | **Implemented** |
| **Validation** | "Return for Correction"| `cmpdi` | Flags extraction & alerts uploader | `/documents` | None | Yes ("Specify reason") | **Implemented** |
| **Validation** | "Submit for Review" | `cmpdi`, `subsidiary_officer` | Moves document to Review Queue | `/documents` | None | Yes | **Implemented** |
| **Ask MineSetu**| "Submit Inquiry" | All (Scoped) | Dispatches grounded RAG search | In-place | Thinking animation | No | **Implemented** |
| **Ask MineSetu**| "View Sources" | All | Expands citation drawer with excerpts | In-place | None | No | **Implemented** |
| **Ask MineSetu**| "Create Report Draft" | `ministry_coal`, `cil_hq` | Seeds report builder with context | `/reports` | None | No | **Implemented** |
| **Reports** | "Export PDF" | All with `reports.generate` | Generates & triggers PDF download | In-place | Downloading spinner | No | **Implemented** |
| **Reports** | "Export Word (.docx)" | All with `reports.generate` | Generates & triggers .docx download | In-place | Downloading spinner | No | **Implemented** |
| **Reports** | "Export Excel (.xlsx)"| All with `reports.generate` | Generates & triggers .xlsx download | In-place | Downloading spinner | No | **Implemented** |
| **Requests** | "Create Request" | `ministry_coal`, `cil_hq` | Opens request composition modal | In-place | None | No | **Implemented** |
| **Requests** | "Submit Response" | `subsidiary_officer`, `cil_hq` | Submits figures & attachments | In-place | Submitting toast | Yes | **Implemented** |
| **Review** | "Accept for Next Stage"| `cil_hq`, `cmpdi` | Advances submission to approved store| In-place | Updating spinner | Yes | **Implemented** |
| **Review** | "Return for Correction"| `cil_hq`, `cmpdi` | Returns record to colliery officer | In-place | None | Yes ("Specify remarks")| **Implemented** |
| **Settings** | "Reset Dataset" | All | Clears local edits & restores seed | `/dashboard` | Resetting spinner | Yes ("Reset to seed?") | **Implemented** |
