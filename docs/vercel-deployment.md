# MineSetu AI — Vercel Deployment & Runtime Architecture Guide

> **STATUS**: APPROVED MASTER DEPLOYMENT SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **DETECTED STACK**: React 19 + TypeScript + Vite  
> **TARGET PLATFORM**: Vercel (Edge Network + Serverless Functions)  
> **CANONICAL LOCATION**: `docs/vercel-deployment.md`

---

## 1. Verified Repository Build Baseline

An inspection and live build verification conducted in October 2026 confirms the exact build parameters:

- **Frontend Framework**: React 19 (`19.2.8`), TypeScript (`~6.0.2`), Vite (`^8.3.0`).
- **Verified Build Command**: `npm --prefix frontend run build` (runs `tsc -b && vite build`).
- **Verified Output Directory**: `frontend/dist/`.
- **Measured Build Time**: $\approx 255\text{ms}$ with zero errors.
- **Root Proxy Manifest**: The root `package.json` provides scripts that delegate directly to `frontend`:
  - `"dev"`: `npm --prefix frontend run dev`
  - `"build"`: `npm --prefix frontend run build`
  - `"typecheck"`: `npm --prefix frontend run build`
  - `"test"`: `node --test tests/unit/rbac.test.mjs`

---

## 2. Vercel Configuration & Routing Architecture

### 2.1 SPA Rewrite Configuration (`vercel.json`)
Because MineSetu AI is a client-routed Single-Page Application (SPA) with routes such as `/dashboard`, `/documents`, and `/login`, all incoming HTTP requests must be rewritten to `/index.html` so that the client router resolves the URL without returning a 404 error:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

*Note: Verified in both root `vercel.json` and `frontend/vercel.json`.*

### 2.2 Recommended Vercel Project Settings
When importing the repository into the Vercel Dashboard:
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` *(Alternative: Set Root to `./` and rely on root `package.json` proxy scripts)*
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `20.x` or `22.x`

---

## 3. Serverless & Runtime Constraints

Deploying on Vercel requires understanding specific architectural boundaries:

| Dimension | Vercel Serverless Limit | Technical Impact & Mitigation |
|---|---|---|
| **Function Execution Timeout** | 10 seconds (Hobby) / 15–60 seconds (Pro) | Synchronous API calls must execute in $<3$ seconds. Heavy document OCR or table extraction must be offloaded to an asynchronous background worker or handled via pre-processed mock pipelines. |
| **Request Payload Size** | 4.5 MB Maximum | Uploading 10MB PDF returns directly through a Vercel serverless function will fail with HTTP 413. **Mitigation**: Use **Pre-Signed Direct Upload URLs** directly from browser to object storage (S3 / Supabase Storage), bypassing serverless function memory entirely. |
| **Filesystem Durability** | Ephemeral (`/tmp` is temporary and wiped) | **Zero Durable Local Storage**. Uploaded PDF documents, extracted field caches, and generated Word/Excel reports must be stored in external cloud object storage, never on the local disk. |
| **Stateless Concurrency** | Each request spawns an isolated container | In-memory variables are lost between requests. All state must reside in PostgreSQL, Redis, or client sessions. |

---

## 4. Environment Variables on Vercel

Configure these variables in the Vercel Dashboard (`Settings > Environment Variables`):

| Variable Name | Environment Scope | Exposure | Purpose |
|---|---|---|---|
| `VITE_APP_ENV` | Production, Preview, Dev | Browser (Public) | Set to `production` or `preview`. |
| `VITE_APP_DEMO_MODE` | Production, Preview, Dev | Browser (Public) | Set to `true` to enable synthetic fallback data. |
| `VITE_SUPABASE_URL` | Production, Preview, Dev | Browser (Public) | Public Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Dev | Browser (Public) | Public anonymous key protected by database RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | **Server Only** | Server-side key for edge functions (Never in browser). |
| `GROK_API_KEY_PRIMARY` | Production, Preview, Dev | **Server Only** | Primary xAI Grok inference token. |
| `GROK_API_KEY_FALLBACK` | Production, Preview, Dev | **Server Only** | Backup xAI token for failover on rate limits. |

---

## 5. External Worker & Storage Strategy (When Needed)

If document extraction requirements exceed Vercel's 10-second serverless execution limits, deploy an external asynchronous task worker:

```text
Browser Client ──> Requests Presigned Upload URL ──> Vercel API Route
     │                                                     │
     ▼                                                     ▼
Direct S3 Upload (Bypasses Vercel 4.5MB limit)     Returns Signed S3 URL
     │
     ▼
S3 Object Created Trigger
     │
     ▼
External Background Worker (AWS Lambda / Google Cloud Run / Celery)
     - Runs Heavy OCR (Tesseract / Textract / Poppler)
     - Extracts tables & mining fields
     - Writes extracted fields to PostgreSQL
     - Updates status: 'needs_review'
     │
     ▼
Vercel API & Browser Client (Realtime Notification / Polling)
```

---

## 6. Step-by-Step Deployment Verification Guide

### Step 1: Local Build Validation
Before pushing to git, verify that the local build and tests pass:
```bash
# From repository root
npm test
npm --prefix frontend run build
```

### Step 2: Push to Git Repository
Push commits to the tracked branch:
```bash
git push origin main
```

### Step 3: Vercel Preview Deployment
1. Connect repository in Vercel.
2. Ensure environment variables are populated from `.env.example`.
3. Trigger Preview Deployment.
4. Verify landing page renders, disclaimer banner appears, and demo logins route cleanly to `/dashboard`.

### Step 4: Production Rollout & Health Check
1. Promote preview deployment to Production.
2. Verify that `/dashboard`, `/documents`, `/reports`, `/topics`, and `/login` load directly on hard refresh (verifying SPA rewrites).
3. Test PDF generation in Reports view.
4. Validate responsive display across desktop and mobile viewports.

---

## 7. Rollback & Troubleshooting Procedures

- **Problem: Direct URL Refresh Returns 404 (e.g. `/dashboard`)**:
  - *Cause*: Missing or misconfigured rewrite in `vercel.json`.
  - *Remedy*: Confirm `vercel.json` contains `"source": "/(.*)", "destination": "/index.html"`.
- **Problem: Build Fails with TypeScript Errors (`tsc -b`)**:
  - *Cause*: Unresolved type mismatch in `frontend/src/`.
  - *Remedy*: Run `npm --prefix frontend run build` locally to reproduce and fix type errors before deploying.
- **Problem: Instant Rollback**:
  - Use Vercel Dashboard (`Deployments > Instant Rollback`) to immediately restore the previous functional deployment artifact in $<5$ seconds.
