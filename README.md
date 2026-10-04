# MineSetu AI — Coal-Sector Reporting Workspace Prototype

> **PROTOTYPE DEMONSTRATION & CONCEPT DISCLAIMER**:  
> MineSetu AI demonstrates a proposed AI-powered extension to the Mine Data Management System (MDMS) reporting workflow. This is a **standalone prototype and concept demonstration**, not the official MDMS portal. It does not claim a live MDMS connection, official government authentication, official approval, government endorsement, live government data, or an established API. All operational figures and returns displayed in demonstration modes are synthetic records (`is_demo: true`) created for workflow simulation.

---

## 1. Product Definition & Purpose

In traditional coalfield operations, daily production returns, overburden logs, and statutory inspection reports arrive as scanned paper forms or multi-page PDFs across multiple Coal India Limited (CIL) subsidiaries. 

**MineSetu AI** (*"Setu"* meaning *Bridge*) explores an assistive software layer that connects physical returns, structured field data contributions, human verification, and executive reporting:

```text
Field Document / Manual Entry ──> Extraction & OCR ──> Human Verification ──> Review Queue ──> Grounded Search & Multi-Format Reports
```

### The Three Core AI Modules
1. **Automated Report Generation**: Rapid compilation of operational returns into executive briefs with verified citations, exported simultaneously to **PDF**, **Microsoft Word (.docx)**, and **Microsoft Excel (.xlsx)**.
2. **Word Cloud & Topic Identification**: Semantic clustering across colliery remarks, inspection notes, and shift diaries to highlight operational friction and safety trends.
3. **AI-Based Query & Response ("Ask MineSetu")**: Strictly source-grounded natural language search with anti-hallucination guardrails and explicit document citations.

---

## 2. Documentation as Source of Truth

The canonical specifications for MineSetu AI are maintained in the `docs/` hierarchy. **Start by reading the Master Guidelines**:

👉 **[Master Engineering Guidelines (`docs/guidelines.md`)](docs/guidelines.md)** 👈

### Canonical Roadmap & Living Dashboards
- 🌟 **[Interactive Visual Dashboard (`docs/IMPLEMENTATION_DASHBOARD.html`)](docs/IMPLEMENTATION_DASHBOARD.html)** — Circular progress tracker, phase walkthroughs, test console, and 27-portal matrix (Open in browser).
- 📋 **[Master Implementation Plan 4 (`docs/IMPLEMENTATION_PLAN_4_FINAL.md`)](docs/IMPLEMENTATION_PLAN_4_FINAL.md)** — Canonical 6-phase master architecture roadmap.
- 📊 **[Implementation Status Dashboard (`docs/IMPLEMENTATION_STATUS.md`)](docs/IMPLEMENTATION_STATUS.md)** — Living markdown status tracker (96.0% verified completion).
- 📜 **[Chronological Activity Log (`docs/IMPLEMENTATION_LOG.md`)](docs/IMPLEMENTATION_LOG.md)** — Test logs, audit trails, and execution evidence.

### Complete Documentation Index
- **Strategy & Governance**:
  - [Project Overview & Problem Statement](docs/project-overview.md)
  - [Role-Based Access Control & Personas](docs/role-permissions.md)
  - [Architecture Decision Records (Decisions Log)](docs/decisions-log.md)
- **Architecture & Specifications**:
  - [System Architecture Specification](docs/architecture.md)
  - [Frontend Page Blueprint & Specification](docs/frontend-page-specification.md)
  - [Frontend Design System & Tokens](docs/frontend-design-system.md)
  - [State Transitions & Operational Workflows](docs/workflows.md)
  - [Data Model & Relational Schema](docs/data-model.md)
  - [REST API Contracts & Endpoints](docs/api-contracts.md)
  - [AI Pipeline & Document Processing Engine](docs/ai-and-document-processing.md)
- **Security & Quality**:
  - [Security, Privacy & Secret Management](docs/security-and-secrets.md)
  - [Testing Strategy & Acceptance Criteria](docs/testing-and-acceptance.md)
  - [Vercel Deployment Guide](docs/vercel-deployment.md)
  - [Implementation Status & Repository Audit](docs/implementation-status.md)
- **Historical Archive**:
  - [Preserved Legacy Documentation Archive](docs/archive/legacy-docs/README.md)

---

## 3. Four Target Prototype Personas

The prototype models four operational roles:
1. **Ministry of Coal** (`ministry_coal`): High-level cross-subsidiary governance, parliamentary briefings, and national production monitoring.
2. **CIL Headquarters** (`cil_hq`): Enterprise subsidiary operational consolidation, target vs actual tracking, and variance reconciliation.
3. **CMPDI** (`cmpdi`): Technical & geological oversight, OCR extraction verification, and exploratory topic intelligence.
4. **Subsidiary / Mine Officer** (`subsidiary_officer`): Primary colliery returns, first-class manual data entry, and field error corrections.

---

## 4. Local Quickstart & Development

### Prerequisites
- Node.js 20.x or 22+
- npm 10+

### Installation & Run
```bash
# Clone the repository
git clone <repo-url>
cd MineSetu

# Install frontend dependencies
npm --prefix frontend install

# Start local Vite development server
npm run dev
# (or: ./start.sh)
```

Visit `http://localhost:5173` to explore the institutional landing page and demo logins.

---

## 5. Automated Testing & Verification

The repository includes automated unit tests verifying RBAC permission boundaries and anti-hallucination guardrails:

```bash
# Execute unit tests (Node.js native test runner)
npm test

# Run TypeScript compilation check
npm run typecheck

# Build production bundle
npm run build

# Run linter
npm run lint
```

---

## 6. Environment Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configurable variables:
- `VITE_APP_ENV`: `development` | `production`
- `VITE_APP_DEMO_MODE`: `true` (enables synthetic fallback data)
- `VITE_SUPABASE_URL`: Public Supabase URL (client-safe)
- `VITE_SUPABASE_ANON_KEY`: Public anonymous API key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side service key (**never exposed to browser**)
- `GROK_API_KEY_PRIMARY`: Primary xAI Grok inference key (**server-side only**)
- `GROK_API_KEY_FALLBACK`: Secondary xAI Grok key for failover (**server-side only**)

---

## 7. Vercel Deployment Summary

MineSetu AI is configured for seamless deployment on **Vercel**:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (or `npm --prefix frontend run build`)
- **Output Directory**: `dist` (or `frontend/dist`)
- **SPA Rewrites**: Managed via root and frontend `vercel.json` rewrites to `/index.html`.

Consult [Vercel Deployment Guide (`docs/vercel-deployment.md`)](docs/vercel-deployment.md) for complete details on serverless execution timeouts and object storage integration.
