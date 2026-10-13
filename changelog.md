# Changelog — MineSetu AI

All notable changes and architectural decisions for this project are documented here in accordance with `docs/guidelines.md`.

## [1.2.0-beta.1] - Controlled Beta Release: Complete Six-Phase Implementation & Verification (2026-10-13)

### Added
- **Phase 1: Real API Gateway Integration & Persistence**:
  - Configured Vite Local API Gateway (`frontend/vite.config.ts`) executing all 8 serverless function endpoints (`/api/v1/auth/*`, `/api/v1/documents`, `/api/v1/manual-records`, `/api/v1/query`, `/api/v1/reports`, `/api/v1/requests`, `/api/v1/reviews`, `/api/v1/connectors`) with Vercel request/response semantics during local development.
  - Server-side RBAC and tenant isolation across the 4 primary personas (`ministry_coal`, `cil_hq`, `cmpdi`, `subsidiary_officer`) in `backend/functions/lib/api-utils.ts` and `supabase.ts`.
  - Automated integration test suite (`tests/unit/phase1-integration.test.mjs`) covering persona metadata, tenant isolation, upload intent, and manual records.
- **Phase 2: Document Ingestion, Python AI Engine & Durable Workers**:
  - Durable worker architecture (`services/ai-engine/worker.py`) with atomic job claiming (`claim_processing_job`), lease heartbeats, and graceful error categorization.
  - PyMuPDF coordinate-aware extraction pipeline (`services/ai-engine/pipeline/extractor.py`) with normalized bounding boxes `[0..1000]`.
  - Honest scanned PDF boundary detection (`scanned_pdf_needs_ocr`) and statutory metric extraction (`annual_target_mt`, `achievement_pct`).
  - Unit test suite (`services/ai-engine/tests/test_ai_engine.py`) with 31 passing Python tests.
- **Phase 3: Real Evidence Retrieval, RAG & Grounded Answers**:
  - Dynamic database evidence retrieval in `backend/functions/api/v1/query.ts` over `organizations`, `mines`, and `manual_records`.
  - Strict "No Evidence, No Final Answer" anti-hallucination guardrail (`status: 'insufficient'` with 0 sources).
  - Prompt injection defense neutralizing system instruction override attempts.
  - Exact source citations with document IDs, page numbers, and bounding box coordinates.
  - Automated RAG integration suite (`tests/unit/phase3-rag.test.mjs`, 7 tests) and Promptfoo ground-truth evaluation benchmark (8 assertions, 100% pass).
- **Phase 4: Native Report Generation, Topic Analysis & Analytics**:
  - Native binary generation for `.docx` (python-docx), `.xlsx` (openpyxl), and `.pdf` (ReportLab) in `services/ai-engine/pipeline/compiler.py`.
  - Spreadsheet formula injection protection (CWE-1236) quoting cells beginning with `=`, `+`, `-`, `@`.
  - Authenticated binary download endpoint (`action=download_file`) in `backend/functions/api/v1/reports.ts`.
  - Unit and integration tests (`tests/unit/phase4-reports.test.mjs`, 6 tests; Python tests 26-29, 4 tests).
- **Phase 5: Public Coal-Sector Data Connectors & Ingestion**:
  - Statutory catalog classification for 27 coal portals (`services/ai-engine/connectors/registry.py`) with honest access states (`live_pollable`, `verified_static_snapshot`, `restricted_internal`, `blocked_restricted`).
  - SHA-256 provenance tracking, tamper detection, and idempotent ingestion deduplicating records.
  - Automated discrepancy detection cross-referencing CCO national statistics vs colliery returns.
  - Connector endpoints (`/api/v1/connectors`) and test suites (`tests/unit/phase5-connectors.test.mjs`, 5 tests; Python tests 11-13, 3 tests).
- **Phase 6: Source Viewer, Complete Integration & Beta Release Validation**:
  - Enhanced `ValidationWorkbenchPage.tsx` with synchronized field highlighting, normalized coordinate bounding boxes (`[0..1000]`), visual before/after comparison between raw extracted and verified values, and citation deep-linking.
  - 13-step Beta User Journey Playwright E2E suite (`tests/e2e/beta-journey.spec.ts`, 15 test passes across Desktop 1440, Desktop 1280, Mobile 390).
  - Multi-viewport responsive verification (39/39 Playwright tests passed, 100%).
  - Zero modifications to `frontend/src/components/Sidebar.tsx` preserving original branding and navigation integrity.
  - Master tracking documentation: `PROGRESS.md`, `BETA_TEST_PLAN.md`, `IMPLEMENTATION_PLAN.md`, and `IMPLEMENTATION_REPORT.md`.

