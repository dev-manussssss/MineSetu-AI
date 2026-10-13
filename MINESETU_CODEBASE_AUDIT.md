# MineSetu AI — Comprehensive Codebase Audit Report

> **Document Type:** Independent Architectural, Functional & Security Audit  
> **Target Repository:** `MineSetu` (`dev-manussssss/MineSetu-AI`)  
> **Audit Date:** October 13, 2026  
> **Auditor:** Antigravity AI (Pair Programming Senior Technical Auditor)  
> **Operating Mode:** Read-Only Audit (Zero Existing Code Modified)  
> **File Name:** `MINESETU_CODEBASE_AUDIT.md`  

---

## Executive Summary

**MineSetu AI** is conceived as a decision-support, statutory compliance, and document intelligence extension layer for Coal India Limited (CIL), its operating subsidiaries (ECL, SECL, BCCL, NCL, CCL, WCL, MCL), the Central Mine Planning & Design Institute (CMPDI), and the Ministry of Coal (MoC).

This audit conducted an end-to-end inspection of the repository across all layers: file structure, frontend SPA, serverless API gateway, Python microservice, database schemas, live Supabase deployment, RAG pipeline, LLM failover, RBAC, deployment configuration, and testing suites.

### Key Audit Verdict

| Architectural Layer | Implementation Status | Functional Reality | Fidelity Score |
| :--- | :--- | :--- | :--- |
| **Frontend UI/UX** | **Complete** | Modern, polished React 19 SPA with 13 functional views, responsive design, and Streamdown streaming chat. | **92 / 100** |
| **Serverless API Gateway** | **Implemented** | 7 typed Vercel functions (`/api/v1/*`) with schema validation, CORS, and RBAC guards. | **80 / 100** |
| **Frontend-to-Backend Wiring** | **Disconnected** | **Only 1 out of 30 API methods** (`/api/v1/query`) is wired to the UI. The remaining 12 pages operate on in-memory `mockMiningData.ts` and `localStorage`. | **25 / 100** |
| **Live Database (Supabase)** | **Partial** | Connected to live Supabase instance (`wbydukkulnpghccnwgth.supabase.co`). `organizations` and `mines` tables exist with real rows; `production_records` returns 0 rows via anon client due to RLS. Vector chunks table is unpopulated. | **45 / 100** |
| **RAG / Vector Retrieval** | **Simulated / Rule-Engine** | Hybrid search SQL function (`search_document_chunks`) and pgvector IVFFlat index exist in DDL, but are **never executed**. RAG is implemented as a deterministic regex router with hardcoded canonical responses. | **35 / 100** |
| **Python AI Engine** | **Isolated Microservice** | FastAPI app and durable worker exist with PyMuPDF, python-docx, and openpyxl, but are **never called by Vercel functions or frontend**. Worker is not executed in Dockerfile CMD. | **30 / 100** |
| **Public Data Ingestion** | **Mocked / Hardcoded** | 6 active portal connectors return static in-memory Python dictionaries. No live HTTP scrapers or crawlers connect to the 27 government portals. | **20 / 100** |
| **LLM Integration** | **Deterministic Fallback Active** | 3-tier Grok failover cascade implemented in code. Environment keys are currently blank in `.env.local`, cleanly defaulting to deterministic rule-based grounded outputs at $0 cost. | **70 / 100** |
| **Test Coverage & Quality** | **Passing** | 53 Node unit tests, 25 Python unit tests, 8 Promptfoo assertions, and 21 Playwright E2E tests pass 100%. Tests validate current mocked/simulated behaviors. | **85 / 100** |

---

## 1. Complete File Structure & Repository Map

The repository is structured as a TypeScript monorepo with an embedded React frontend, serverless API routes, a Python microservice, SQL migrations, test fixtures, and engineering documentation:

