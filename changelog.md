# Changelog — MineSetu AI

All notable changes and architectural decisions for this project are documented here in accordance with `docs/guidelines.md`.

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