## [1.1.0] - Repository Audit, Documentation Reset & Architecture Alignment (2026-10-04)

### Added
- **Canonical Master Documentation Suite (`docs/`)**:
  - `docs/guidelines.md`: Master engineering guidelines, source-of-truth hierarchy, terminology definitions, UI copy/accessibility, and non-negotiable legal disclaimers.
  - `docs/project-overview.md`: Problem statement, proposed MDMS relationship (extension concept, not replacement), 4 target personas, and 3 core AI modules.
  - `docs/architecture.md`: Starting audit snapshot, target logical architecture, component boundaries, route structure, Mermaid flows, and Vercel execution constraints.
  - `docs/role-permissions.md`: Deep specification of the 4 approved personas (Ministry of Coal, CIL HQ, CMPDI, Subsidiary / Mine Officer), data scopes, and legacy 7-role mapping.
  - `docs/frontend-design-system.md`: Official brand asset paths (`file_00000000e9e88208ae070777ee045cb1.png`, `ref1.png`, `ref2.png`), exact token hex values, and component standards.
  - `docs/frontend-page-specification.md`: Implementable blueprint covering Landing, Split-Screen Login, 4 Dashboards, Dual Ingestion (Upload + Manual Entry), Validation Workbench, Ask MineSetu, Reports, and complete button/control specification table.
  - `docs/workflows.md`: Finite state machine state transitions for upload, OCR extraction, manual data entry, human verification, requests, review queue, and multi-format reports.
  - `docs/ai-and-document-processing.md`: Ingestion pipeline, supported formats, deterministic calculations, strict prompt boundaries, anti-hallucination guardrails, and Grok 2 gateway.
  - `docs/api-contracts.md`: Actual repository API inventory (confirming zero existing server routes) and comprehensive proposed REST endpoints with schemas and error envelopes.
  - `docs/data-model.md`: Implementation-neutral entity relationship model, multi-tenant scoping, and Mermaid ER diagram separating client mock state from proposed backend schema.
  - `docs/security-and-secrets.md`: Zero-client-secret policy, server-side secret isolation, multi-tenant IDOR prevention, upload validation, and PII scrubbing.
  - `docs/vercel-deployment.md`: Detected Vite/React 19 stack, verified build commands, serverless limits (10s timeout, 4.5MB payload, ephemeral storage), and deployment verification steps.
  - `docs/testing-and-acceptance.md`: Verification of existing 5 unit tests, plus comprehensive acceptance criteria matrix for all modules.
  - `docs/implementation-status.md`: Detailed audit snapshot, verified test/build commands, asset paths, identified code/specification conflicts, and phased implementation roadmap.
  - `docs/decisions-log.md`: Formal Architecture Decision Records (ADRs) cataloging 11 approved decisions and 8 open technical choices.
- **Historical Documentation Archive**:
  - Moved legacy documentation files (`docs/architecture/`, `docs/design-system/`, `docs/operations/`, `docs/reference-data/`) to `docs/archive/legacy-docs/` with an explanatory `README.md` to prevent multiple contradictory sources of truth.

### Changed
- **Root `README.md`**: Rewritten as an authoritative entry point reflecting the approved product direction, linking `docs/guidelines.md` first, providing the complete documentation index, and documenting verified build/test commands.
- **Documentation Source of Truth**: Replaced fragmented and contradictory documentation notes with an explicit epistemic hierarchy distinguishing verified facts from proposals and mocks.

### Preserved
- **Application Code & Working Builds**: Preserved existing working frontend code, package manifests, and test suites in a safe, 100% buildable state without broad application rewriting during this documentation-first deliverable (`npm test` and `npm --prefix frontend run build` verified passing).

---

## [1.0.0] - Initial Prototype Scaffolding (2026-09-30)

### Added
- **Frontend Scaffolding**: React 19 / Vite + TypeScript client-side SPA with Lucide React iconography.
- **Client Design System**: Initial Vanilla CSS token styling (`tokens.css`, `index.css`).
- **Client-Side Prototype RBAC**: Preliminary 7-role permission evaluator and mock navigation.
- **Client Pages**: Prototype pages for landing, login, dashboard, documents, validation workbench, comparison, queries, reports, and administrative views.
- **Automated Unit Tests**: Preliminary RBAC test suite (`tests/unit/rbac.test.mjs`) executing under native Node.js test runner.
