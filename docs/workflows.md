# MineSetu AI — State Transitions & Operational Workflows

> **STATUS**: APPROVED MASTER WORKFLOW SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **CANONICAL LOCATION**: `docs/workflows.md`

---

## 1. Overview of Core Workflows

MineSetu AI coordinates data flow across physical paper returns, structured field entries, human verification loops, cross-organization requests, and assistive intelligence synthesis. 

Every state change follows a strict finite state machine (FSM) model to ensure data integrity, verifiable audit trails, and zero unreviewed data commits.

---

## 2. Detailed Workflow Specifications

### Workflow 1: Document Upload & Ingestion Pipeline
- **Primary Actor**: Subsidiary / Mine Officer (`subsidiary_officer`) or CMPDI Technical Officer (`cmpdi`).
- **Preconditions**: User is authenticated and holds `documents.upload` permission; file is a supported format (PDF, DOCX, XLSX, CSV, image scan) under 10MB.
- **State Transition**:
  $$\text{Draft / Selected} \longrightarrow \text{Processing} \longrightarrow \begin{cases} \text{Needs review} & (\text{Confidence} \ge 85\%) \\ \text{Partially extracted} & (\text{Confidence} < 85\%) \\ \text{Failed} & (\text{Parse / Network error}) \end{cases}$$
- **Step-by-Step Execution**:
  1. Officer navigates to `/documents` and drops file onto the upload zone.
  2. Officer provides required metadata: Document Category, Reporting Period, Subsidiary, Mine/Colliery, and Source Date.
  3. Client validates file signature and size.
  4. System uploads file to immutable private object storage (`documents-raw/`) and computes SHA-256 hash.
  5. Document record created with initial status `Processing`.
  6. OCR & Layout Analysis service extracts text, tables, and bounding boxes.
  7. If median field confidence $\ge 85\%$, document transitions to `Needs review`.
  8. If median field confidence $< 85\%$ or required fields are missing, status transitions to `Partially extracted` with highlighted warnings.
  9. If file is corrupted or unreadable, status transitions to `Failed`.
- **Failure Paths**:
  - File $>10\text{ MB}$: Client rejects before upload with message: *"File exceeds maximum 10MB limit."*
  - Unsupported MIME type: Rejection with message: *"Unsupported format. Please upload PDF, DOCX, XLSX, or image scans."*
  - OCR failure: Logged in audit trail; user offered option to retry or enter data manually.
- **Implementation Status**: **Mocked in Prototype** (Simulated client upload and synthetic document generation).

---

### Workflow 2: First-Class Manual Structured Data Entry
- **Primary Actor**: Subsidiary / Mine Officer (`subsidiary_officer`).
- **Preconditions**: Officer is authenticated and holds `manual.entry` permission; colliery/mine identity is resolved.
- **State Transition**:
  $$\text{Draft} \longrightarrow \begin{cases} \text{Draft (Saved Locally)} \\ \text{Submitted (To Review Queue)} \end{cases}$$
- **Step-by-Step Execution**:
  1. Officer selects *"Enter Data Manually"* on `/documents`.
  2. Officer selects Operational Category (Production, Overburden, Geological, Safety, Despatch) and Reporting Period.
  3. Officer inputs rows into the dynamic grid: Field Name, Value, Unit, Source/Explanation note.
  4. If source explanation is omitted, system assigns *"Source not provided"*.
  5. **Branch A — Save Draft**: Officer clicks *"Save as Draft"*. Record is stored in `Draft` state for later editing.
  6. **Branch B — Submit**: Officer clicks *"Submit for Review"*. Form validates that numbers are positive, units are specified, and periods are valid. Status transitions to `Submitted`.
  7. Review Queue is alerted of incoming manual submission.
- **Failure Paths**:
  - Incomplete required fields: Form displays inline red errors; submission blocked.
  - Incompatible units: Dropdown restricts choices to domain-valid units (Tonnes, MT, $m^3$, Rakes, Hours, %).
- **Implementation Status**: **Proposed & Blueprint Defined** (Frontend UI blueprint specified in `docs/frontend-page-specification.md`).

---

### Workflow 3: Human-in-the-Loop Extraction Verification Workbench
- **Primary Actor**: CMPDI Technical Officer (`cmpdi`) or Area Manager.
- **Preconditions**: Document is in `Needs review` or `Partially extracted` status; user holds `documents.verify` permission.
- **State Transition**:
  $$\text{Needs review} \longrightarrow \begin{cases} \text{Verified} \longrightarrow \text{Submitted} \\ \text{Returned for correction} \\ \text{Marked for clarification} \end{cases}$$