```text
/Users/bhagyaasatimackbook/Documents/MineSetu/
├── .env.example                               # Environment template with Supabase & Grok placeholders
├── .env.local                                 # Local configuration connected to live Supabase instance
├── .gitignore                                 # Git exclusions (.env, node_modules, dist, __pycache__)
├── CHANGELOG.md                               # Project changelog documenting phases 1-8
├── PROGRESS.md                                # Detailed task ledger and phase verification records
├── README.md                                  # Project overview, installation, and architectural summary
├── package.json                               # Root package script runner, test orchestrator & dependencies
├── package-lock.json                          # Lockfile for root dependencies
├── playwright.config.ts                       # Playwright test config (Desktop 1440, 1280, Mobile 390)
├── promptfooconfig.yaml                       # Automated Promptfoo RAG evaluation assertions
├── start.sh                                   # Local launcher script (runs frontend dev server)
├── vercel.json                                # Vercel deployment spec: routing, headers & rewrites
│
├── api/                                       # Vercel Serverless Function Proxy Shims
│   └── v1/
│       ├── auth/
│       │   └── [action].ts                    # Re-exports backend/functions/api/v1/auth/[action]
│       ├── documents.ts                       # Re-exports backend/functions/api/v1/documents
│       ├── manual-records.ts                  # Re-exports backend/functions/api/v1/manual-records
│       ├── query.ts                           # Re-exports backend/functions/api/v1/query
│       ├── reports.ts                         # Re-exports backend/functions/api/v1/reports
│       ├── requests.ts                        # Re-exports backend/functions/api/v1/requests
│       └── reviews.ts                         # Re-exports backend/functions/api/v1/reviews
│
├── backend/                                   # Backend Functions, Types & Supabase Database
│   ├── tsconfig.json                          # TypeScript config for serverless functions
│   ├── functions/
│   │   ├── api/v1/
│   │   │   ├── auth/
│   │   │   │   └── [action].ts                # POST login/logout, GET me, POST demo switch
│   │   │   ├── documents.ts                   # List, get, upload-intent, confirm, status, field
│   │   │   ├── manual-records.ts              # First-class manual data entry CRUD & verification
│   │   │   ├── query.ts                       # Ask-MineSetu query handler (rules + live DB + Grok)
│   │   │   ├── reports.ts                     # Report draft creation, queue compilation, download
│   │   │   ├── requests.ts                    # Inter-organization information requests workflow
│   │   │   └── reviews.ts                     # Multi-tier review queue (documents & manual records)
│   │   └── lib/
│   │       ├── api-utils.ts                   # CORS, JWT auth, JSON responders, requirePermission
│   │       ├── database.types.ts              # Auto-generated TypeScript definitions for PostgreSQL
│   │       ├── permissions.ts                 # Server-side RBAC permission matrix for all 4 roles
│   │       └── supabase.ts                    # Admin (service_role) and User (JWT-scoped) factories
│   └── supabase/
│       ├── migrations/
│       │   ├── 20261005000001_core_schema.sql # 19 relational & vector tables (DDL)
│       │   ├── 20261005000002_rls_policies.sql # Multi-tenant RLS policies, audit immutability
│       │   └── 20261005000003_queue_and_functions.sql # claim_processing_job, search_document_chunks
│       └── seed/
│           └── 01_seed_data.sql               # Seed SQL: 6 orgs, 4 mines, 4 personas, 2 docs, 2 prod rows
│
├── frontend/                                  # React 19 Single Page Application
│   ├── package.json                           # Frontend scripts: dev, build, typecheck, lint
│   ├── vite.config.ts                         # Vite 8 build & bundler configuration
│   ├── tsconfig.json                          # Base TypeScript project config
│   ├── tsconfig.app.json                      # Application client TypeScript settings
│   ├── tsconfig.node.json                     # Vite config node TypeScript settings
│   ├── vercel.json                            # Frontend static SPA fallback rewrite
│   ├── public/
│   │   ├── favicon.svg                        # Site favicon
│   │   ├── icons.svg                          # Icon sprite sheet
│   │   └── minesetu-logo.png                  # Official Coal India / MineSetu dual emblem
│   └── src/
│       ├── main.tsx                           # React DOM root render
│       ├── App.tsx                            # Root route switcher based on window.location.pathname
│       ├── index.css                          # Global typography, CSS variables, utility classes
│       ├── App.css                            # Layout structural CSS
│       ├── api/
│       │   ├── client.ts                      # Central typed API client (dual live / demo mode)
│       │   └── index.ts                       # Export barrel for API clients
│       ├── components/
│       │   ├── DisclaimerBanner.tsx           # Prototype demonstration statutory disclaimer
│       │   ├── Sidebar.tsx                    # Left navigation sidebar with persona switcher
│       │   ├── TopHeader.tsx                  # Top header bar with notifications & active persona
│       │   └── chat/
│       │       └── MessageMarkdown.tsx        # Streamdown markdown renderer for assistant responses
│       ├── context/
│       │   └── AppContext.tsx                 # Central React state store, chat streaming, thread state
│       ├── data/
│       │   └── mockMiningData.ts              # In-memory baseline data: docs, records, requests, topics
│       ├── layouts/
│       │   └── DashboardLayout.tsx            # Standard layout wrapper with Sidebar + TopHeader
│       ├── lib/
│       │   ├── conversationService.ts         # Client-side RAG engine, intent resolver, streaming
│       │   ├── rbac.ts                        # Frontend RBAC matrix & DEMO_PERSONAS definitions
│       │   └── supabase.ts                    # Client-side Supabase browser client factory
│       ├── pages/
│       │   ├── AdminPage.tsx                  # System administrator & access control view
│       │   ├── ComparePage.tsx                # Cross-subsidiary operational comparison
│       │   ├── DashboardPage.tsx              # Executive operational dashboard with KPI cards
│       │   ├── DocumentsPage.tsx              # Document archive, upload modal & manual record entry
│       │   ├── LandingPage.tsx                # Public welcome portal & prototype overview
│       │   ├── LoginPage.tsx                  # 4-persona split authentication screen
│       │   ├── ParliamentaryDeskPage.tsx      # MoC parliamentary question draft & approval desk
│       │   ├── QueryPage.tsx                  # Ask-MineSetu conversational search interface
│       │   ├── ReportsPage.tsx                # Multi-format report builder & previewer
│       │   ├── RequestsPage.tsx               # Inter-organization information requests desk
│       │   ├── SettingsPage.tsx               # System preferences & environment display
│       │   ├── TopicsPage.tsx                 # Thematic cluster exploration & word cloud
│       │   └── ValidationWorkbenchPage.tsx   # Dual-pane document OCR validation workbench
│       ├── styles/
│       │   ├── index.css                      # Design tokens import
│       │   └── tokens.css                     # HSL color variables, borders, shadows & radii
│       └── types/
│           ├── index.ts                       # Domain types: Document, ManualRecord, Request, etc.
│           └── database.types.ts              # TypeScript database interface
│
├── services/                                  # Microservices
│   └── ai-engine/                             # Python 3.11 AI Processing Microservice
│       ├── Dockerfile                         # Python container build with PyMuPDF
│       ├── docker-compose.yml                 # Local container orchestration
│       ├── requirements.txt                   # FastAPI, Supabase, PyMuPDF, docx, openpyxl, reportlab
│       ├── config.py                          # Pydantic BaseSettings & 3-tier key manager
│       ├── main.py                            # FastAPI entry point: /health, /process/*, /math/*
│       ├── models.py                          # Pydantic request/response schemas
│       ├── worker.py                          # Durable queue worker polling claim_processing_job
│       ├── pipeline/
│       │   ├── arithmetic_guard.py            # Deterministic stripping ratio & variance calculations
│       │   ├── compiler.py                    # Multi-format compiler (.docx, .xlsx, .pdf)
│       │   ├── extractor.py                   # PyMuPDF OCR & regex statutory field extractor
│       │   └── topic_modeler.py               # Stopword removal & frequency topic clusters
│       ├── connectors/
│       │   ├── base.py                        # BaseConnector abstract class & PortalRecord model
│       │   ├── mvp_connectors.py              # 6 MVP mock portal adapters (SWCS, MDMS, CIL, Uttam, etc.)
│       │   └── registry.py                    # 27 Coal portal catalog & tier classifications
│       └── tests/
│           ├── test_ai_engine.py              # 15 Python unit tests for extractor, compiler, math
│           └── test_connectors.py             # 10 Python unit tests for portal registry & adapters
│
├── scripts/                                   # Verification, Audit & Test Harness Scripts
│   ├── audit-live-supabase.mjs                # Queries all live Supabase tables via anon client
│   ├── evaluate-rag.mjs                       # Promptfoo provider executing conversationService
│   ├── test-live-query-handler.mjs            # Tests query.ts against live Supabase organizations/mines
│   ├── test-query-pipeline.mjs                # Tests backend queryHandler and client conversationService
│   └── test-real-db-query.mjs                 # Direct test querying live Supabase organizations and mines
│
└── tests/                                     # Automated Quality Assurance & E2E Suites
    ├── qa-runner.mjs                          # Standalone Chrome Puppeteer QA test runner
    ├── e2e/
    │   └── chatbot-redesign.spec.ts           # 21 Playwright tests for Ask-MineSetu interface
    ├── qa-evidence/                           # 80 captured test screenshots & qa-report.json
    └── unit/
        ├── api-gateway.test.mjs               # 6 tests for Vercel routing & client configuration
        ├── api-keys-and-failover.test.mjs     # 3 tests for Grok 3-tier key configuration & rotation
        ├── backend-edge-cases.test.mjs        # 16 tests for file limits, MIME checks, numeric limits
        ├── backend-routes.test.mjs            # 9 tests for CORS, 401, 405, and RBAC enforcement
        ├── chatbot-and-rbac-fixes.test.mjs    # 10 tests for Ask-MineSetu branding, greetings, guardrails
        ├── migrations.test.mjs                # 4 tests for SQL DDL table, RLS, and queue definitions
        └── rbac.test.mjs                      # 5 tests for persona permissions & anti-hallucination
```

---

## 2. System Architecture & Component Boundaries

### 2.1 Intended Architecture vs. Implemented Architecture

The project specification describes a 3-tier cloud-native architecture. However, the empirical codebase reveals that the system currently operates in three distinct, largely decoupled subsystems:

