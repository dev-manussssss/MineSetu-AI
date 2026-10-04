# MineSetu AI — Role-Based Access Control & Persona Specifications

> **STATUS**: APPROVED MASTER SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **CANONICAL LOCATION**: `docs/role-permissions.md`

---

## 1. Prototype Persona Framework

To balance authentic institutional representation with clear prototype boundaries, MineSetu AI defines **four approved target personas**. 

> **LEGAL & SECURITY DISCLAIMER**:  
> These four personas are prototype design archetypes created for workflow demonstration and access-control testing. They do **not** represent official Government of India, Ministry of Coal, or Coal India Limited security credentials, nor do they claim to reflect the exact internal permission matrices of production MDMS networks.

---

## 2. The Four Approved Personas

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        MINISTRY OF COAL (MoC)                          │
│  - National Oversight  - Strategic Inquiries  - Executive Reporting    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       COAL INDIA HEADQUARTERS (CIL HQ)                 │
│  - Multi-Subsidiary Consolidation  - Variance Reconciliation  - Reports│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│             CMPDI                │ │    SUBSIDIARY / MINE OFFICER     │
│  - Technical & Geological Review │ │  - Primary Return Uploads        │
│  - Extraction Workbench          │ │  - Manual Structured Data Entry  │
│  - Topic Intelligence            │ │  - Field Slip Corrections        │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

---

### Persona 1: Ministry of Coal (`ministry_coal`)
- **Organizational Context**: Joint Secretary / Director level within the Ministry of Coal, Shastri Bhawan, New Delhi.
- **Operational Purpose**: High-level cross-subsidiary governance, monitoring national coal production targets, reviewing compiled briefs, creating statutory information requests, and preparing draft responses for parliamentary oversight.
- **Data Access Scope**: **National Aggregate & Cross-Subsidiary View** (Authorized to view all approved multi-subsidiary records; restricted from raw unverified colliery draft slips).
- **Visible Navigation Modules**:
  1. `Dashboard` (National aggregate metrics, subsidiary pacing, pending ministerial requests).
  2. `Ask MineSetu` (Strategic cross-organization questions with source citations).
  3. `Requests` (Create and track statutory information requests sent to CIL/Subsidiaries).
  4. `Review & Approvals` (Review consolidated executive briefs and responses).
  5. `Reports` (Compile and export national executive briefs in Word, PDF, Excel).
  6. `Activity History` (Audit trail of executive submissions).
- **Key Permitted Actions**:
  - `requests.create`: Issue formal data requests to CIL HQ or specific subsidiaries.
  - `requests.review`: Review submitted responses and supporting evidence.
  - `reports.generate`: Compile national production reviews.
  - `queries.execute`: Execute national-scope RAG queries.
- **Forbidden Actions**:
  - Direct field-level OCR correction (technical responsibility belongs to CMPDI/Collieries).
  - Unilateral modification of raw colliery extraction numbers.
- **Demo Identity**:
  - **Name**: Dr. Rajeshwar Sharma, IAS
  - **Title**: Joint Secretary (Coal Operations), Ministry of Coal
  - **Demo Email**: `ministry.exec@demo.coal.gov.in`

---

### Persona 2: Coal India Headquarters (`cil_hq`)
- **Organizational Context**: Director (Technical) / General Manager (Production) at Coal India Limited Corporate Headquarters, Kolkata.
- **Operational Purpose**: Consolidating performance across all eight operational subsidiaries, monitoring actual production vs statutory targets, following up on missing inputs, identifying variances, and preparing apex-level operational reports.
- **Data Access Scope**: **Enterprise Subsidiary Scope** (Access to all 8 CIL operating subsidiaries: ECL, BCCL, CCL, NCL, WCL, SECL, MCL, CMPDI).
- **Visible Navigation Modules**:
  1. `Dashboard` (Subsidiary comparative pacing, target variance alerts, submission tracker).
  2. `Ask MineSetu` (Enterprise comparative inquiries).
  3. `Documents` (Enterprise archive of subsidiary returns).
  4. `Requests` (Track submissions from subsidiaries; fulfill Ministry requests).
  5. `Review & Approvals` (Examine submitted subsidiary returns; accept for consolidation or return for correction).
  6. `Reports` (Generate consolidated multi-subsidiary quarterly/monthly briefs).
  7. `Topics & Word Cloud` (Review operational clusters across subsidiaries).
  8. `Activity History`.
