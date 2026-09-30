# Changelog — MDMS + Mindsetu AI

All notable changes and architectural decisions for this project are documented here in accordance with Section 3 of `guidelines.md`.

## [Unreleased] - Phase 0 Setup (2026-09-30)

### Added
- **Core Contract Documentation Suite**:
  - `docs/skills-map.md`: Skill tracking for `@writing-plans`, `@frontend-design`, `@backend-dev-guidelines`, `@api-design`, `@systematic-debugging`, `@git-advanced-workflows`.
  - `docs/progress.md`: Phase status tracking and verification records.
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
- **Repository Foundations**:
  - Initialized Git repository.
  - Added `.gitignore` and `.env.example`.