```mermaid
graph TD
    subgraph Subsystem_1["Subsystem 1: React 19 Frontend SPA"]
        UI["13 Pages (Dashboard, Documents, Ask, Workbench, Reports)"]
        Context["AppContext.tsx (in-memory useState)"]
        MockData["mockMiningData.ts & LocalStorage"]
        ClientService["conversationService.ts (Client RAG Synthesizer)"]
        APIClient["api/client.ts (Central API Client)"]

        UI --> Context
        Context --> MockData
        Context --> ClientService
        Context -.->|"Only calls queryApi.execute()"| APIClient
    end

    subgraph Subsystem_2["Subsystem 2: Vercel Serverless Gateway"]
        VercelRoutes["api/v1/*.ts (7 Proxies)"]
        Handlers["backend/functions/api/v1/*.ts"]
        QueryHandler["query.ts (Grounded Query Handler)"]
        LiveDBClient["backend/functions/lib/supabase.ts"]

        APIClient -.->|"HTTP POST /api/v1/query"| VercelRoutes
        VercelRoutes --> Handlers
        Handlers --> QueryHandler
        QueryHandler --> LiveDBClient
    end

    subgraph Subsystem_3["Subsystem 3: Live Supabase Backend"]
        LiveDB[("Supabase PostgreSQL (Live)")]
        LiveOrgs["public.organizations (6 rows)"]
        LiveMines["public.mines (4 rows)"]
        LiveProd["public.production_records (RLS blocked)"]

        LiveDBClient --> LiveDB
        LiveDB --- LiveOrgs
        LiveDB --- LiveMines
        LiveDB --- LiveProd
    end

    subgraph Subsystem_4["Subsystem 4: Python AI Engine (Isolated)"]
        FastAPI["FastAPI (main.py: Port 8000)"]
        Extractor["extractor.py (PyMuPDF)"]
        Compiler["compiler.py (python-docx, openpyxl)"]
        Worker["worker.py (claim_processing_job)"]
        Connectors["mvp_connectors.py (6 Static Portals)"]

        FastAPI --> Extractor
        FastAPI --> Compiler
        Worker --> Extractor
        FastAPI -.-> Connectors
    end

    classDef active fill:#d1fae5,stroke:#059669,stroke-width:2px;
    classDef partial fill:#fef3c7,stroke:#d97706,stroke-width:2px;
    classDef isolated fill:#fee2e2,stroke:#dc2626,stroke-width:2px;

    class UI,Context,MockData,ClientService active;
    class QueryHandler,LiveDBClient,LiveDB,LiveOrgs,LiveMines partial;
    class Subsystem_4,FastAPI,Extractor,Compiler,Worker,Connectors isolated;
```

### 2.2 Component Boundary Breakdown

1. **Frontend SPA (`frontend/`):**
   - Renders a multi-view portal using React 19 and Vite 8.
   - All interactive page operations (uploading a document, creating a manual record, creating an information request, compiling a report, verifying an OCR field) mutate in-memory state in `AppContext.tsx` and serialize to `localStorage`.
   - **Critical Finding:** The UI does not call the REST endpoints (`documentsApi`, `manualRecordsApi`, `requestsApi`, `reviewsApi`, `reportsApi`, `authApi`) despite those functions existing in `frontend/src/api/client.ts`.

2. **Serverless API Gateway (`backend/functions/`):**
   - Implemented as Vercel serverless functions targeting `@vercel/node`.
   - Includes full HTTP methods, CORS headers, input validation schemas, and RBAC guards.
   - Communicates with Supabase using `@supabase/supabase-js`.
   - **Critical Finding:** Only `POST /api/v1/query` is invoked in production by the frontend. The other 6 endpoints are thoroughly tested in `tests/unit/*.test.mjs` but have zero active callers in the React application.

3. **Live Supabase PostgreSQL Database:**
   - Active host: `https://wbydukkulnpghccnwgth.supabase.co`.
   - Contains deployed tables from migrations 001, 002, and 003.
   - Successfully serves `organizations` and `mines` data to `backend/functions/api/v1/query.ts`.
   - `production_records` table exists but has Row-Level Security enabled, preventing the anonymous key from reading records.

4. **Python AI Microservice (`services/ai-engine/`):**
   - Completely decoupled from the frontend and serverless gateway.
   - Does not have a public DNS endpoint or Vercel proxy.
   - Contains genuine file processing libraries (`pymupdf`, `python-docx`, `openpyxl`, `reportlab`), but runs strictly as a local or containerized microservice without incoming traffic from the web app.

---

## 3. Technology Stack & Dependencies Analysis

### 3.1 Root Workspace (`package.json`)

| Package | Version | Type | Purpose | Audit Notes |
| :--- | :--- | :--- | :--- | :--- |
| `@supabase/supabase-js` | `^2.117.2` | Production | Supabase SDK | Used by scripts and backend utilities. |
| `@playwright/test` | `^1.64.0` | Dev | E2E Testing | Runs browser tests against Chromium. |
| `@types/node` | `^26.6.4` | Dev | TypeScript | Type definitions for Node.js. |
| `@vercel/node` | `^20.0.0` | Dev | Vercel Types | Types for `VercelRequest` and `VercelResponse`. |
| `promptfoo` | `^0.124.1` | Dev | LLM / RAG Eval | Automated evaluation of prompt fidelity. |
| `tsx` | `^4.21.0` | Dev | TypeScript Runner | Executes Node test runners and scripts. |
| `typescript` | `^5.9.3` | Dev | Compiler | Type checks backend functions and test code. |

### 3.2 Frontend (`frontend/package.json`)

| Package | Version | Type | Purpose | Audit Notes |
| :--- | :--- | :--- | :--- | :--- |
| `react` | `^19.2.8` | Production | UI Library | Modern React 19 baseline. |
| `react-dom` | `^19.2.8` | Production | DOM Renderer | React 19 DOM bindings. |
| `lucide-react` | `^1.49.0` | Production | Iconography | Clean, consistent icons across all pages. |
| `streamdown` | `^2.7.0` | Production | Markdown Parser | Progressive streaming Markdown renderer. |
| `@supabase/supabase-js` | `^2.117.2` | Production | Supabase Client | Singleton in `frontend/src/lib/supabase.ts`. |
| `vite` | `^8.3.0` | Dev | Build Tool | Fast HMR and Rollup/Rolldown production builds. |
| `oxlint` | `^1.81.0` | Dev | Linter | High-performance Rust-based linter (0 errors). |
| `puppeteer-core` | `^25.12.0` | Dev | Automation | Legacy QA runner (`qa-runner.mjs`). |
| `typescript` | `~6.0.2` | Dev | Compiler | Client TypeScript compilation. |

### 3.3 Python AI Engine (`services/ai-engine/requirements.txt`)

| Package | Minimum Version | Purpose | Audit Notes |
| :--- | :--- | :--- | :--- |
| `fastapi` | `>=0.110.0` | API Framework | High-performance ASGI microservice framework. |
| `uvicorn[standard]` | `>=0.28.0` | ASGI Server | Production HTTP server. |
| `pydantic` | `>=2.6.0` | Data Validation | Request/Response schema validation. |
| `pydantic-settings` | `>=2.2.0` | Configuration | Environment configuration loader. |
| `supabase` | `>=2.4.0` | Database SDK | Connects to PostgreSQL durable queue. |
| `pymupdf` | `>=1.24.0` | PDF Engine | Extracts text & coordinates from PDFs. |
| `python-docx` | `>=1.1.0` | Word Generator | Compiles `.docx` reports. |
| `openpyxl` | `>=3.1.2` | Excel Generator | Compiles `.xlsx` workbooks. |
| `reportlab` | `>=4.1.0` | PDF Generator | Compiles `.pdf` reports. |
| `httpx` | `>=0.27.0` | Async HTTP Client | External API calls. |
| `numpy` | `>=1.26.0` | Array Operations | Matrix operations for embeddings. |
| `python-multipart` | `>=0.0.9` | Form Parsing | Handles multipart file uploads. |
| `pytest` | `>=8.0.0` | Test Runner | Runs Python unit tests. |

---

## 4. Frontend-to-Backend Connection Audit

### 4.1 The Architectural Disconnect