- **Key Permitted Actions**:
  - `submissions.review`: Review submitted records from subsidiaries.
  - `submissions.return`: Return conflicting or incomplete records for field correction.
  - `data.compare`: Compare figures between subsidiaries and historical baselines.
  - `reports.generate`: Prepare enterprise consolidated reports.
- **Forbidden Actions**:
  - Overwriting colliery-level source evidence without field officer review.
- **Demo Identity**:
  - **Name**: Er. S. N. Bhattacharya
  - **Title**: Chief General Manager (Production & Planning), CIL HQ
  - **Demo Email**: `cil.director@demo.coalindia.in`

---

### Persona 3: CMPDI (`cmpdi`)
- **Organizational Context**: Exploration & Mining Data Cell, Central Mine Planning & Design Institute, Ranchi.
- **Operational Purpose**: Scientific, geological, and technical oversight. Verifying OCR extraction accuracy from technical returns, comparing geological metrics against baseline drilling data, adding technical remarks, and analyzing exploratory operational topics and word clouds.
- **Data Access Scope**: **Technical & Multi-Subsidiary Verification Scope** (Deep access to extracted data fields, confidence metrics, and geological reports across subsidiaries).
- **Visible Navigation Modules**:
  1. `Dashboard` (Ingestion queue status, OCR confidence distribution, extraction review backlog).
  2. `Ask MineSetu` (Technical queries across geological & mining records).
  3. `Documents` (Full document archive with extraction workbench access).
  4. `Review & Approvals` (Technical verification queue; field-by-field correction).
  5. `Topics & Word Cloud` (Exploratory topic clustering across inspection logs and technical notes).
  6. `Reports` (Technical assessment reports).
  7. `Activity History`.
- **Key Permitted Actions**:
  - `documents.verify`: Edit extracted fields in Validation Workbench, resolve blurry OCR numbers, and record verification notes.
  - `documents.flag`: Flag conflicting figures or missing statutory tables.
  - `topics.explore`: Filter word clouds, analyze semantic clusters across remarks.
  - `reports.generate`: Technical and geological assessments.
- **Forbidden Actions**:
  - Final executive policy approval for parliamentary transmissions.
- **Demo Identity**:
  - **Name**: Dr. Ananya Mukherjee
  - **Title**: Nodal Technical Coordinator, CMPDI Mining Systems Cell
  - **Demo Email**: `cmpdi.nodal@demo.cmpdi.co.in`

---

