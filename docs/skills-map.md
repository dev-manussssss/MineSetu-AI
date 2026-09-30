# Skills Map — MDMS + Mindsetu AI

This document tracks all development skills utilized across the project lifecycle as specified in Section 30 of `guidelines.md`.

## Known Project Skills

| Skill | Category | Project Use | Invocation Status |
|---|---|---|---|
| `writing-plans` | Architecture / Planning | Phased implementation planning, milestones, verification gates | **Applied & Verified** (Phases 0–8) |
| `brainstorming` | Architecture / Product | Architecture & product exploration, requirement analysis | **Applied & Verified** (Phases 0–2) |
| `frontend-design` | UI / UX | Design tokens, typography, visual hierarchy, layout systems, SaaS aesthetics | **Applied & Verified** (Phases 0, 2–7) |
| `backend-dev-guidelines` | Backend / Database | Service boundary definition, RBAC permission architecture, Supabase schemas | **Applied & Verified** (Phases 0, 1, 3, 6, 7) |
| `api-design` | API / Contracts | REST & Edge Function contracts, schema validation, Grok API gateway | **Applied & Verified** (Phases 0, 3, 5) |
| `systematic-debugging` | Debugging / Testing | State inspection, regression mitigation, boundary validation, build fixes | **Applied & Verified** (Phase 8) |
| `git-advanced-workflows` | Version Control | Clean branch strategy, atomic commits, conventional commit syntax | **Applied & Verified** (Phases 0–8) |

*(Note: Missing skill names from the 13 installed skills are not invented, and will be added when formally declared in project context.)*

---

## Detailed Skill Logs

### 1. `writing-plans`
- **Purpose**: Structure the multi-phase implementation roadmap from contract documentation through functional modules to deployment readiness.
- **Trigger**: User prompt "proceed with the implementation plan".
- **Phase**: Phases 0 through 8.
- **Inputs**: `guidelines.md`, SIH problem statement, visual references (`deisgn reference/ref1.png`, `ref2.png`).
- **Outputs Delivered**: Master implementation plan, `docs/progress.md`, and definition of done checklist across all 3 SIH modules.
- **Validation**: All 9 phases delivered functional, tested, documented code without skipping requirements.

### 2. `frontend-design`
- **Purpose**: Establish institutional, calm, high-precision SaaS aesthetic matching the visual reference (soft borders, 18px radii, clean typography, pill search and tabs, restrained accents, no neon/flashy clutter).
- **Trigger**: System design tokens and UI component creation.
- **Phase**: Phases 0, 2, 3, 4, 5, 6, 7.
- **Inputs**: `guidelines.md` (Sections 4 & 5), visual reference screenshots (`ref1.png`, `ref2.png`).
- **Outputs Delivered**: `design.md`, CSS design system tokens (`tokens.css`, `index.css`), responsive layouts, role-specific views (`DashboardPage`, `DocumentsPage`, `ValidationWorkbenchPage`, `ComparePage`, `TopicsPage`, `QueryPage`, `ReportsPage`, `ParliamentaryDeskPage`, `AdminPage`).
- **Validation**: High visual contrast, consistent spacing, semantic badge colors, no decorative fake buttons.

### 3. `backend-dev-guidelines`
- **Purpose**: Ensure clean separation of concerns, secure server-side authorization, immutable original documents, and robust data lineage.
- **Trigger**: RBAC architecture, database schema, and mock data engine design.
- **Phase**: Phases 0, 1, 3, 6, 7.
- **Inputs**: `guidelines.md` (Sections 1, 8, 9, 18, 29).
- **Outputs Delivered**: `rbac.md`, `database.md`, centralized `can(user, permission)` engine in `src/lib/rbac.ts`, immutable audit logging.
- **Validation**: Zero unauthorized route access; strict enforcement of tenant/subsidiary data scopes.

### 4. `api-design`
- **Purpose**: Standardize request/response payloads, validation schemas, error envelopes, and edge function interfaces.
- **Trigger**: Document ingestion, OCR extraction, AI query, and report generation APIs.
- **Phase**: Phases 0, 3, 5.
- **Inputs**: `guidelines.md` (Sections 16, 17, 19, 26).
- **Outputs Delivered**: `api.md`, `ai-pipeline.md`, typed API response contracts.
- **Validation**: Strict schema validation on all inputs and outputs; transparent error states.

### 5. `systematic-debugging`
- **Purpose**: Systematic diagnosis of TypeScript compile errors under strict `verbatimModuleSyntax` and `noUnusedLocals` options.
- **Trigger**: Initial build failures in `npm run build`.
- **Phase**: Phase 8.
- **Inputs**: TypeScript error logs across components.
- **Outputs Delivered**: Fixed type-only imports (`import type`), eliminated dead variables, clean zero-diagnostic build.
- **Validation**: `npm run build` exits 0; `npm test` passes 5/5 assertions.

### 6. `git-advanced-workflows`
- **Purpose**: Maintain atomic commits, semantic commit messages (`feat:`, `fix:`, `docs:`, `chore:`), clean branching (`main`, `develop`, `feature/*`).
- **Trigger**: Git initialization and all code changes.
- **Phase**: All phases.
- **Inputs**: `guidelines.md` (Section 21).
- **Outputs Delivered**: Clean git tree, `.gitignore`, traceable commit history on `develop`.
- **Validation**: Zero leaked secrets, clean `git status` before phase completion.