- **Step-by-Step Execution**:
  1. Officer opens document in Validation Workbench (`/documents/:id/verify`).
  2. System renders original document facsimile on the left panel and extracted key-value fields on the right panel.
  3. Bounding boxes highlight source text on the facsimile when a field is focused.
  4. Officer inspects low-confidence or flagged fields (e.g. blurry handwritten digits).
  5. Officer edits field value, verifies unit, and records an explanation note in the audit log (e.g. *"Corrected digit 8 misread as 0 due to paper fold"*).
  6. Officer clicks *"Save Corrections"*. Field state updates to `verified`.
  7. When all critical fields are verified, officer clicks *"Submit for Review"*. Record advances to `Submitted`.
  8. If document is illegible or missing pages, officer clicks *"Return for Correction"*, entering a mandatory rejection note.
- **Failure Paths**:
  - Missing verification remarks: Officer cannot return a document without specifying the discrepancy reason.
- **Implementation Status**: **Partially Implemented in Client** (Interactive side-by-side editing in `ValidationWorkbenchPage.tsx`).

---

### Workflow 4: Cross-Organization Information Requests & Submissions
- **Primary Actor**: Ministry of Coal (`ministry_coal`) or CIL Headquarters (`cil_hq`).
- **Responding Actor**: Subsidiary / Mine Officer (`subsidiary_officer`) or CIL Technical Division.
- **Preconditions**: Requesting user holds `requests.create` permission; recipient organization is specified.
- **State Transition**:
  $$\text{Draft} \longrightarrow \text{Awaiting response} \longrightarrow \text{Partially answered} \longrightarrow \text{Submitted} \longrightarrow \begin{cases} \text{Completed} \\ \text{Clarification required} \end{cases}$$
- **Step-by-Step Execution**:
  1. Ministry or CIL officer navigates to `/requests` and clicks *"Create Request"*.
  2. Officer defines Subject, Target Subsidiary, Reporting Period, Specific Data Required, Due Date, and Reference Context.
  3. Request transitions to `Awaiting response` and appears in the target Subsidiary Officer's dashboard.
  4. Subsidiary Officer opens request, inputs requested figures, attaches verified return documents, and clicks *"Submit Response"*.
  5. Request transitions to `Submitted`.
  6. Requesting officer reviews response:
     - If complete: Clicks *"Accept & Close"*; request transitions to `Completed`.
     - If incomplete: Clicks *"Request Clarification"*; request transitions to `Clarification required` with feedback notes.
- **Implementation Status**: **Proposed & Blueprint Defined** (Data model defined in `docs/data-model.md`).

---

### Workflow 5: Multi-Subsidiary Submission Review & Baseline Comparison
- **Primary Actor**: CIL Headquarters Reviewer (`cil_hq`) or Ministry Executive (`ministry_coal`).
- **Preconditions**: Records have status `Submitted`; reviewer holds `submissions.review` permission.
- **State Transition**:
  $$\text{Submitted} \longrightarrow \text{Under review} \longrightarrow \begin{cases} \text{Accepted for next stage} \\ \text{Returned for correction} \end{cases}$$
- **Step-by-Step Execution**:
  1. Reviewer navigates to `/review` and selects a submitted return package.
  2. System displays submitted values alongside historical baselines (e.g. Previous Month, Same Period Last Year, Annual Target).
  3. System highlights variances exceeding $\pm 5\%$.
  4. Reviewer evaluates attached source documents and verification notes.
  5. **Branch A — Accept**: Reviewer clicks *"Accept for Next Stage"*. Status becomes `Accepted for next stage`. Record is now eligible for inclusion in consolidated automated reports and national RAG search.
  6. **Branch B — Return**: Reviewer identifies an unexplained variance or missing dispatch slip, inputs review notes, and clicks *"Return for Correction"*. Record transitions to `Returned for correction` and alerts the colliery author.
- **Failure Paths**:
  - Incompatible baseline units: System displays warning: *"Incompatible comparison basis detected. Adjust units before evaluation."*
- **Implementation Status**: **Proposed & Blueprint Defined**.

---

