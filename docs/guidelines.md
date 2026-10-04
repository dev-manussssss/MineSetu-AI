# MineSetu AI — Master Engineering & Documentation Guidelines

> **STATUS**: APPROVED MASTER SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **APPLICATION SCOPE**: Standalone Prototype & Concept Demonstration  
> **CANONICAL LOCATION**: `docs/guidelines.md`

---

## 1. Project Purpose & Positioning

**MineSetu AI** is a proposed AI-assisted reporting workspace designed to explore and demonstrate enhanced reporting workflows associated with the **Mine Data Management System (MDMS)** in the Indian coal sector.

### 1.1 Non-Negotiable Positioning & Legal Disclaimers
1. **Standalone Prototype**: MineSetu AI is a standalone prototype and research concept demonstration. It is **not** the official MDMS portal.
2. **Prohibited Claims**: The codebase, UI, and documentation must **never** claim:
   - Live integration or active connection to the production MDMS network.
   - Official Government of India authentication, approval, certification, or endorsement.
   - Live Ministry of Coal (MoC), Coal India Limited (CIL), or Central Mine Planning & Design Institute (CMPDI) production data.
   - An established official API or production-grade government infrastructure.
3. **Mandatory UI Disclaimer**: The institutional disclaimer banner must remain prominently displayed on public-facing and unauthenticated views:
   > *"MineSetu AI demonstrates a proposed AI-powered extension to the MDMS reporting workflow. This is a standalone prototype, not the official MDMS portal, and live integration is not currently claimed."*
4. **Watermarking Synthetic Data**: Every demo record, metric, and chart displayed in the prototype must be explicitly watermarked as synthetic or sample demonstration data (`is_demo: true`).

---

## 2. Documentation Source-of-Truth Hierarchy

To prevent ambiguity, contradictory claims, and configuration drift, all contributors and coding agents must strictly adhere to the following hierarchy of authority:

```text
Level 1: Approved Product Decisions (This Specification & Product Directives)
   │
   ▼
Level 2: docs/guidelines.md (Master Working Rules, Standards & Conventions)
   │
   ▼
Level 3: docs/decisions-log.md (Explicit Architectural Decisions & ADRs)
   │
   ▼
Level 4: docs/implementation-status.md (Actual Working Code, Mocks, Blockers)
   │
   ▼
Level 5: Domain Specifications (docs/architecture.md, docs/role-permissions.md, etc.)
   │
   ▼
Level 6: Source Code (Ground Truth for Current Working Code; Docs Must Not Overclaim)
   │
   ▼
Level 7: External Facts (Must be Cited or Flagged as "UNVERIFIED FACT")
```

### 2.1 Documentation Rules
- **No Silent Merging**: When older documents conflict with newer requirements, do not silently average or merge them. Resolve the conflict using the approved decisions in `docs/decisions-log.md` and explicitly document remaining uncertainties.
- **Top Status Headers**: Every documentation file must start with a standardized header block containing:
  - Document Title & Purpose.
  - `Status`: `APPROVED MASTER SPECIFICATION`, `PROPOSAL`, `DRAFT`, or `HISTORICAL ARCHIVE`.
  - Last updated date.
- **Link Conventions**: All documentation cross-references must use relative Markdown links (e.g., `[Architecture](architecture.md)`).
- **Prohibited Fabrications**: Never invent official government procedures, internal circular numbers, or API specifications to fill knowledge gaps. Mark unverified details explicitly.

---

## 3. Epistemic Classification System (Terminology Labels)

All technical prose, architectural proposals, UI copy, and status updates must explicitly distinguish between the following epistemic states:

| Status Label | Formal Definition | Usage Context |
|---|---|---|
| **VERIFIED FACT** | An empirical fact verified in the local codebase, git history, or verified external source. | Verified dependencies, file paths, repository structure, npm build outputs. |
| **APPROVED PRODUCT DECISION** | A confirmed architectural or product direction approved by the product owner. | Product naming, 4 persona definitions, first-class manual entry, 3 core AI modules. |
| **PROPOSAL** | A technically viable recommendation pending implementation or evaluation. | Backend framework choices, database selection (e.g. Supabase), OCR engine choices. |
| **ASSUMPTION** | A working premise adopted to make progress in the absence of verified facts. | Document throughput estimates, network latency assumptions in colliery environments. |
| **MOCKED IN PROTOTYPE** | A feature simulated purely in client-side state without backend persistence. | Demo authentication, mock search retrieval, in-memory report generation. |
| **IMPLEMENTED** | A capability backed by real, executable, tested source code in this repository. | React 19 SPA routes, tokenized design system, client-side RBAC guards. |
| **NOT VERIFIED** | An external claim, workflow, or assumption lacking authoritative evidence. | Production MDMS database schemas, live CIL network topologies, DGMS circulars. |

---

## 4. Standard Record & Workflow Status Values

To ensure consistency across UI badges, database tables, and API responses, only the following standardized status tokens are permitted:

| Status Token | Visual Semantic | Definition & Lifecycle Meaning |
|---|---|---|
| `Draft` | Neutral (Slate) | Record or report has been created locally but not submitted for verification or processing. |
| `Processing` | Info (Blue Animated) | Automated extraction, OCR, or embedding computation is currently in progress. |
| `Needs review` | Warning (Amber) | Automated extraction completed with confidence warnings or requires human verification. |
| `Ready to search`| Success (Emerald) | Extracted data or document text has been validated and indexed for retrieval. |
| `Submitted` | Info (Blue) | Contributor or field officer has submitted the record/document for formal review. |
| `Under review` | Warning (Amber) | Technical or headquarters reviewer is actively examining submitted data against source. |
| `Returned for correction` | Error (Rose) | Reviewer flagged discrepancies, missing attachments, or invalid units; returned to author. |
| `Failed` | Error (Rose) | OCR parsing failed, file corrupted, or network ingestion error occurred. |
| `Completed` | Success (Emerald) | Request has been fulfilled with verified evidence and closed. |
| `Approved` | Success (Emerald) | Record has received authoritative sign-off (permitted only when verified authority applies). |

> **CRITICAL RULE**: Never use color alone to communicate status. Always pair colors with clear textual labels and descriptive Lucide icons.

---

## 5. UI Copy, Tone, and Accessibility Standards

### 5.1 Professional Enterprise Tone
- The interface must communicate sobriety, institutional confidence, and operational clarity.
- **Forbidden Buzzwords**: User-facing copy must **never** expose internal machine-learning jargon such as *embeddings, vector database, RAG, temperature, token limit, serverless function, or endpoint* to ordinary operational users.
- Use natural, domain-appropriate terminology:
  - Say *"Search available records"* instead of *"Query vector index"*.
  - Say *"Source documents"* instead of *"Retrieved context chunks"*.
  - Say *"Prepare automated report draft"* instead of *"Invoke LLM generation pipeline"*.
  - Say *"Difference detected against baseline"* instead of *"AI flagged an anomaly"*.

### 5.2 Accessibility (WCAG 2.1 AA Conformance)
- **Contrast Ratios**: Minimum 4.5:1 for standard text; minimum 3:1 for large display text and interactive UI controls.
- **Focus Rings**: All interactive elements (buttons, inputs, links, tabs) must display a clear, high-contrast focus outline (`2px solid var(--accent-pill)`, `offset 2px`).
- **Screen Readers**: All icon-only buttons (e.g. sidebar collapse, search clear, close modals) must have descriptive `aria-label` attributes.
- **Tabular Numerals**: Numerical data in tables, metrics, and KPI cards must use monospace or tabular numerals (`font-variant-numeric: tabular-nums`) to preserve column alignment.

---

## 6. Design System & Brand Standards

### 6.1 Brand Heritage & Assets
- **Product Name**: **MineSetu AI** (Wordmark: *MineSetu* in slate `#0F172A`, *AI* in cobalt blue `#1D4ED8`).
- **Official Logo Emblem**: The official brand asset is located at:
  `assets/design references /file_00000000e9e88208ae070777ee045cb1.png`
  - Visual Description: High-resolution circular emblem depicting stylized geometric mountain/mine peaks in deep navy/charcoal and a luminous sky-blue winding river/bridge ("Setu") passing through.
  - This asset must **never** be replaced with a generic AI sparkles icon or unrelated placeholder.
- **Design References**: The aesthetic is directly informed by:
  - `assets/design references /ref1.png` & `reference-layout-a.pdf`
  - `assets/design references /ref2.png` & `reference-layout-b.pdf`
  - Characteristics: Ultra-clean light neutral canvas (`#F8FAFC`), crisp white cards (`#FFFFFF`), slim icon sidebar (68px collapsed / 240px expanded), high-contrast data cards, generous corner radii (16–20px), and restrained shadows.

### 6.2 Coherent Palette Tokens
```css
/* Surface Tokens */
--bg-app: #F8FAFC;            /* Light neutral dashboard canvas */
--bg-surface: #FFFFFF;        /* Pure white card and modal surfaces */
--bg-surface-muted: #F1F5F9;  /* Muted table headers & section backgrounds */
--bg-surface-hover: #E2E8F0;  /* Subtle row and button hover */
--bg-dark-anchor: #0F172A;    /* Deep slate for brand anchors & auth panels */
--bg-dark-surface: #1E293B;   /* Elevated dark container surface */

/* Text Tokens */
--text-primary: #0F172A;      /* High-contrast headings and body */
--text-secondary: #475569;    /* Subheadings, labels, and secondary copy */
--text-muted: #64748B;        /* Helper text, timestamps, and placeholders */
--text-inverse: #FFFFFF;      /* Text on dark surfaces and buttons */

/* Brand & Accents */
--accent-primary: #1D4ED8;    /* Enterprise Cobalt Blue */
--accent-primary-hover: #1E40AF;
--accent-light: #EFF6FF;      /* Light blue tint for active tabs and highlights */
--accent-pill: #3B82F6;       /* Bright blue focus and badge accent */
--accent-warm: #D97706;       /* Warm Amber/Orange accent inspired by references */
--accent-warm-light: #FEF3C7; /* Amber highlight background */

/* Semantic Status Tokens */
--status-success-bg: #ECFDF5;
--status-success-text: #065F46;
--status-success-border: #A7F3D0;

--status-warning-bg: #FFFBEB;
--status-warning-text: #92400E;
--status-warning-border: #FDE68A;

--status-error-bg: #FEF2F2;
--status-error-text: #991B1B;
--status-error-border: #FECACA;

--status-info-bg: #F0F9FF;
--status-info-text: #075985;
--status-info-border: #BAE6FD;
```

