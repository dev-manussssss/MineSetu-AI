# MineSetu AI — Project Overview & Strategic Blueprint

> **STATUS**: APPROVED MASTER SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **APPLICATION SCOPE**: Strategic Purpose, Problem Statement & Module Definitions  
> **CANONICAL LOCATION**: `docs/project-overview.md`

---

## 1. Executive Summary & Problem Context

The Indian coal sector—spanning Coal India Limited (CIL), its eight operational subsidiaries, the Central Mine Planning & Design Institute (CMPDI), and administrative bodies under the Ministry of Coal (MoC)—operates at immense geographical and organizational scale. 

Daily mine returns, statutory safety declarations, environmental compliance logs, geological surveys, and production summaries originate across hundreds of open-cast projects (OCP) and underground (UG) collieries.

### 1.1 The Operational Bottleneck
Historically, data collection and synthesis encounter acute operational friction:
1. **Unstructured & Scanned Records**: Critical returns frequently arrive as scanned paper forms, multi-page PDFs, or physical slip notes. These documents require tedious manual transcription.
2. **Disconnected Information Silos**: Disparate reporting formats between subsidiaries (e.g. Eastern Coalfields Limited vs South Eastern Coalfields Limited) hinder rapid cross-subsidiary consolidation.
3. **Manual Compilation Burden**: Senior technical officers and executive directors spend valuable time compiling statutory reviews, parliamentary replies, and quarterly performance briefs by cross-checking spreadsheets manually.
4. **Lack of Transparent Evidence**: Reports frequently summarize aggregated numbers without direct links back to the primary source documents, making variance reconciliation difficult during statutory audits.
5. **Connectivity Constraints**: Colliery offices often face intermittent network connectivity, preventing large file uploads and necessitating reliable, structured manual data entry mechanisms.

---

## 2. Project Goal & Proposed MDMS Relationship

### 2.1 Project Goal
**MineSetu AI** is conceived as an assistive intelligence workspace that connects raw operational documents, field-level data contributions, and executive reporting workflows into a single structured, verifiable pipeline.

The name reflects its mission: *"Mine"* representing coal and mineral operations, and *"Setu"* (the Sanskrit/Hindi word for *Bridge*) signifying the software bridge between physical field records, structured databases, and assistive intelligence.

### 2.2 Proposed MDMS Relationship (Extension Concept, NOT Replacement)
- **Concept Extension Layer**: MineSetu AI is designed as a modular assistive layer that works alongside existing **Mine Data Management System (MDMS)** workflows.
- **Not an Official Portal**: It is a standalone prototype and concept demonstration. It does **not** replace MDMS, nor does it claim live API integration, official government authentication, or government endorsement.
- **Non-Destructive Ingestion**: MineSetu AI treats MDMS core databases as authoritative. Assistive AI extractions must undergo human verification and formal review before any record is considered verified.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   MINESETU AI ASSISTIVE EXTENSION                      │
│                                                                        │
│   ┌─────────────────────┐    ┌──────────────────────────────────────┐  │
│   │ Field Contributions │    │ Assistive Intelligence Engine        │  │
│   │ - Document Upload   ├───>│ - Layout & OCR Extraction            │  │
│   │ - Manual Data Entry │    │ - Semantic Topic Clustering          │  │
│   └─────────────────────┘    │ - Source-Grounded RAG Search         │  │
│                                │ - Multi-Format Report Builder (.docx)│  │
│                                └──────────────────┬───────────────────┘  │
│                                                   │                      │
│   ┌───────────────────────────────────────────────▼───────────────────┐  │
│   │ Human Verification Workbench & Multi-Level Review Queue          │  │
│   └───────────────────────────────────────┬───────────────────────────┘  │
└───────────────────────────────────────────┼────────────────────────────┘
                                            │ Human-Approved Records
                                            ▼
                    ┌───────────────────────────────────────────┐
                    │ MDMS Core Systems / Authoritative Storage │
                    └───────────────────────────────────────────┘
