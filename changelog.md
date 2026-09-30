# Changelog — MDMS + Mindsetu AI

All notable changes and architectural decisions for this project are documented here in accordance with Section 3 of `guidelines.md`.

## [1.0.0] - Core Implementation Complete (2026-09-30)

### Added
- **Core Contract Documentation Suite (Phase 0)**:
  - `docs/skills-map.md`: Active tracking for `@writing-plans`, `@frontend-design`, `@backend-dev-guidelines`, `@api-design`, `@systematic-debugging`, `@git-advanced-workflows`.
  - `docs/progress.md`: Phase status tracking, checklists, and verification records.
  - `brain.md`: Persistent engineering memory and architectural decision ledger.
  - `architecture.md`: High-level architecture, boundaries, trust zones, and data pipelines.
  - `design.md`: Design tokens, typography, radii, spacing, matching visual references (`ref1.png`, `ref2.png`).
  - `rbac.md`: 7 prototype roles, permission registry, route access matrix, and data scopes.
  - `database.md`: PostgreSQL / Supabase schemas for documents, extractions, queries, and audit logs.
  - `api.md`: API endpoints, schemas, authorization requirements, and error envelope formatting.
  - `ai-pipeline.md`: Ingestion, OCR, validation, 3 core SIH modules, and Grok API fallback.
  - `security.md`: Threat model, secret isolation, and least-privilege access rules.
  - `mock-dataset.md`: Synthetic CIL subsidiary dataset and seed/reset policies.
  - `testing.md`: Testing hierarchy covering unit, integration, RBAC, UI, and responsive testing.
  - `vercel-deployment.md`: Build settings, environment variable bindings, and Vercel configuration.
  - `README.md`, `.env.example`, `.gitignore`, `vercel.json`.

- **Frontend Application Scaffolding & Design System (Phase 1 & 2)**:
  - React 19 / Vite + TypeScript application in `frontend/`.
  - Tokenized Vanilla CSS design system (`tokens.css`, `index.css`) matching `ref1.png` and `ref2.png` (pill tabs, pill search input, 18px radii, 4-column metric grid).
  - Centralized RBAC evaluator `can(user, permission)` and `getNavigationForRole(user)` supporting all 7 prototype personas.
  - Institutional `LandingPage` adhering strictly to Section 6 and Section 1.4.
  - `LoginPage` with one-click demo persona authentication and `DEMO ACCOUNT — SYNTHETIC DATA` watermark.
  - `DashboardLayout`, `Sidebar`, `TopHeader`, and `DisclaimerBanner` components.

- **The Three Core SIH Modules (Phases 3, 4, 5, 6)**:
  - **Module 1**: `DocumentsPage` ingestion queue, upload modal, and `ValidationWorkbenchPage` human-in-the-loop verification with split facsimile and audit logging.
  - **Module 1 (Comparison)**: `ComparePage` with neutral "Difference detected" variance terminology.
  - **Module 2**: `TopicsPage` with interactive SVG Word Cloud, cluster inspection, and cross-subsidiary mention frequencies.
  - **Module 3**: `QueryPage` with source-grounded RAG, document/page citations, and anti-hallucination guardrail ("Insufficient source evidence").
  - **Module 1 (Reporting)**: `ReportsPage` automated report builder with subsidiary/mine filters, executive narrative, verified tables, and PDF print export.
  - **Parliamentary Desk**: `ParliamentaryDeskPage` supporting intake, AI draft, reviewed draft, and executive sign-off workflows.

- **Administration, Audit & QA (Phases 7 & 8)**:
  - `AdminPage` with searchable audit event ledger, RBAC permissions matrix inspector, and service health monitors.
  - Automated unit test suite (`tests/rbac.test.mjs`) verified with Node test runner (5/5 tests passing).
  - Production build verification (`npm run build`) passing with zero diagnostics.