### Persona 4: Subsidiary / Mine Officer (`subsidiary_officer`)
- **Organizational Context**: Colliery Data Entry Officer / Area General Management at colliery project level (e.g., Eastern Coalfields Limited, Rajmahal Open Cast Project).
- **Operational Purpose**: Primary source contributor. Uploading physical scanned returns, manually entering structured production/overburden figures when file uploads are impractical, responding to information requests, reviewing extraction errors on their own returns, and tracking submission statuses.
- **Data Access Scope**: **Strictly Scoped to Assigned Subsidiary & Mine** (e.g. ECL / Rajmahal OCP; no unrestricted access to other subsidiaries' internal draft returns).
- **Visible Navigation Modules**:
  1. `Dashboard` (My mine operational summary, upload queue, assigned requests).
  2. `Ask MineSetu` (Scoped strictly to authorized mine & subsidiary documents).
  3. `Documents` (Upload documents, enter manual records, review my extractions).
  4. `Requests` (View and fulfill assigned information requests).
  5. `Activity History` (Personal submission history).
- **Key Permitted Actions**:
  - `documents.upload`: Upload PDF, DOCX, and scanned operational returns.
  - `manual.entry`: First-class structured entry of production, overburden, and despatch rows.
  - `documents.correct`: Correct OCR extractions for owned documents.
  - `requests.respond`: Submit requested figures with attached evidence.
- **Forbidden Actions**:
  - Viewing unapproved returns or sensitive data from other subsidiaries.
  - Approving records for enterprise consolidation.
- **Demo Identity**:
  - **Name**: Manoj Kumar Soren
  - **Title**: Field Data Ingestion Officer, Rajmahal OCP (ECL)
  - **Demo Email**: `rajmahal.officer@demo.ecl.gov.in`

---

## 3. Legacy 7-Role Mapping Matrix

The initial prototype codebase implemented 7 fine-grained roles. To align with the approved 4-persona architecture without breaking existing test harnesses, the legacy roles map deterministically as follows:

| Legacy Prototype Role | Approved Target Persona | Architectural Alignment Notes |
|---|---|---|
| `ministry_exec` | **Ministry of Coal** | Direct 1:1 mapping. Retains executive parliamentary and macro-reporting capabilities. |
| `parliamentary_cell` | **Ministry of Coal** | Sub-workflow within MoC. Legislative drafting merged into MoC's Request & Report workspace. |
| `cil_exec` | **CIL Headquarters** | Direct 1:1 mapping. Apex operational consolidation. |
| `cmpdi_nodal` | **CMPDI** | Direct 1:1 mapping. Verification workbench and topic modeling lead. |
| `subsidiary_mgr` | **Subsidiary / Mine Officer** | Merged into field/subsidiary hierarchy. Area-level oversight. |
| `field_officer` | **Subsidiary / Mine Officer** | Direct field contributor tier for upload and manual data entry. |
| `sys_admin` | *System Administration* | Retained in background for demo dataset seeding, user provisioning, and audit ledger management. |

---

## 4. Granular Permissions Registry

| Permission Key | Description | Authorized Personas |
|---|---|---|
| `documents.upload` | Upload PDF and scanned image documents | `subsidiary_officer`, `cmpdi`, `sys_admin` |
| `manual.entry` | First-class structured manual data entry | `subsidiary_officer`, `cmpdi` |
| `documents.view` | View documents within authorized data scope | All 4 Personas (Scoped) |
| `documents.verify`| Edit OCR extraction values & confirm corrections | `cmpdi`, `subsidiary_officer` |
| `submissions.review`| Review submitted records against baselines | `cil_hq`, `ministry_coal`, `cmpdi` |
| `submissions.return`| Return submitted records for correction | `cil_hq`, `cmpdi` |
| `requests.create` | Issue structured information requests | `ministry_coal`, `cil_hq` |
| `requests.respond`| Submit formal responses to requests | `subsidiary_officer`, `cil_hq` |
| `queries.execute` | Execute AI queries in "Ask MineSetu" | All 4 Personas (Scoped) |
| `reports.generate`| Generate & export reports (PDF, Word, Excel) | `ministry_coal`, `cil_hq`, `cmpdi` |
| `topics.analyze` | Access topic clusters & word cloud | `cmpdi`, `cil_hq`, `ministry_coal` |
| `audit.view` | Inspect system-wide audit event ledger | All 4 Personas (Personal history; Admin sees global) |

---

## 5. Backend-Enforced Authorization Rules

1. **Server-Side Enforcement**:
   - Every API endpoint checks caller identity from JWT / session header.
   - `can(user, permission)` is executed on the server before database reads or mutations.
2. **Data Scoping Rules**:
   - `subsidiary_officer`: Queries automatically append `WHERE subsidiary_code = user.subsidiary_code`.
   - `cil_hq`: Queries span all 8 subsidiaries (`ECL`, `BCCL`, `CCL`, `NCL`, `WCL`, `SECL`, `MCL`, `CMPDI`).
   - `ministry_coal`: Queries access approved multi-subsidiary records; unverified colliery drafts are excluded.
3. **No Insecure Direct Object References (IDOR)**:
   - Users cannot view or modify a document simply by altering the document ID in URL parameters. Ownership or organizational scope is verified on every request.