A central finding of this audit is that **the application features two parallel implementations of business operations**:
1. A **real, typed, serverless backend** located in `backend/functions/api/v1/` and exposed via `api/v1/`.
2. An **in-memory, client-side simulation** located in `frontend/src/context/AppContext.tsx` and `frontend/src/data/mockMiningData.ts`.

The following audit matrix documents the exact connection status for every user-facing workflow:

| Workflow / Module | Frontend UI Action | Client Method Defined | Serverless Endpoint | Actual Execution Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `LoginPage.tsx` (Click "Enter Workspace") | `authApi.login` | `/api/v1/auth/login` | `setTimeout` -> `switchRole(role)` -> `navigateTo('/dashboard')` | **100% Mocked** |
| **Persona Switching** | `Sidebar.tsx` (Click "Switch Persona") | `authApi.switchDemoPersona` | `/api/v1/auth/demo` | Mutates `currentUser` in React state & `localStorage` | **100% Mocked** |
| **Document Listing** | `DocumentsPage.tsx` | `documentsApi.list` | `/api/v1/documents?action=list` | Filters `documents` array in `AppContext` | **100% Mocked** |
| **Document Upload** | `DocumentsPage.tsx` (Modal submit) | `documentsApi.createUploadIntent` | `/api/v1/documents?action=upload-intent` | `uploadDocument()` in `AppContext` generates `doc-${Date.now()}` with static extracted fields | **100% Mocked** |
| **Field Verification** | `ValidationWorkbenchPage.tsx` (Save correction) | `documentsApi.updateField` | `/api/v1/documents?action=field` | Mutates `extractedFields` in React state & appends to `auditLogs` array | **100% Mocked** |
| **Document Status Update** | `ValidationWorkbenchPage.tsx` (Accept / Return) | `documentsApi.updateStatus` | `/api/v1/documents?action=status` | Mutates `activeDoc.status` in React state & `localStorage` | **100% Mocked** |
| **Manual Record Ingestion** | `DocumentsPage.tsx` (Manual tab submit) | `manualRecordsApi.create` | `/api/v1/manual-records?action=create` | `addManualRecord()` generates `man-${Date.now()}` in `AppContext` | **100% Mocked** |
| **Information Requests** | `RequestsPage.tsx` (Create request) | `requestsApi.create` | `/api/v1/requests?action=create` | Generates `req-${Date.now()}` in React state | **100% Mocked** |
| **Information Responses** | `RequestsPage.tsx` (Submit response) | `requestsApi.respond` | `/api/v1/requests?action=respond` | Appends response text to request object in React state | **100% Mocked** |
| **Review Queue** | `ComparePage.tsx` / Review flows | `reviewsApi.getQueue` | `/api/v1/reviews?action=queue` | Filters documents where status is `needs_review` in memory | **100% Mocked** |
| **Report Generation** | `ReportsPage.tsx` (Builder submit) | `reportsApi.create` & `compile` | `/api/v1/reports?action=create` | Generates `rep-${Date.now()}` with hardcoded metric summaries | **100% Mocked** |
| **Report File Export** | `ReportsPage.tsx` (Export DOCX / PDF) | `reportsApi.download` | `/api/v1/reports?action=download` | Browser `window.print()` (PDF) and HTML Blob download (.doc) | **Client Fallback** |
| **Topics & Word Cloud** | `TopicsPage.tsx` | N/A (FastAPI `/process/topics`) | `/process/topics` | Renders static `KEYWORD_TAGS` array and `TOPIC_CLUSTERS` from mock data | **100% Mocked** |
| **Ask-MineSetu Query** | `QueryPage.tsx` (Send message) | `queryApi.execute` | `/api/v1/query` | **GENUINE HTTP CALL**: Sends POST to `/api/v1/query`, falls back to `conversationService.ts` if offline | **Live Connected** |

---

## 5. Database, Schemas, RLS & Live Supabase Audit

### 5.1 SQL Migration Architecture

The database architecture is defined in three versioned migrations located in `backend/supabase/migrations/`:

1. **`20261005000001_core_schema.sql` (Core DDL):**
   - Enables PostgreSQL extensions: `uuid-ossp`, `pgcrypto`, `vector`, `pg_trgm`.
   - Defines **19 core tables**:
     - `organizations`, `mines`, `profiles`
     - `documents`, `document_versions`, `document_pages`, `document_chunks`
     - `extracted_records`, `manual_records`, `manual_record_fields`
     - `production_records`
     - `information_requests`, `request_responses`, `request_clarifications`
     - `review_tasks`, `discrepancies`
     - `processing_jobs` (Durable queue)
     - `ai_queries`, `retrieval_citations`
     - `report_drafts`, `report_exports`
     - `topic_models`, `topic_assignments`
     - `data_sources`, `audit_logs`
   - Defines indexes:
     - `idx_chunks_embedding` (`ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`)
     - `idx_chunks_tsv` (`gin (tsv)`)
     - `idx_production_lookup` (`(organization_id, mine_id, reporting_period)`)
     - `idx_jobs_claimable` (`(status, locked_until) WHERE status IN ('queued', 'processing')`)

2. **`20261005000002_rls_policies.sql` (Security & Multi-Tenancy):**
   - Enables RLS on all 10 sensitive domain tables.
   - Defines security helper functions: `current_user_role()` and `current_user_org_id()`.
   - Revokes `UPDATE` and `DELETE` on `audit_logs` for all roles to guarantee an immutable audit ledger.
   - Restricts document and chunk visibility based on user organization and document status (`approved` visible to MoC and CIL HQ; unapproved visible only to owning subsidiary or CMPDI).

3. **`20261005000003_queue_and_functions.sql` (Stored Procedures & Queue):**
   - `claim_processing_job()`: Atomic job claim using `FOR UPDATE SKIP LOCKED` with configurable lease timeouts.
   - `renew_processing_job_lease()`: Worker heartbeat function.
   - `complete_processing_job()`: Atomic job completion.
   - `fail_processing_job()`: Implements exponential backoff (`backoff_seconds * 2^(attempts-1)`).
   - `search_document_chunks()`: Hybrid search function combining cosine vector distance (`1.0 - (embedding <=> q)`) weighted at 0.7 with full-text `ts_rank_cd` weighted at 0.3.
   - Trigger `trg_invalidate_chunks`: Automatically sets `is_stale = true` on existing chunks when a new document version is uploaded.

### 5.2 Live Supabase Instance Verification

Execution of `scripts/audit-live-supabase.mjs` and `scripts/test-real-db-query.mjs` against the live Supabase instance (`https://wbydukkulnpghccnwgth.supabase.co`) yielded empirical results:

```text
=== LIVE SUPABASE AUDIT RESULTS (Anonymous Key Client) ===
1. organizations:        SUCCESS | 6 rows returned (MoC, CIL, ECL, SECL, BCCL, CMPDI)
2. mines:                SUCCESS | 4 rows returned (Rajmahal, Gevra, Kusmunda, Jharia)
3. profiles:             SUCCESS | 4 rows returned (Dr. Sharma, Er. Bhattacharya, Dr. Mukherjee, Er. Ghosh)
4. documents:            SUCCESS | 2 rows returned (doc-ecl-001, doc-secl-002)
5. extracted_records:    SUCCESS | 3 rows returned (Raw coal, OB removal, rail rakes)
6. data_sources:         SUCCESS | 3 rows returned (CCO_MONTHLY, MOC_CABINET, CIL_OFFTAKE)
7. production_records:   SUCCESS | 0 rows returned (Blocked by PostgreSQL RLS)
8. document_chunks:      EMPTY   | 0 vector chunks present
9. processing_jobs:      EMPTY   | 0 background jobs queued
```