### Workflow 6: Grounded AI Query & Anti-Hallucination Guardrail ("Ask MineSetu")
- **Primary Actor**: Any Authenticated Persona (Scoped to permissions).
- **Preconditions**: User holds `queries.execute` permission; query text provided.
- **State Transition**:
  $$\text{Inquiry Submitted} \longrightarrow \text{Scope Resolution} \longrightarrow \text{Grounded Retrieval} \longrightarrow \begin{cases} \text{Answer with Citations} & (\text{Evidence Available}) \\ \text{Insufficient Evidence Fallback} & (\text{No Authorized Evidence}) \\ \text{Conflict Warning} & (\text{Inconsistent Sources}) \end{cases}$$
- **Step-by-Step Execution**:
  1. User submits an operational question (e.g. *"What was the coal production and OB removal for ECL Rajmahal in August 2026?"*).
  2. System resolves user's persona and organizational scope (e.g. restricts subsidiary officer to ECL).
  3. System searches verified document repository for matching text chunks and extracted structured records.
  4. **Branch A — Evidence Exists**:
     - System retrieves source passages and deterministic arithmetic values.
     - Formats strict prompt requiring explicit citations `[Source Name, Page #, Table #]`.
     - AI synthesizes natural language summary.
     - Client renders interactive citation badges linking directly to source documents.
  5. **Branch B — Evidence Missing**:
     - Search yields zero relevant records or documents are outside authorized scope.
     - System returns: *"Insufficient source evidence exists in authorized records to answer this inquiry."*
     - UI presents action buttons: *"Upload Document"*, *"Enter Data Manually"*, or *"Create Information Request"*.
  6. **Branch C — Conflicting Sources**:
     - System detects differing numbers across two verified returns for the same period.
     - System outputs both figures with their source links, explicitly flagging: *"Difference detected between source documents."*
- **Implementation Status**: **Implemented in Client Prototype** (Semantic search and guardrails in `QueryPage.tsx`).

---

### Workflow 7: Multi-Format Report Drafting & Export
- **Primary Actor**: Ministry Executive (`ministry_coal`), CIL HQ (`cil_hq`), or CMPDI (`cmpdi`).
- **Preconditions**: User holds `reports.generate` permission; at least one verified return exists in selected scope.
- **State Transition**:
  $$\text{Configured} \longrightarrow \text{Compiling} \longrightarrow \text{Draft Preview} \longrightarrow \begin{cases} \text{Exported PDF} \\ \text{Exported Word (.docx)} \\ \text{Exported Excel (.xlsx)} \end{cases}$$
- **Step-by-Step Execution**:
  1. User navigates to `/reports` and selects Report Type, Reporting Period, Subsidiary Scope, and Output Formats (PDF, Word, Excel).
  2. User selects source returns to include as ground truth.
  3. System compiles tabular figures deterministically from approved records.
  4. AI synthesizes narrative executive brief with citations.
  5. User previews report on screen (Title, Summary, Metrics Table, Sources, Draft Watermark).
  6. User can edit the narrative text or click *"Regenerate Section"*.
  7. User clicks export buttons:
     - `Export PDF`: Generates formal print-ready layout with institutional headers.
     - `Export Word (.docx)`: Generates editable document with tables and citations.
     - `Export Excel (.xlsx)`: Generates structured multi-tab workbook with formulas and source metadata.
- **Implementation Status**: **Partially Implemented** (Print-to-PDF working; Word and Excel export schemas defined).

---

### Workflow 8: Activity Logging & Audit Trail
- **Primary Actor**: System (Automatic background trigger).
- **Preconditions**: Any state-mutating action occurs (upload, edit, verify, review, query, export).
- **Step-by-Step Execution**:
  1. Action completes successfully or is denied.
  2. System dispatches structured audit event:
     - `timestamp`: ISO-8601 UTC timestamp.
     - `actor_name`: Current user name.
     - `actor_role`: Current user role.
     - `action`: Specific action key (e.g. `documents.upload`, `ocr.verify`).
     - `entity_type`: `document`, `manual_record`, `request`, `report`.
     - `entity_id`: Target unique identifier.
     - `result`: `success`, `failure`, `denied`.
     - `metadata`: JSON payload containing diffs or query parameters.
  3. Record is appended to immutable audit ledger.
  4. Visible in `/activity` table.
- **Implementation Status**: **Implemented in Client State** (`AppContext.tsx` audit logger).
