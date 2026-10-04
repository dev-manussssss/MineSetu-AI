# Engineering Brain & Memory — MDMS + Mindsetu AI

## 1. Confirmed Project Requirements

- **Prototype Scope**: AI-enabled extension layer around existing Mine Data Management System (MDMS) workflows. Clear disclaimer that this is a research/demonstration prototype and not an official Government of India / CIL / NIC / CMPDI production system.
- **Three Core SIH Modules**:
  1. Automated Report Generation
  2. Topic Identification / Word Cloud
  3. AI-Based Query & Response (Grounded RAG)
- **Document Pipeline**: `Original Document → OCR / Extraction → Data Validation → Human Review & Approval → Approved Records → Reports / Analytics / Query`.
- **7 Prototype Roles**:
  1. Ministry Executive (Strategic overview, high-level summaries, parliamentary Q&A)
  2. CIL Executive Management (Enterprise analytics, subsidiary performance, approvals)
  3. CMPDI Nodal Expert (Ingestion queue, OCR review, validation, topic intelligence)
  4. Subsidiary Manager (Subsidiary mine data, documents, validation, approvals, reports)
  5. Parliamentary Query Cell (Query inbox, archive search, AI draft, source verification)
  6. Field / Mine Data Officer (Upload document, my documents, OCR issues, verification)
  7. System Administrator (Users, RBAC permissions, system health, AI services, audit logs, demo seed)
- **Visual Aesthetic**: Clean, modern, calm, data-dense SaaS matching the visual reference (`assets/design-references/ref1.png` and `ref2.png`). Slim sidebar, rounded pill navigation, large readable metric stats, soft border cards (16-20px radii), high contrast light/dark surfaces.
- **Security & Reliability**:
  - No client-side private API keys (Grok keys & Supabase service role keys never in browser or `VITE_*` variables).
  - Source grounding is mandatory for all AI answers.
  - Clear distinction between "AI Draft", "Reviewed Draft", and "Approved Response".
  - Synthetic demo data clearly flagged with `is_demo: true`.

---

## 2. Key Constraints & Guiding Principles

- **No Over-Engineering**: Clean, modular structure using standard tools.
- **Immutable Source Documents**: Original uploaded files are never overwritten; extracted records point back to source document ID and page number.
- **Auditable Actions**: Key state transitions (upload, OCR extraction, edit, approve, reject, query, export) generate structured audit log entries.
- **Strict Role Boundaries**: Centralized `can(user, permission)` check, preventing repeated `if (user.role === 'admin')` antipatterns.

---

## 3. Architectural & Implementation Decisions

```text
DATE: 2026-09-30
DECISION: Use Vite + React + TypeScript + Vanilla CSS Design System with Lucide Icons.
WHY: Satisfies high-performance, modular SPA requirements while retaining complete control over custom design tokens, micro-animations, and institutional styling matching the exact visual references (ref1.png, ref2.png) without heavy framework bloat.
ALTERNATIVES CONSIDERED: Next.js (heavier server requirements for a prototype SPA), TailwindCSS (explicitly discouraged in system prompt unless asked; Vanilla CSS provides full token fidelity).
IMPACT: High build speed, zero CSS specificity conflicts, deterministic Vercel deployment.
FILES AFFECTED: frontend/package.json, frontend/src/styles/tokens.css, frontend/src/styles/index.css
```

```text
DATE: 2026-09-30
DECISION: Centralized Permission Engine via can(user, permission) & Role Navigation Matrix.
WHY: Eliminates scattered role strings across components. Allows dynamic navigation generation and seamless multi-role switching with distinct access scopes.
ALTERNATIVES CONSIDERED: Hardcoding role checks in each route/button.
IMPACT: Clean, maintainable RBAC with clear auditability and testing coverage.
FILES AFFECTED: frontend/src/lib/rbac.ts, rbac.md
```

```text
DATE: 2026-09-30
DECISION: Strict Synthetic Mining Dataset with 8 Real Subsidiary Entity Codes (ECL, BCCL, CCL, NCL, WCL, SECL, MCL, CMPDI).
WHY: Grounding prototype in authentic CIL subsidiary names creates high realism for stakeholders while explicitly labeling all figures as synthetic demo data to preserve absolute integrity.
ALTERNATIVES CONSIDERED: Generic fictional mining names (reduces prototype credibility).
IMPACT: Authentic domain feel with full compliance with Section 1.2 and Section 27.
FILES AFFECTED: mock-dataset.md, frontend/src/data/mockMiningData.ts
```

```text
DATE: 2026-09-30
DECISION: Human-in-the-Loop Validation Workbench with Side-by-Side Facsimile.
WHY: Inserting AI safely into MDMS requires human confirmation before extracted records become authoritative. The split view presents immutable source form against editable extracted fields with explicit confidence scores.
ALTERNATIVES CONSIDERED: Blind automated ingestion straight to database.
IMPACT: Zero unauthorized database contamination; complete lineage tracking and audit logging.
FILES AFFECTED: frontend/src/pages/ValidationWorkbenchPage.tsx, ai-pipeline.md
```

```text
DATE: 2026-09-30
DECISION: Anti-Hallucination Guardrail in AI Query with Neutral Variance Terminology.
WHY: In statutory and mining operations, guessing or fabricating numbers is unacceptable. When evidence is missing, the system explicitly returns "Insufficient source evidence" and uses neutral "Difference detected" rather than "AI found an error".
ALTERNATIVES CONSIDERED: Generic LLM completion without source validation.
IMPACT: Reliable, audit-compliant question answering that respects institutional caution.
FILES AFFECTED: frontend/src/context/AppContext.tsx, frontend/src/pages/QueryPage.tsx, frontend/src/pages/ComparePage.tsx
```

---

## 4. Unresolved Questions & Assumptions

- **Assumption**: Supabase and Grok/xAI credentials may not be supplied during initial local run; the app provides seamless synthetic fallback data and mock Grok AI responses while being 100% ready to bind real credentials via `.env`.
- **Status**: Verified in local build and test execution.

---

## 5. Lessons & Rejections

- **Rejected**: Flashy neon gradients, particle effects, or generic crypto/AI dashboard widgets.
- **Reason**: Violates Section 4.1 and Section 5 ("Empillard Lessons Carried Forward"). Mining and government administration requires sober, high-contrast, institutional clarity.