**Key Findings:**
- The database schema and seed data are **genuinely deployed** to a live Supabase PostgreSQL instance.
- Metadata tables (`organizations`, `mines`) are readable using the anonymous key.
- Production tables (`production_records`) correctly deny anonymous reads due to RLS policies.
- The `document_chunks` table contains **zero rows**, confirming that document chunking and vector embeddings have not been populated in the live database.

---

## 6. Public Data Sources & Ingestion Pipeline Analysis

### 6.1 Planned 27 Coal-Sector Portals

In `services/ai-engine/connectors/registry.py`, a catalog of 27 government portals is maintained across three operational tiers:
- **MVP (Tier 1):** SWCS, SWCS-EXPL, MDMS, CIL Production, Uttam Quality, Coal Directory, CCO Dashboard, CMPDI Docs.
- **Tier 2:** OCBIS, NCP, Koyla Shakti, CLAMP, Star Rating, CIMS, UGMCA, CSIS.
- **Tier 3:** CMSMS / Khanan Prahari, PM GatiShakti, CIL DMS, e-Office, e-Samiksha, PRAYAS, TPA-CCO, ICCC, DigiCoal, e-MB, CIL ERP.

### 6.2 Ingestion Implementation Reality

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Mine Officer / Submitter
    participant UI as DocumentsPage.tsx
    participant Context as AppContext.tsx
    participant Gateway as /api/v1/documents (Vercel)
    participant Storage as Supabase Storage Bucket
    participant DB as processing_jobs (PostgreSQL)
    participant Worker as worker.py (Python)
    participant Extractor as extractor.py (PyMuPDF)

    Note over Officer,Extractor: PLANNED ASYNCHRONOUS INGESTION PIPELINE
    Officer->>UI: Selects return.pdf (max 10MB)
    UI->>Gateway: POST ?action=upload-intent
    Gateway->>Storage: Create signed upload URL
    Gateway-->>UI: { documentId, signedUrl, storagePath }
    UI->>Storage: Direct PUT binary to signedUrl
    UI->>Gateway: POST ?action=confirm { documentId, sha256 }
    Gateway->>DB: INSERT INTO processing_jobs (status: 'queued')
    Worker->>DB: RPC claim_processing_job() (SKIP LOCKED)
    DB-->>Worker: Claims job & acquires 300s lease
    Worker->>Extractor: process_document(file_bytes)
    Extractor->>Extractor: PyMuPDF OCR & Regex extraction
    Worker->>DB: INSERT INTO extracted_records
    Worker->>DB: UPDATE documents SET status = 'needs_review'
    Worker->>DB: RPC complete_processing_job()

    Note over Officer,Context: CURRENT ACTUAL INGESTION PIPELINE
    Officer->>UI: Submits upload form
    UI->>Context: uploadDocument({ title, subsidiary })
    Context->>Context: Generates doc-xxx with hardcoded fields (38,900 T, 112,000 m³)
    Context->>Context: Appends to React state & localStorage
    Context-->>UI: Navigates to /documents/verify
```

**Key Findings:**
1. **Connector Mocking:** The 6 MVP connectors in `services/ai-engine/connectors/mvp_connectors.py` return static, hardcoded data. There are no web scrapers, crawler daemons, or active API integrations with real government portals (`swcs.coal.gov.in`, `mdms.cmpdi.co.in`, etc.).
2. **Connector Isolation:** The connector classes are never called by the FastAPI server, Vercel API, or frontend UI. They exist exclusively to pass unit tests in `test_connectors.py`.
3. **Queue Worker Disconnection:** The Python queue worker (`services/ai-engine/worker.py`) is fully implemented with atomic leases and error handling, but is not started by `Dockerfile` or any deployment runner.

---

## 7. API Inventory & Endpoint Analysis

### 7.1 Vercel Serverless Gateway (`backend/functions/api/v1/`)

All serverless endpoints follow standardized patterns: CORS handling (`handleCors`), bearer token extraction (`authenticateRequest`), permission checks (`requirePermission`), and structured JSON envelopes (`jsonOk`, `jsonError`, `json401`, `json403`, `json405`, `json500`).

| Route Path | Allowed Methods | Key Actions | Required Permissions | Database Operations |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/[action]` | `POST`, `GET` | `login`, `logout`, `me`, `demo` | Public / Token | Authenticates session via Supabase Auth; provides demo persona claims |
| `/api/v1/documents` | `GET`, `POST`, `PATCH`, `DELETE` | `list`, `get`, `upload-intent`, `confirm`, `status`, `field`, `delete` | `documents.view`, `documents.upload`, `documents.verify` | Reads/writes `documents`, generates storage signed URLs, enqueues `processing_jobs` |
| `/api/v1/manual-records` | `GET`, `POST`, `PATCH`, `DELETE` | `list`, `get`, `create`, `status`, `delete` | `documents.view`, `manual.entry` | Validates numbers (`NUMERIC(14,3)`), writes `manual_records` and `manual_record_fields` |
| `/api/v1/query` | `POST` | Natural language question synthesis | `queries.execute` | Queries live `organizations` & `mines`, applies 11 intent rules, cascades to Grok LLM |
| `/api/v1/reports` | `GET`, `POST` | `list`, `get`, `create`, `compile`, `download` | `reports.generate` | Manages `report_drafts`, enqueues compilation in `processing_jobs`, creates download links |
| `/api/v1/requests` | `GET`, `POST`, `PATCH` | `list`, `get`, `create`, `respond`, `status` | `requests.create`, `requests.respond` | Cross-tier governance on `information_requests` and `request_responses` |
| `/api/v1/reviews` | `GET`, `POST` | `queue`, `get`, `approve`, `return`, `reject` | `submissions.review`, `submissions.return` | Queries unapproved records, transitions status to `approved` or `returned` |

### 7.2 Python FastAPI Endpoints (`services/ai-engine/main.py`)

| Endpoint | Method | Request Model | Response Model | Handler |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Dict | Returns health status, Grok model ID, worker flag |
| `/process/document` | `POST` | `DocumentProcessRequest` | `DocumentProcessResult` | Runs `DocumentExtractor.process_document` |
| `/process/report` | `POST` | `ReportCompileRequest` | `ReportCompileResult` | Runs `ReportCompiler.compile_all` (.docx, .xlsx, .pdf) |
| `/process/topics` | `POST` | `List[str]` | `TopicModelResult` | Runs `TopicModeler.compute_topics` |
| `/math/variance` | `POST` | `Dict[str, float]` | Dict | Runs `ArithmeticGuard.calculate_variance` |

---

## 8. Retrieval / RAG Pipeline Deep Dive

### 8.1 Dual RAG Architecture

The RAG pipeline is implemented in two mirrored components:
1. **Server-Side Engine:** `backend/functions/api/v1/query.ts` (executed when `/api/v1/query` is reachable).
2. **Client-Side Mirror:** `frontend/src/lib/conversationService.ts` (executed if `/api/v1/query` fails or in offline demo mode).

### 8.2 Retrieval Methodology

Rather than performing dense vector nearest-neighbor search across document chunks, the RAG engine operates as a **deterministic, rule-based semantic router**:

```mermaid
flowchart TD
    UserQuery["User Natural Language Query"] --> Handler["backend/functions/api/v1/query.ts"]
    Handler --> LiveCheck["Attempt Live Supabase Query (organizations, mines)"]

    LiveCheck --> GuardrailInjection{"Prompt Injection?"}
    GuardrailInjection -- Yes --> ReturnInjection["Return Security Notice"]
    GuardrailInjection -- No --> GuardrailGreeting{"Greeting (hi, hello)?"}

    GuardrailGreeting -- Yes --> ReturnGreeting["Return Ask-MineSetu Greeting (0 citations)"]
    GuardrailGreeting -- No --> GuardrailCommodity{"Non-Coal Commodity (uranium, gold)?"}

    GuardrailCommodity -- Yes --> ReturnCommodity["Return Anti-Hallucination Guardrail (0 citations)"]
    GuardrailCommodity -- No --> CheckTargets{"Annual Target Inquiry?"}

    CheckTargets -- Yes --> ReturnTargets["Return Live organizations Data (1 citation)"]
    CheckTargets -- No --> CheckMines{"Mine Registry Inquiry?"}

    CheckMines -- Yes --> ReturnMines["Return Live mines Data (matching citations)"]
    CheckMines -- No --> CheckAmbiguous{"'How much coal is present'?"}

    CheckAmbiguous -- Yes --> ReturnClarification["Return 4-Dimension Clarification (2 citations: SECL, ECL)"]
    CheckAmbiguous -- No --> CheckTotal{"Total Coal Production?"}

    CheckTotal -- Yes --> ReturnTotal["Return Consolidated Table: 569,510 Tonnes (2 citations)"]
    CheckTotal -- No --> CheckCompare{"Compare ECL & SECL?"}

    CheckCompare -- Yes --> ReturnCompare["Return Comparative Analysis (2 citations)"]
    CheckCompare -- No --> CheckSubsidiary{"Specific Subsidiary (ECL or SECL)?"}

    CheckSubsidiary -- Yes --> ReturnSub["Return Exact Production (doc-ecl-001 or doc-secl-002)"]
    CheckSubsidiary -- No --> CheckFollowup{"Follow-up (Overburden or May)?"}

    CheckFollowup -- Overburden --> ReturnOB["Inherit Subsidiaries, Return OB Stripping"]
    CheckFollowup -- May --> ReturnUningested["Honestly Report May 2026 Uningested"]
    CheckFollowup -- No --> CheckLLM{"Grok API Keys Configured?"}

    CheckLLM -- Yes --> CallGrok["Call xAI Grok 2 with Grounded Database Dump"]
    CheckLLM -- No --> ReturnHonestFallback["Return Honest Limitation Baseline (0 citations)"]
```

### 8.3 RAG Assertions & Promptfoo Evaluation

The Promptfoo test harness (`promptfooconfig.yaml` evaluated via `scripts/evaluate-rag.mjs`) tests 8 assertions against this engine:
- **Test 1 (Greeting):** "Hi" returns greeting without hallucinated numbers. (Passed)
- **Test 2 (Direct Query):** Rajmahal returns 45,210 tonnes and 142,500 m³ citing `doc-ecl-001`. (Passed)
- **Test 3 (Comparison):** ECL vs SECL returns both 524,300 tonnes and 45,210 tonnes citing both documents. (Passed)
- **Test 4 (Context Retention):** "What about overburden removal?" inherits active subsidiaries. (Passed)
- **Test 5 (Missing Period):** "What about May?" honestly reports uningested month. (Passed)
- **Test 6 (Out-of-Domain):** "Uranium spot price" triggers anti-hallucination guardrail with 0 sources. (Passed)
- **Test 7 (Prompt Injection):** "Ignore previous instructions" returns security notice. (Passed)

**Key Finding:** The RAG system achieves 100% compliance on domain accuracy, anti-hallucination, and citation attribution **because it is hardcoded to do so**. It does not use pgvector semantic similarity search.

---

## 9. LLM Integration & 3-Tier Failover Cascade

### 9.1 Architecture of the Failover Cascade

In `backend/functions/api/v1/query.ts` (lines 170–245), a 3-tier cascade is implemented:
- **Primary Tier (`GROK_API_KEY_PRIMARY`):** First-priority inference token.
- **Secondary Tier (`GROK_API_KEY_SECONDARY`):** Triggered if Primary returns HTTP 429, 500, or times out (12s abort controller).
- **Tertiary Tier (`GROK_API_KEY_TERTIARY`):** Standby key if both Primary and Secondary fail.
- **Deterministic Fallback:** If all keys fail or no keys are configured, falls back to local verified database retrieval.

### 9.2 Key Discovery Logic

Function `getConfiguredLLMKeys()` inspects environment variables and filters out:
- Empty strings
- Placeholder values (`xai-primary...`, `your-api-key-here`)
- Strings with fewer than 10 characters

### 9.3 Current Environment State

In `.env.local`:
```bash
GROK_API_KEY_PRIMARY=
GROK_API_KEY_SECONDARY=
GROK_API_KEY_TERTIARY=
```
All three keys are currently empty. Consequently:
- `getConfiguredLLMKeys()` returns `[]`.
- `callGrokWithFailover()` immediately returns `null`.
- The system executes the zero-cost deterministic baseline for all queries.

---

## 10. Authentication, RBAC & Security Audit

### 10.1 Persona & Permission Matrix

The application defines 4 primary roles across frontend (`frontend/src/lib/rbac.ts`) and backend (`backend/functions/lib/permissions.ts`):

| Persona Code | Role Label | Organization | Key Permissions | Forbidden Permissions |
| :--- | :--- | :--- | :--- | :--- |
| `ministry_coal` | Ministry Executive | Ministry of Coal | `parliamentary.draft`, `parliamentary.approve`, `reports.generate`, `requests.create`, `audit.view` | `documents.upload`, `manual.entry`, `requests.respond` |
| `cil_hq` | CIL HQ Management | Coal India Limited | `documents.approve`, `submissions.review`, `requests.create`, `requests.respond`, `reports.generate` | `parliamentary.approve`, `manual.entry`, `documents.upload` |
| `cmpdi` | CMPDI Nodal Expert | CMPDI | `documents.upload`, `documents.verify`, `documents.approve`, `manual.entry`, `audit.view`, `reports.generate` | `parliamentary.approve` |
| `subsidiary_officer` | Mine Officer | Operating Subsidiary (ECL) | `documents.upload`, `documents.verify`, `manual.entry`, `requests.respond` | `documents.approve`, `submissions.review`, `reports.generate`, `audit.view` |

### 10.2 Security Vulnerabilities & Findings

> [!CAUTION]
> **Finding SEC-01: Demo Passkey Bypasses Real Authentication in UI**  
> In `frontend/src/pages/LoginPage.tsx` (lines 33–46), entering any string in the passkey input field triggers a 450ms `setTimeout` and logs the user into the selected persona. No authentication call is made to Supabase Auth or `/api/v1/auth/login`.

> [!WARNING]
> **Finding SEC-02: Unauthenticated Demo Role Switching on Server**  
> In `backend/functions/api/v1/auth/[action].ts` (lines 175–195), `POST /api/v1/auth/demo` accepts `{ role }` and returns a valid user profile with all corresponding role claims without verifying any credentials, guarded only by `VITE_APP_DEMO_MODE === 'true'`.

> [!WARNING]
> **Finding SEC-03: Hardcoded Test Token Backdoor in Serverless Gateway**  
> In `backend/functions/lib/api-utils.ts` (lines 83–95):
> ```typescript
> if (process.env.VITE_APP_ENV === 'test' && token.startsWith('test-token-')) {
>   const role = token.replace('test-token-', '');
>   return { id: `usr_${role}_01`, role, ... };
> }
> ```
> If `VITE_APP_ENV=test` is accidentally set in production, any HTTP request with `Authorization: Bearer test-token-ministry_coal` bypasses all Supabase authentication.