```

---

## 3. Four Target Prototype Personas

To reflect real institutional boundaries in the coal reporting ecosystem without overclaiming official live permissions, the prototype defines four distinct personas:

| Persona | Organization / Tier | Operational Purpose in Prototype | Key Permitted Actions |
|---|---|---|---|
| **Ministry of Coal** | Executive Leadership (MoC) | High-level cross-subsidiary queries, policy review, parliamentary briefing preparation, and national production monitoring. | Create information requests, review draft responses, prepare macro-reports, search permitted records. |
| **CIL Headquarters** | Apex Operational Management (CIL HQ) | Subsidiary-level operational consolidation, target vs actual tracking, production variance comparison, and enterprise review. | Track submissions, compare multi-subsidiary figures, request missing data, prepare consolidated briefs. |
| **CMPDI** | Technical & Exploration Authority | Geological and technical record review, extraction validation, variance analysis, and exploratory topic analysis across mining logs. | Review extracted data, compare technical records, explore word clouds/topics, return records for correction. |
| **Subsidiary / Mine Officer** | Field Level (Colliery / Area Management) | Direct contribution of primary operational data, responding to information requests, and correcting extraction slips. | Upload documents, enter structured data manually, correct OCR fields, submit records for review. |

---

## 4. The Three Core AI Modules

MineSetu AI centers on three core assistive AI modules:

### Module 1: Automated Report Generation
- **Purpose**: Automates the initial drafting of operational, production, and technical reports across selected subsidiaries, mines, and time periods.
- **Key Capabilities**:
  - Deterministic aggregation of validated metrics (coal tonnage, overburden removal, rail despatch rakes, washery yield).
  - Assistive drafting of narrative executive summaries grounded strictly in selected evidence.
  - Multi-format compilation: User can select and export report artifacts simultaneously into **PDF**, **Microsoft Word (.docx)**, and **Microsoft Excel (.xlsx)**.
  - Strict demarcation of report drafts: Every generated document displays draft status, generation date, and comprehensive source citations.

### Module 2: Word Cloud and Topic Identification
- **Purpose**: Provides semantic exploratory intelligence across unstructured remarks, safety inspection logs, environmental filings, and shift notes.
- **Key Capabilities**:
  - Semantic clustering of recurring operational friction (e.g. *monsoon waterlogging, shovel-dumper maintenance, silo breakdown, statutory compliance*).
  - Interactive SVG Word Cloud where word weight and styling reflect term frequency and operational urgency.
  - Drill-down capability: Clicking a term filters accessible documents and presents relevant excerpts without exposing complex machine-learning parameters.
  - Clear epistemic boundary: Topic visualizations are explicitly presented as exploratory aids, not definitive proof of statutory severity.

### Module 3: AI-Based Query and Response (Ask MineSetu)
- **Purpose**: A natural-language inquiry interface grounded strictly in authorized, available documents.
- **Key Capabilities**:
  - Search and synthesis over accessible records for the authenticated user's organization scope.
  - Interactive source citations displaying document title, subsidiary, reporting period, page number, and exact text excerpts.
  - **Anti-Hallucination Guardrail**: When records do not contain the answer, the system replies: *"Insufficient source evidence exists in authorized records to answer this inquiry."*
  - Context retention across report preparation steps (period, scope, sources, comparison basis, output formats).
  - Explicit detection of conflicting figures or stale reporting periods across returns.

---

## 5. Supporting Operational Capabilities

To ensure the AI modules operate on reliable ground truth, MineSetu AI incorporates robust supporting workflows:
- **Dual Ingestion**: Document upload (PDF, DOCX, XLSX, CSV, image scans) and first-class manual structured data entry.
- **Human-in-the-Loop Validation Workbench**: Split-screen interface pairing the original document facsimile with editable extracted fields and confidence scores.
- **Information Request & Review Queue**: Structured requests from Ministry or HQ to subsidiaries, with status tracking (`Draft`, `Awaiting response`, `Submitted`, `Under review`, `Returned for correction`, `Completed`).
- **Activity History & Audit Trail**: Structured event logging capturing actor identity, action type, affected record, and timestamp.

---

## 6. End-to-End User Journey

```text
Step 1: Ingestion
Colliery Officer uploads monthly return PDF or enters shift figures via Manual Data Entry.
        │
        ▼
Step 2: Automated Parsing & Confidence Scoring
System extracts text, tables, and mining entities; flags low-confidence or blurry digits.
        │
        ▼
Step 3: Human Verification Workbench
CMPDI Nodal Officer or Mine Manager reviews extracted fields against the source facsimile;
corrects discrepancies; saves revisions.
        │
        ▼
Step 4: Submission & Review Queue
Verified records are submitted. CIL HQ or Ministry reviewers examine variance against baselines;
accept for downstream reporting or return for field-level correction.
        │
        ▼
Step 5: Assistive Exploration & Synthesis
Officers use "Ask MineSetu" to query trends across verified returns, explore topic clusters in 
inspection logs, or trigger multi-format report drafting (PDF, Word, Excel).
```

---

## 7. Prototype Scope & Limitations

| Dimension | In-Scope for Prototype | Out-of-Scope / Prohibited |
|---|---|---|
| **Data Environment** | Publicly accessible statutory returns, synthetic demo datasets, and structured mock records. | Confidential government records, classified production secrets, unredacted personal identifiers. |
| **Authentication** | Demo role selector with pre-configured mock credentials and session simulation. | Live NIC SSO, MeriPehchan, Aadhaar-based OTP, or production LDAP integration. |
| **MDMS Integration** | Concept simulation of data schema exchange and review handoffs. | Direct SQL connections, live webhooks, or production network socket bindings to MDMS servers. |
| **AI Capabilities** | Grounded retrieval, source extraction, multi-format drafting, and semantic topic clustering. | Autonomous database modification, generative image creation in reporting, unconstrained conversational chat. |

---

## 8. Epistemic Breakdown: Confirmed vs Unverified Facts

### 8.1 Confirmed & Verified Facts
- **VERIFIED FACT**: Coal India Limited is organized into 8 operating subsidiaries (ECL, BCCL, CCL, NCL, WCL, SECL, MCL, CMPDI).
- **VERIFIED FACT**: Open-cast and underground coal reporting standard metrics include raw coal production (tonnes/MT), overburden removal ($m^3$), ash content percentage, washery yield, and rail despatch rakes.
- **VERIFIED FACT**: The current repository contains a working React 19 + TypeScript + Vite frontend with local mock state and zero server-side database connections.
- **VERIFIED FACT**: The repository contains official brand design assets in `assets/design references /`.

### 8.2 Unverified Items (Treated as Concept Proposals)
- **NOT VERIFIED**: The internal database schema, stored procedures, and table structures of the live production MDMS.
- **NOT VERIFIED**: Official Ministry of Coal sign-off matrices for parliamentary Q&A workflows.
- **NOT VERIFIED**: The official network connectivity protocols and firewall policies governing colliery intranets.
- **ASSUMPTION**: That colliery officers require manual data entry when broadband or document scanning infrastructure is unavailable.
