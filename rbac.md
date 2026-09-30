# Role-Based Access Control (RBAC) Specification — MDMS + Mindsetu AI

## 1. Prototype Authority Model

As stated in `guidelines.md` (Sections 0, 8, and 9), this role model is a **prototype mapping** based on supplied SIH/MDMS project documents to demonstrate permission isolation, multi-level approvals, and data scoping.

The 7 primary prototype roles are:

1. **Ministry Executive (`ministry_exec`)**
   - *Persona*: MoC / Joint Secretary Level.
   - *Scope*: All Coal India subsidiaries (National aggregate view).
   - *Focus*: Executive macro-analytics, high-level summaries, parliamentary Q&A overview, strategic AI queries.
2. **CIL Executive Management (`cil_exec`)**
   - *Persona*: CIL HQ Chairman / Director Tech.
   - *Scope*: All 8 CIL operating subsidiaries.
   - *Focus*: Enterprise production tracking, subsidiary performance comparison, high-level report sign-off.
3. **CMPDI Nodal Expert (`cmpdi_nodal`)**
   - *Persona*: Exploration & Technical Data Coordinator at CMPDI.
   - *Scope*: Technical geological & operational data repository across subsidiaries.
   - *Focus*: Document ingestion queue, OCR extraction review, data validation workbench, topic intelligence, report generation.
4. **Subsidiary Manager (`subsidiary_mgr`)**
   - *Persona*: General Manager at ECL / SECL / BCCL etc.
   - *Scope*: Specific subsidiary coalfields and areas.
   - *Focus*: Mine data verification, local document upload review, approvals, subsidiary-specific reporting.
5. **Parliamentary Query Cell (`parliamentary_cell`)**
   - *Persona*: Parliamentary Q&A Desk Officer.
   - *Scope*: Historical parliamentary answers, approved operational metrics, vetted archival sources.
   - *Focus*: Query intake, grounded draft generation with source verification, executive sign-off routing, export to official format.
6. **Field / Mine Data Officer (`field_officer`)**
   - *Persona*: Colliery / Mine Project Data Entry & Ingestion Officer.
   - *Scope*: Individual mine / colliery level.
   - *Focus*: Daily document upload, OCR error correction, physical slip verification, restricted search.
7. **System Administrator (`sys_admin`)**
   - *Persona*: CMPDI ICT / System Administrator.
   - *Scope*: Global system infrastructure.
   - *Focus*: User provisioning, role assignments, system health, AI service monitoring, audit logs, demo seed/reset.

---

## 2. Granular Permissions Registry

| Permission Code | Description | Authorized Roles |
|---|---|---|
| `documents.upload` | Upload physical scans and PDF reports | `field_officer`, `cmpdi_nodal`, `subsidiary_mgr`, `sys_admin` |
| `documents.view` | View documents within assigned data scope | All roles |
| `documents.verify` | Edit OCR extractions & flag errors | `field_officer`, `cmpdi_nodal`, `subsidiary_mgr` |
| `documents.approve` | Final sign-off on extracted data into MDMS | `cmpdi_nodal`, `subsidiary_mgr`, `cil_exec` |
| `analytics.national` | View nation-wide aggregates & CIL overview | `ministry_exec`, `cil_exec`, `sys_admin` |
| `analytics.subsidiary` | View subsidiary-level operational metrics | `ministry_exec`, `cil_exec`, `cmpdi_nodal`, `subsidiary_mgr` |
| `queries.execute` | Execute AI search & natural language queries | All roles (scoped to permissions) |
| `parliamentary.draft` | Generate & edit grounded parliamentary answers | `parliamentary_cell`, `ministry_exec`, `sys_admin` |
| `parliamentary.approve`| Approve parliamentary responses for submission | `ministry_exec` |
| `reports.generate` | Run automated report builder with citations | `ministry_exec`, `cil_exec`, `cmpdi_nodal`, `subsidiary_mgr` |
| `topic.analyze` | Access topic clusters & word cloud intelligence | `ministry_exec`, `cil_exec`, `cmpdi_nodal`, `subsidiary_mgr`, `parliamentary_cell` |
| `admin.users` | Manage user roles and system settings | `sys_admin` |
| `audit.view` | Inspect system-wide audit event ledger | `sys_admin`, `cmpdi_nodal` |

---

## 3. Route Access Matrix

| Route Path | View / Module | Authorized Roles |
|---|---|---|
| `/` | Institutional Landing Page | Public |
| `/login` | Demo Persona & Manual Login | Public |
| `/dashboard` | Role-Tailored Operational Dashboard | All Authenticated |
| `/documents` | Ingestion Queue & Document Explorer | `field_officer`, `cmpdi_nodal`, `subsidiary_mgr`, `cil_exec`, `sys_admin` |
| `/documents/:id/verify` | OCR Extraction & Validation Workbench | `field_officer`, `cmpdi_nodal`, `subsidiary_mgr` |
| `/compare` | Document & Baseline Comparison Tool | `cmpdi_nodal`, `subsidiary_mgr`, `cil_exec` |
| `/topics` | Topic Identification & Word Cloud | `ministry_exec`, `cil_exec`, `cmpdi_nodal`, `subsidiary_mgr`, `parliamentary_cell` |
| `/query` | AI Query & Source Grounded RAG Search | All Authenticated |
| `/reports` | Automated Report Builder & Archive | `ministry_exec`, `cil_exec`, `cmpdi_nodal`, `subsidiary_mgr` |
| `/parliamentary` | Parliamentary Query Cell Desk | `parliamentary_cell`, `ministry_exec`, `sys_admin` |
| `/admin` | System Health, Audit Trail, User Roles | `sys_admin` |

---

## 4. Enforcement Strategy

Never rely on client-side routing alone.
- **Client**: `can(user, permission)` controls navigation visibility, button states, and redirects unauthorized route attempts.
- **Backend / Supabase RLS**: PostgreSQL Row-Level-Security evaluates the authenticated user's JWT `role` and `subsidiary_id` data scope before executing any SQL query or mutation.