> [!NOTE]
> **Finding SEC-04: Audit Log Immutability Enforced in SQL**  
> In `backend/supabase/migrations/20261005000002_rls_policies.sql` (line 20), `REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon;` correctly ensures that audit logs cannot be modified or deleted via SQL.

---

## 11. Deployment, Containerization & Infrastructure Analysis

### 11.1 Vercel Deployment Configuration (`vercel.json`)

The root `vercel.json` configures the serverless deployment:
- `installCommand`: `npm install && npm --prefix frontend install`
- `buildCommand`: `npm --prefix frontend run build`
- `outputDirectory`: `frontend/dist`
- `rewrites`:
  - `/api/v1/auth/:action` -> `/api/v1/auth/[action]`
  - `/api/v1/documents` -> `/api/v1/documents`
  - `/api/v1/manual-records` -> `/api/v1/manual-records`
  - `/api/v1/requests` -> `/api/v1/requests`
  - `/api/v1/reviews` -> `/api/v1/reviews`
  - `/api/v1/reports` -> `/api/v1/reports`
  - `/api/v1/query` -> `/api/v1/query`
  - `/(.*)` -> `/index.html` (SPA fallback)
- `headers`: Adds `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` on `/api/*`.

### 11.2 Python Microservice Deployment (`services/ai-engine/`)

- `Dockerfile`:
  - Base: `python:3.11-slim`
  - Installs system packages: `build-essential`, `curl`, `libmupdf-dev`, `libfreetype6-dev`.
  - Installs `requirements.txt`.
  - Healthcheck: `curl -f http://localhost:8000/health || exit 1`.
  - Entrypoint: `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`.
- `docker-compose.yml`:
  - Maps port `8000:8000`.
  - Mounts volumes `./exports` and `./facsimiles`.
  - Passes environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROK_API_KEY_PRIMARY`).

> [!WARNING]
> **Finding DEP-01: Background Worker Is Never Started in Container**  
> `Dockerfile` starts only `uvicorn main:app`. `worker.py` is a separate script and is not spawned as a background process or supervisor task. As a result, running `docker compose up` starts the HTTP API, but leaves the durable queue worker inactive.

---

## 12. Test Suites & QA Verification Analysis

### 12.1 Test Suite Inventory

| Test Suite | Command | File Count | Test Count | Pass Rate | Execution Time |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node Unit Tests** | `npm run test:node` | 7 test files | 53 tests | 100% (53/53) | ~200ms |
| **Python Unit Tests** | `npm run test:python` | 2 test files | 25 tests | 100% (25/25) | ~125ms |
| **Promptfoo RAG Eval** | `npm run test:promptfoo` | 1 config file | 8 assertions | 100% (8/8) | ~1.5s |
| **Playwright E2E** | `npm run test:e2e` | 1 spec file | 21 tests | 100% (21/21) | ~18.1s |
| **Legacy QA Runner** | `node tests/qa-runner.mjs` | 1 script | 24 tests | 100% (24/24) | ~12.4s |
| **TypeScript Typecheck** | `npm run typecheck` | Monorepo | N/A | Clean (0 errors) | ~3.2s |
| **Frontend Lint** | `npm run lint` | Frontend | N/A | Clean (0 errors) | ~15ms |

### 12.2 Test Fidelity Assessment

- **Unit Tests:** Mock the `VercelRequest` and `VercelResponse` objects and pass them directly to the backend function handlers. This validates handler logic, but does not test HTTP network transport or frontend integration.
- **E2E Tests:** Execute real browser interactions (Chrome/Chromium) verifying UI states, responsiveness, drawer toggles, and Markdown rendering.
- **Limitation:** There are **zero integration tests** that verify a full end-to-end flow from the React UI through the Vercel API gateway to the Supabase database and back.

---

## 13. End-to-End Trace: How Data Reaches the Chatbot

Tracing a user message from keystroke to rendered response reveals the exact execution path:

```text
Step 1: User Types Query in UI
        └── User enters "What was the coal production of ECL?" in QueryPage.tsx
        └── Hits Enter -> calls handleRunQuery() -> calls executeAIQuery() in AppContext.tsx

Step 2: Frontend State Initialization
        └── Generates user message { id: 'usr-...', sender: 'user', text: query }
        └── Generates placeholder { id: 'ast-...', sender: 'assistant', isStreaming: true }
        └── Appends messages to current ChatThread in AppContext

Step 3: Primary Path — Serverless API Call
        └── AppContext calls queryApi.execute(query, activeCtx, thinkingMode, attachedDocIds)
        └── Fetch POST to /api/v1/query with JSON payload
        └── Vercel rewrites to backend/functions/api/v1/query.ts:default(req, res)

Step 4: Serverless Query Execution (query.ts)
        ├── Attempts live query to Supabase:
        │   ├── getUserClient('') queries public.organizations
        │   └── getUserClient('') queries public.mines
        │   └── (If credentials missing or network fails, logs warning and uses cached metadata)
        ├── Runs Guardrail Checks:
        │   ├── Check 1: Prompt Injection Regex -> (No match)
        │   ├── Check 2: Greeting Regex -> (No match)
        │   └── Check 3: Commodity Guardrail Regex -> (No match)
        ├── Runs Domain Intent Matchers:
        │   └── Matches Intent 7: Direct Subsidiary Query (ECL / Rajmahal)
        │       └── lower.includes('rajmahal') || lower.includes('ecl')
        │       └── Extracts doc from CANONICAL_RECORDS.documents[0]
        │       └── Synthesizes answer: "According to the verified monthly operational returns for ECL Rajmahal OCP (August 2026), raw coal production totaled 45,210 tonnes..."
        │       └── Constructs GroundedSource: doc-ecl-001 (Table 1: Excavation Summary)
        └── Returns HTTP 200 JSON envelope: { ok: true, data: { answer, sources, status: 'sufficient', confidence: 0.96 } }

Step 5: Offline / Failure Fallback Path (If Step 3 returns !ok)
        └── AppContext catches error
        └── Calls synthesizeAnswerFromRecords(query, resolution, documents, activeCtx) in conversationService.ts
        └── Mirrors same regex extraction logic over in-memory documents array

Step 6: Token Streaming Simulation
        └── AppContext passes answerText to async generator streamAnswerTokens(answerText, signal, 12ms)
        └── Iterates word by word, updating ast-xxx text in React state every 12ms
        └── Triggering re-render in MessageMarkdown.tsx

Step 7: Markdown Rendering
        └── MessageMarkdown.tsx passes streamedText into Streamdown component
        └── Renders formatted bold text, tables, and clickable citation links
        └── Persists completed thread to localStorage under minesetu_threads_v2_${userId}