---

## 7. Dual First-Class Ingestion: Manual Data Entry & Upload

A central architectural mandate of MineSetu AI is that **manual structured data entry is a first-class citizen alongside document upload**:
1. **Document Upload**:
   - For users who possess digital PDF returns, scanned statutory sheets, or operational spreadsheets.
   - Triggers optical extraction, layout parsing, and human-in-the-loop review.
2. **Manual Data Entry**:
   - For colliery officers, site engineers, or operational units who cannot upload files due to connectivity constraints, physical document possession, or confidential field notes.
   - Provides a structured dynamic form: Category (Production, Overburden, Geological, Safety, Despatch), Reporting Period, Mine/Subsidiary, and dynamic key-value rows with explicit units.
   - Requires field-level validation, unit enforcement, author attribution, and submission tracking.
   - If a source reference is missing, the record must explicitly state *"Source not provided"* — **never invent or hallucinate a citation**.

---

## 8. Data Integrity, Evidence & Anti-Fabrication Principles

1. **Deterministic Calculations over AI Estimation**:
   - Totals, variances, percentages, and year-on-year comparisons must **always** be calculated by deterministic code (arithmetic functions), **never** generated or guessed by an LLM.
2. **No Silent Approvals**:
   - Uploading a document is not processing.
   - Processing is not verification.
   - Verification is not approval.
   - Automated OCR extractions must **never** be silently committed into approved databases without human review.
3. **Missing Data Handling**:
   - Never treat missing figures as zero. A missing value must be marked as *"Data not reported"* or *"Missing"*.
   - Never compare figures with incompatible units (e.g. Raw Coal vs Washed Coal; MT vs Tonnes) without explicit conversion or user warning.
4. **Source Grounding & Citations**:
   - Every AI response must cite its origin document, reporting period, page number, and table reference.
   - If evidence does not exist in accessible records, the AI must explicitly answer: *"Insufficient source evidence exists in authorized records to answer this inquiry."* and provide actionable follow-ups (e.g. request information, upload document, manual entry).

---

## 9. Security, Privacy & Environment Guidelines

1. **Zero Client Secrets**:
   - Never expose API keys (xAI/Grok, OpenAI, Anthropic) or Supabase `service_role` credentials in client-side code or `VITE_*` environment variables.
   - Only safe, public tokens (e.g. `VITE_SUPABASE_ANON_KEY`) may be bundled into browser code.
2. **Backend Enforcement**:
   - Client-side permission checks (`can(user, permission)`) are solely for user experience (hiding buttons, disabling inputs).
   - Real security and data scoping must be enforced server-side via API route validation, JWT authentication, and database Row-Level Security (RLS).
3. **Data Residency & PII**:
   - Operational mining data must never be transmitted to third-party model providers for training.
   - Synthetic demo records must be strictly isolated from any future production environments.

---

## 10. Complete Documentation Index

All contributors, engineers, and coding agents should consult the following canonical documents:

1. **Master Guidelines**: [docs/guidelines.md](guidelines.md) *(This file)*
2. **Project Overview**: [docs/project-overview.md](project-overview.md)
3. **System Architecture**: [docs/architecture.md](architecture.md)
4. **Role Permissions & Personas**: [docs/role-permissions.md](role-permissions.md)
5. **Frontend Design System**: [docs/frontend-design-system.md](frontend-design-system.md)
6. **Frontend Page Specification**: [docs/frontend-page-specification.md](frontend-page-specification.md)
7. **End-to-End Workflows**: [docs/workflows.md](workflows.md)
8. **AI & Document Processing Pipeline**: [docs/ai-and-document-processing.md](ai-and-document-processing.md)
9. **API Contracts & Specifications**: [docs/api-contracts.md](api-contracts.md)
10. **Data Model & Schema**: [docs/data-model.md](data-model.md)
11. **Security, Privacy & Secrets**: [docs/security-and-secrets.md](security-and-secrets.md)
12. **Vercel Deployment Guide**: [docs/vercel-deployment.md](vercel-deployment.md)
13. **Testing Strategy & Acceptance**: [docs/testing-and-acceptance.md](testing-and-acceptance.md)
14. **Implementation Status & Repo Audit**: [docs/implementation-status.md](implementation-status.md)
15. **Architecture Decisions Log (ADRs)**: [docs/decisions-log.md](decisions-log.md)
