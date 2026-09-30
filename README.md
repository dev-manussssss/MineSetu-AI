# MDMS + Mindsetu AI

> **PROTOTYPE DEMONSTRATION DISCLAIMER**:
> This repository is a technical prototype and concept demonstration of an AI-enabled extension layer around existing Mine Data Management System (MDMS) workflows. It is **not** an official Government of India, Ministry of Coal, CMPDI, CIL, NIC, or MDMS production system. All operational numbers and figures depicted in demo modes are synthetic records created for research and interface demonstration purposes.

---

## 1. Project Purpose

In traditional mining management, daily operational returns, statutory reports, and production logs often arrive as scanned paper forms or unstructured PDFs across multiple coalfield subsidiaries. MDMS + Mindsetu AI demonstrates how modern assistive intelligence can be inserted into the existing lifecycle:

```text
Scanned Document → OCR / Extraction → Automated Validation → Human Review → Approved Data → AI Query / Analytics / Reports
```

### Three Core SIH Modules
1. **Automated Report Generation**: Rapid compilation of subsidiary/mine operational reviews with verified source citations.
2. **Topic Identification & Word Cloud**: Semantic clustering and visualization of unstructured remarks, inspection notes, and shift logs.
3. **AI-Based Query & Response (Grounded RAG)**: Natural language question answering strictly grounded in verified source documents with interactive source inspection.

---

## 2. Architecture Summary

The prototype features a modular architecture:
- **Frontend**: React 19 / Vite + TypeScript with a custom tokenized Vanilla CSS design system modeled on institutional SaaS benchmarks (`deisgn reference/ref1.png`, `ref2.png`).
- **Authorization & RBAC**: Centralized `can(user, permission)` permission model supporting 7 distinct prototype roles (Ministry Exec, CIL Exec, CMPDI Nodal, Subsidiary Manager, Parliamentary Query Cell, Field Officer, System Administrator).
- **Backend / Storage**: Supabase PostgreSQL schemas, Row-Level Security, immutable file storage, and append-only audit logging.
- **AI Gateway**: Grok 2 / xAI integration with primary/fallback API key rotation and offline synthetic grounding.

---

## 3. Local Setup & Quickstart

### Prerequisites
- Node.js 20.x or 22+
- npm 10+

### Installation & Run
```bash
# Clone the repository
git clone <repo-url>
cd MineSetu

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` to explore the institutional landing page and demo logins.

---

## 4. Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configurable variables:
- `VITE_SUPABASE_URL`: Supabase project URL (client-safe)
- `VITE_SUPABASE_ANON_KEY`: Supabase anon API key (client-safe)
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side service key (never exposed to client)
- `GROK_API_KEY_PRIMARY`: Primary xAI Grok API key (server-side only)
- `GROK_API_KEY_FALLBACK`: Backup xAI Grok API key (server-side only)
- `VITE_APP_DEMO_MODE`: `true` (enables synthetic fallback data)

---

## 5. Demo Personas & Login

The `/login` screen provides one-click instant authentication for 7 prototype roles:

1. **Ministry Executive**: `ministry.exec@demo.coal.gov.in`
2. **CIL Executive Management**: `cil.director@demo.coalindia.in`
3. **CMPDI Nodal Expert**: `cmpdi.nodal@demo.cmpdi.co.in`
4. **Subsidiary Manager (ECL)**: `ecl.gm@demo.ecl.gov.in`
5. **Parliamentary Query Cell**: `parliament.cell@demo.coal.gov.in`
6. **Field / Mine Data Officer**: `rajmahal.officer@demo.ecl.gov.in`
7. **System Administrator**: `sysadmin@demo.cmpdi.co.in`

Every demo account operates in isolated data scopes and is watermarked with `DEMO ACCOUNT — SYNTHETIC DATA`.

---

## 6. Testing & Quality Verification

```bash
# Run unit and integration tests
npm run test

# Run TypeScript type check
npm run typecheck

# Build production bundle
npm run build
```

---

## 7. Deployment Summary

The application is optimized for deployment on **Vercel**:
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- SPA Routing: Handled via `vercel.json` rewrites

Refer to `vercel-deployment.md` for complete environment configuration.