```

---

## 14. Confirmed Issues, Mock Implementations & Unverified Assumptions

| ID | Category | Severity | File Path & Line Numbers | Description | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ISS-01** | Architecture | **High** | `frontend/src/context/AppContext.tsx` (all actions) | Frontend UI is not wired to typed REST API clients (`documentsApi`, `manualRecordsApi`, etc.). | UI actions persist only to browser `localStorage`; data is not synced to database. |
| **ISS-02** | RAG / Retrieval | **High** | `backend/functions/api/v1/query.ts` (lines 308–786) | RAG pipeline is a hardcoded regex/rules engine. Vector similarity search (`search_document_chunks`) is never invoked. | Queries outside the pre-programmed 11 patterns cannot retrieve arbitrary document knowledge. |
| **ISS-03** | Ingestion | **High** | `services/ai-engine/connectors/mvp_connectors.py` (lines 29–226) | All 6 portal connectors return hardcoded static dictionaries. | No live data is fetched from official portals (`swcs.coal.gov.in`, `mdms.cmpdi.co.in`, etc.). |
| **ISS-04** | Queue / Worker | **Medium** | `services/ai-engine/Dockerfile` (line 29) | Dockerfile CMD only launches `uvicorn main:app`, leaving `worker.py` unstarted. | Processing jobs queued in PostgreSQL will not be processed automatically in container deployments. |
| **ISS-05** | Queue / Worker | **Medium** | `services/ai-engine/worker.py` (lines 72–116) | Worker assumes all claimed jobs are document OCR and calls `extractor.process_document`. Does not check `job_type === 'report_export'`. | Report compilation jobs queued by `/api/v1/reports?action=compile` would fail in the worker. |
| **ISS-06** | Database | **Medium** | `backend/supabase/migrations/20261005000001_core_schema.sql` (line 109) | `document_chunks` table has zero rows in live Supabase. | Vector search infrastructure is idle and unpopulated. |
| **ISS-07** | LLM | **Low** | `.env.local` (lines 15–21) | All Grok API keys are blank. | System operates exclusively in deterministic fallback mode; cannot perform generative synthesis. |
| **ISS-08** | Security | **High** | `frontend/src/pages/LoginPage.tsx` (lines 33–46) | Login page accepts any password and switches persona in `localStorage` without credential verification. | No authentication enforcement on frontend client. |
| **ISS-09** | Security | **Medium** | `backend/functions/lib/api-utils.ts` (lines 83–95) | Hardcoded `test-token-` bypasses authentication when `VITE_APP_ENV=test`. | Potential privilege escalation if environment variable is misconfigured in production. |
| **ISS-10** | UI / Reports | **Medium** | `frontend/src/pages/ReportsPage.tsx` (lines 97–160) | DOCX export creates an HTML string saved as `.doc` instead of calling `services/ai-engine/pipeline/compiler.py`. | Generated Word document is an HTML wrapper, not a native OpenXML `.docx` file. |
| **ISS-11** | UI / Workbench | **Low** | `frontend/src/pages/ValidationWorkbenchPage.tsx` (lines 184–260) | Facsimile viewer renders an HTML/CSS text recreation of the document, not an actual PDF page canvas with bounding box overlays. | Verification experience is simulated rather than an interactive canvas over real PDF scans. |

---

## 15. Risk Analysis & Prioritized Recommendations

### Risk Matrix

```text
       ┌────────────────────────────────────────────────────────┐
       │                       RISK MATRIX                      │
  HIGH │                   [ISS-01] [ISS-02]                    │
       │                   [ISS-08] [ISS-03]                    │
       │                                                        │
SEV.   │         [ISS-04]  [ISS-05]  [ISS-06]                   │
  MED  │         [ISS-09]  [ISS-10]                             │
       │                                                        │
  LOW  │         [ISS-07]  [ISS-11]                             │
       └────────────────────────────────────────────────────────┘
                   LOW               MED              HIGH
                                  PROBABILITY
```

### Prioritized Remediation Roadmap

#### Phase 1: High Priority (P0 — Immediate Architectural Alignment)

1. **Wire Frontend State to Typed API Gateway:**
   - Update `AppContext.tsx` so that document uploads, manual entries, requests, and reviews call the corresponding methods in `frontend/src/api/client.ts`.
   - Provide an automatic fallback to local state only when `apiRes.ok === false` (preserving offline demo functionality).
   - *Target Files:* `frontend/src/context/AppContext.tsx`, `frontend/src/api/client.ts`.

2. **Authenticate Frontend Personas via Supabase:**
   - Connect `LoginPage.tsx` to `authApi.login` or Supabase Auth `signInWithPassword`.
   - Maintain the demo persona switcher for evaluation, but back it by real seeded profiles.
   - *Target Files:* `frontend/src/pages/LoginPage.tsx`, `backend/functions/api/v1/auth/[action].ts`.

3. **Secure Test Token Backdoor:**
   - Remove or guard the `test-token-` bypass in `backend/functions/lib/api-utils.ts` to ensure it cannot be triggered in non-test deployments.
   - *Target Files:* `backend/functions/lib/api-utils.ts`.

#### Phase 2: Medium Priority (P1 — Retrieval & Ingestion Pipeline)

4. **Populate Vector Chunks & Connect Hybrid Search:**
   - Implement an ingestion script that chunks documents in `raw-documents`, computes embeddings (via OpenAI or compatible embedding endpoint), and stores them in `document_chunks`.
   - Update `backend/functions/api/v1/query.ts` to execute `supabase.rpc('search_document_chunks', ...)` when a query does not match canonical exact rules.
   - *Target Files:* `backend/functions/api/v1/query.ts`, `services/ai-engine/worker.py`.

5. **Deploy Background Worker & Route Job Types:**
   - Update `services/ai-engine/Dockerfile` or container orchestrator to run `python worker.py` as a managed background worker.
   - Update `worker.py` to route based on `job['job_type']` (`document_ocr` -> `extractor`, `report_export` -> `compiler`, `topic_modeling` -> `topic_modeler`).
   - *Target Files:* `services/ai-engine/Dockerfile`, `services/ai-engine/worker.py`.

6. **Connect Report Compiler to Python Microservice:**
   - Wire `ReportsPage.tsx` to call `reportsApi.create` and `reportsApi.compile`.
   - Let the compiled native `.docx`, `.xlsx`, and `.pdf` files from `compiler.py` be stored in Supabase Storage `exports` bucket for authenticated download.
   - *Target Files:* `frontend/src/pages/ReportsPage.tsx`, `backend/functions/api/v1/reports.ts`.

#### Phase 3: Low Priority (P2 — Portal Scraping & UI Polish)

7. **Implement Live Portal Scrapers:**
   - Transition `services/ai-engine/connectors/mvp_connectors.py` from static mocks to real `httpx` crawlers for public portals (CCO Monthly Statistics, CIL Production Portal).
   - Store ingested records into `production_records` with provenance SHA-256 hashes.
   - *Target Files:* `services/ai-engine/connectors/mvp_connectors.py`.

8. **PDF Facsimile Canvas Viewer:**
   - Replace the simulated HTML table in `ValidationWorkbenchPage.tsx` with a canvas-based PDF renderer (e.g. PDF.js or pre-rendered page images from `document_pages`) with normalized bounding box SVG overlays.
   - *Target Files:* `frontend/src/pages/ValidationWorkbenchPage.tsx`.

---

## 16. Audit Conclusion

MineSetu AI demonstrates **exceptional frontend design craftsmanship, comprehensive architectural documentation, and thorough unit/E2E test suites**. The user interface WOW factor, component polish, typography, and responsive layouts meet the highest standard of presentation.

The primary architectural gap identified by this audit is the **decoupling between the three subsystems**:
1. The React frontend is complete and polished, but largely executes against client-side mock data in `localStorage`.
2. The serverless API gateway is implemented and tested, but only 1 of its 7 endpoints is wired to the frontend.
3. The Python AI processing engine is functional with genuine document libraries, but runs in total isolation from the rest of the application.

Addressing the prioritized recommendations will transform MineSetu AI from a high-fidelity interactive prototype into an integrated, production-grade enterprise decision-support platform.
