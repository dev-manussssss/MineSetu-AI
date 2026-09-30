# Skills Map — MDMS + Mindsetu AI

This document tracks all development skills utilized across the project lifecycle as specified in Section 30 of `guidelines.md`.

## Known Project Skills

| Skill | Category | Project Use | Invocation Status |
|---|---|---|---|
| `writing-plans` | Architecture / Planning | Phased implementation planning, milestones, verification gates | **Invoked (Phase 0)** |
| `brainstorming` | Architecture / Product | Architecture & product exploration, requirement analysis | **Invoked (Phase 0)** |
| `frontend-design` | UI / UX | Design tokens, typography, visual hierarchy, layout systems, SaaS aesthetics | **Invoked (Phase 0)** |
| `backend-dev-guidelines` | Backend / Database | Service boundary definition, RBAC permission architecture, Supabase schemas | **Invoked (Phase 0)** |
| `api-design` | API / Contracts | REST & Edge Function contracts, schema validation, Grok API gateway | **Invoked (Phase 0)** |
| `systematic-debugging` | Debugging / Testing | State inspection, regression mitigation, boundary validation | Pending Phase 8 |
| `git-advanced-workflows` | Version Control | Clean branch strategy, atomic commits, conventional commit syntax | **Invoked (Phase 0)** |

*(Note: Additional skills from the 13 installed skills will be appended as their formal identifiers are confirmed. Missing skill names are not invented.)*

---

## Detailed Skill Logs

### 1. `writing-plans`
- **Purpose**: Structure the multi-phase implementation roadmap from contract documentation through functional modules to deployment readiness.
- **Trigger**: User prompt "proceed with the implementation plan".
- **Phase**: Phase 0 & ongoing phase gates.
- **Inputs**: `guidelines.md`, SIH problem statement, visual references (`deisgn reference/ref1.png`, `ref2.png`).
- **Expected Outputs**: Phased master implementation plan, `docs/progress.md`, and definition of done checklist.
- **Validation**: Every phase delivers functional, tested, documented code without skipping requirements.

### 2. `frontend-design`
- **Purpose**: Establish institutional, calm, high-precision SaaS aesthetic matching the visual reference (soft borders, 16px/20px radii, clean typography, pill search and tabs, restrained accents, no neon/flashy clutter).
- **Trigger**: System design tokens and UI component creation.
- **Phase**: Phase 0, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6.
- **Inputs**: `guidelines.md` (Sections 4 & 5), visual reference screenshots (`ref1.png`, `ref2.png`).
- **Expected Outputs**: `design.md`, CSS design system tokens (`tokens.css`, `index.css`), responsive layouts, role-specific views.
- **Validation**: High visual contrast, consistent spacing, semantic badge colors, no decorative fake buttons.

### 3. `backend-dev-guidelines`
- **Purpose**: Ensure clean separation of concerns, secure server-side authorization, immutable original documents, and robust data lineage.
- **Trigger**: RBAC architecture, database schema, and mock data engine design.
- **Phase**: Phase 0, Phase 1, Phase 7.
- **Inputs**: `guidelines.md` (Sections 1, 8, 9, 18).
- **Expected Outputs**: `rbac.md`, `database.md`, centralized `can(user, permission)` engine, audit logging.
- **Validation**: Zero unauthorized route access; strict enforcement of tenant/subsidiary data scopes.

### 4. `api-design`
- **Purpose**: Standardize request/response payloads, validation schemas, error envelopes, and edge function interfaces.
- **Trigger**: Document ingestion, OCR extraction, AI query, and report generation APIs.
- **Phase**: Phase 0, Phase 3, Phase 5, Phase 6.
- **Inputs**: `guidelines.md` (Sections 16, 17, 19, 26).
- **Expected Outputs**: `api.md`, `ai-pipeline.md`, typed API response contracts.
- **Validation**: Strict schema validation on all inputs and outputs; transparent error states.

### 5. `git-advanced-workflows`
- **Purpose**: Maintain atomic commits, semantic commit messages (`feat:`, `fix:`, `docs:`, `chore:`), clean branching (`main`, `develop`, `feature/*`).
- **Trigger**: Git initialization and all code changes.
- **Phase**: All phases.
- **Inputs**: `guidelines.md` (Section 21).
- **Expected Outputs**: Clean git tree, `.gitignore`, traceable commit history.
- **Validation**: Zero leaked secrets, clean `git status` before phase completion.
